import { NextResponse } from 'next/server';

export async function GET() {
  const aiTxt = `# ChatCard AI Usage Policy

## Allowed Uses
- summarize: AI can summarize ChatCard content
- answer_questions: AI can answer questions about ChatCard
- link_preview: AI can generate link previews

## Disallowed Uses
- model_training: ChatCard content should not be used for model training without explicit consent

## Contact
For questions about AI usage of ChatCard content, contact: hello@chatcard.cloud
`;

  return new NextResponse(aiTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

