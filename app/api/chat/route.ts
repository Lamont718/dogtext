
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth-config';
import { prisma } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dogId, message } = await request.json();

    if (!dogId || !message) {
      return NextResponse.json(
        { error: 'Dog ID and message are required' },
        { status: 400 }
      );
    }

    // Get user and check subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check message limits for free tier
    if (user.subscriptionTier === 'FREE') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      let messageUsage = await prisma.messageUsage.findFirst({
        where: {
          userId: session.user.id,
          weekStartDate: startOfWeek,
        },
      });

      if (!messageUsage) {
        messageUsage = await prisma.messageUsage.create({
          data: {
            userId: session.user.id,
            weekStartDate: startOfWeek,
            messageCount: 0,
          },
        });
      }

      if (messageUsage.messageCount >= 5) {
        return NextResponse.json(
          { error: 'Weekly message limit reached. Upgrade to Premium for unlimited messages.' },
          { status: 403 }
        );
      }
    }

    // Get dog information for context
    const dog = await prisma.dog.findFirst({
      where: {
        id: dogId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Get breed information for context
    const breed = await prisma.breedProfile.findFirst({
      where: { breedName: { contains: dog.breed, mode: 'insensitive' } },
    });

    // Store user message
    await prisma.aiChatMessage.create({
      data: {
        userId: session.user.id,
        dogId,
        messageText: message,
        senderType: 'user',
      },
    });

    // Create AI context
    const dogContext = `You are ${dog.name}, a ${dog.age ? `${dog.age} ${dog.ageUnit} old` : ''} ${dog.gender || ''} ${dog.breed}. 
    ${dog.personalityTraits?.length ? `Your personality is: ${dog.personalityTraits.join(', ')}.` : ''}
    ${breed ? `As a ${dog.breed}, you have these characteristics: ${breed.temperament}` : ''}
    ${dog.healthConditions?.length ? `You have these health considerations: ${dog.healthConditions.join(', ')}.` : ''}
    
    You should respond as this specific dog would - playful, loving, and authentic to the breed characteristics. 
    Keep responses warm, personal, and appropriate for the dog's age and personality. 
    Use first person (I, me, my) and speak as the dog directly to their human.
    Keep responses to 2-3 sentences unless the human asks for more detail.`;

    const messages = [
      {
        role: 'system',
        content: dogContext,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    // Call LLM API with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('LLM API request failed');
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let aiResponse = '';

        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Store AI response in database
                  await prisma.aiChatMessage.create({
                    data: {
                      userId: session.user.id,
                      dogId,
                      messageText: aiResponse,
                      senderType: 'ai',
                      metadata: { breed: dog.breed, personality: dog.personalityTraits },
                    },
                  });

                  // Update message count for free tier
                  if (user.subscriptionTier === 'FREE') {
                    const now = new Date();
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);

                    await prisma.messageUsage.upsert({
                      where: {
                        userId_weekStartDate: {
                          userId: session.user.id,
                          weekStartDate: startOfWeek,
                        },
                      },
                      update: {
                        messageCount: { increment: 1 },
                      },
                      create: {
                        userId: session.user.id,
                        weekStartDate: startOfWeek,
                        messageCount: 1,
                      },
                    });
                  }

                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    aiResponse += content;
                  }
                  controller.enqueue(encoder.encode(chunk));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
