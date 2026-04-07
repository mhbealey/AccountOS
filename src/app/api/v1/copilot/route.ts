import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT =
  'You are an AI copilot for AccountOS, a cyber security account management platform. Help the user analyze their client portfolio, suggest actions, and provide insights.';

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      const fallback =
        'The AI Copilot is not configured yet. Please set the ANTHROPIC_API_KEY environment variable to enable AI-powered assistance. In the meantime, you can navigate the app using the sidebar or command palette (Cmd+K / Ctrl+K).';

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(fallback));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const client = new Anthropic();

    const anthropicStream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              );
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}
