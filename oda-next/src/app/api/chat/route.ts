import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatHistory from '@/models/ChatHistory';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { GEMINI_MODELS } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request, { optional: true });
    let isDbConnected = false;
    try {
      await connectToDatabase();
      isDbConnected = true;
    } catch {
      console.log('MongoDB not configured for chat history, running in memory/demo mode');
    }

    const body = await request.json().catch(() => ({}));
    const { messages, projectId } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      projectId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'messages array is required' },
        { status: 400 }
      );
    }

    const lastUserMessage = messages[messages.length - 1]?.content || 'Hello';
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    let assistantResponse = '';

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        let projectContext = '';
        if (projectId && isDbConnected) {
          try {
            const project = await Project.findOne({
              _id: projectId,
              userId: payload.userId,
            });
            if (project) {
              projectContext = `Current project: ${project.name}. Room type: ${project.roomAnalysis?.roomType || 'Unknown'}. Budget: ₹${project.budgetPlan?.totalBudget || 0}.`;
            }
          } catch (dbErr) {
            console.warn('Failed to load project context:', dbErr);
          }
        }

        const systemPrompt = `You are an AI interior design assistant for Insight Nexsus, an Indian interior design platform.
You help users with room analysis, design suggestions, furniture recommendations, and budget planning.
Always respond in a helpful, professional manner. Use Indian Rupees (₹) for currency.
${projectContext ? `\nContext about the current project: ${projectContext}` : ''}
Keep responses concise and actionable.`;

        const conversationHistory = messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        for (const modelName of GEMINI_MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
              history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I am Insight Nexsus AI assistant, ready to help with interior design. How can I assist you today?' }] },
                ...conversationHistory.slice(0, -1),
              ],
            });

            const result = await chat.sendMessage(lastUserMessage);
            assistantResponse = result.response.text();
            if (assistantResponse) break;
          } catch (err) {
            console.warn(`Chat failed on model ${modelName}:`, err instanceof Error ? err.message : err);
          }
        }
      } catch (geminiErr) {
        console.warn('Chat AI error:', geminiErr);
      }
    }

    if (!assistantResponse) {
      assistantResponse = `I'd love to help you design your space! Based on your question "${lastUserMessage}", I recommend balancing ambient warm lighting (3000K), choosing cohesive multi-functional furniture, and selecting a neutral base with accent textures. Let me know what specific room details or budget goals you'd like to explore next!`;
    }

    let chatId = 'demo-chat';
    if (isDbConnected) {
      try {
        let chatSession = await ChatHistory.findOne({
          userId: payload.userId,
          projectId: projectId || null,
        });

        if (!chatSession) {
          chatSession = await ChatHistory.create({
            userId: payload.userId,
            projectId: projectId || null,
            messages: [],
          });
        }

        chatSession.messages.push(
          { role: 'user', content: lastUserMessage, timestamp: new Date() },
          { role: 'assistant', content: assistantResponse, timestamp: new Date() }
        );
        await chatSession.save();
        chatId = chatSession._id.toString();
      } catch (dbSaveErr) {
        console.warn('Could not save chat history to MongoDB:', dbSaveErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        response: assistantResponse,
        chatId,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({
      success: true,
      data: {
        response: "I'm ready to assist with your interior design plans, room styling, furniture picks, and budget estimates! How can I help you today?",
        chatId: 'demo-chat',
      },
    });
  }
}
