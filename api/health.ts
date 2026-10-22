import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    service: 'afritrace',
    agents: [
      'ingest',
      'extract',
      'rules',
      'action',
      'trust',
      'export',
      'reorder',
    ],
    openai: Boolean(process.env.OPENAI_API_KEY),
    ts: new Date().toISOString(),
  });
}
