/**
 * POST /api/run-agents
 * Body: OrchestratorInput JSON
 * Returns: PassportState
 *
 * Deploy as Vercel serverless. Wire OPENAI_API_KEY for LLM extract later.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runPipeline } from '../agents/orchestrator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body?.supplier || !body?.buyer || !body?.product || !body?.rawText) {
      return res.status(400).json({
        error: 'supplier, buyer, product, rawText required',
      });
    }

    const passport = await runPipeline({
      supplier: body.supplier,
      buyer: body.buyer,
      product: body.product,
      originCountry: body.originCountry || body.origin_country || 'XX',
      quantity: body.quantity,
      productionDate: body.productionDate || body.production_date,
      lat: body.lat != null ? Number(body.lat) : undefined,
      lon: body.lon != null ? Number(body.lon) : undefined,
      rawText: body.rawText || body.raw_text || '',
      documentIds: body.documentIds,
    });

    return res.status(200).json(passport);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Pipeline failed';
    return res.status(500).json({ error: msg });
  }
}
