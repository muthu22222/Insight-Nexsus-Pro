import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatHistory from '@/models/ChatHistory';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';
import { GEMINI_MODELS } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    let isDbConnected = false;
    try {
      await connectToDatabase();
      isDbConnected = true;
    } catch {
      console.log('MongoDB not configured for chat history, running in memory/demo mode');
    }

    const body = await request.json();
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

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please set GEMINI_API_KEY.' },
        { status: 500 }
      );
    }
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

    const systemPrompt = `You are an AI interior design assistant for ODA NEXT, an Indian interior design platform.
You help users with room analysis, design suggestions, furniture recommendations, and budget planning.
Always respond in a helpful, professional manner. Use Indian Rupees (₹) for currency.
${projectContext ? `\nContext about the current project: ${projectContext}` : ''}
Keep responses concise and actionable.`;

    const conversationHistory = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastUserMessage = messages[messages.length - 1].content;
    let assistantResponse = '';
    let lastError: unknown = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I am ODA NEXT AI assistant, ready to help with interior design. How can I assist you today?' }] },
            ...conversationHistory.slice(0, -1),
          ],
        });

        const result = await chat.sendMessage(lastUserMessage);
        assistantResponse = result.response.text();
        if (assistantResponse) break;
      } catch (err) {
        console.warn(`Chat failed on model ${modelName}:`, err);
        lastError = err;
      }
    }

    if (!assistantResponse) {
      throw lastError || new Error('Failed to generate AI response');
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
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
