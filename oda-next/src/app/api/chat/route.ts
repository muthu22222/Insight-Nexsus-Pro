import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatHistory from '@/models/ChatHistory';
import Project from '@/models/Project';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticate } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    await connectToDatabase();

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

    let projectContext = '';
    if (projectId) {
      const project = await Project.findOne({
        _id: projectId,
        userId: payload.userId,
      });
      if (project) {
        projectContext = `Current project: ${project.name}. Room type: ${project.roomAnalysis?.roomType || 'Unknown'}. Budget: ₹${project.budgetPlan?.totalBudget || 0}.`;
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are an AI interior design assistant for ODA NEXT, an Indian interior design platform.
You help users with room analysis, design suggestions, furniture recommendations, and budget planning.
Always respond in a helpful, professional manner. Use Indian Rupees (₹) for currency.
${projectContext ? `\nContext about the current project: ${projectContext}` : ''}
Keep responses concise and actionable.`;

    const conversationHistory = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ODA NEXT AI assistant, ready to help with interior design. How can I assist you today?' }] },
        ...conversationHistory.slice(0, -1),
      ],
    });

    const lastUserMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastUserMessage);
    const assistantResponse = result.response.text();

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

    return NextResponse.json({
      success: true,
      data: {
        response: assistantResponse,
        chatId: chatSession._id,
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
