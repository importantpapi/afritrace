/**
 * Optional LLM extract — only fills ExtractedFields schema.
 * Never decides compliance. Requires OPENAI_API_KEY.
 */
import type { ExtractedFields, AgentContext } from './types';
import { extractFields } from './extract';

const SCHEMA_HINT = `{
  "lat": number | null,
  "lon": number | null,
  "origin_cert": string | null,
  "registration": string | null,
  "electricity_kwh": string | null,
  "gas_m3": string | null,
  "coal_tonnes": string | null,
  "production_tonnes": string | null,
  "deforestation_free": boolean | null,
  "mine_coc": boolean | null,
  "production_date": string | null
}`;

export async function llmExtractFields(
  text: string,
  ctx: AgentContext
): Promise<ExtractedFields> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return extractFields(text, ctx);
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Extract compliance fields from supplier documents. Return only JSON matching the schema. Do not invent values. Use null if missing. Schema: ' +
              SCHEMA_HINT,
          },
          {
            role: 'user',
            content: `Product: ${ctx.product}\nCountry: ${ctx.originCountry}\nText:\n${text.slice(0, 12000)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return extractFields(text, ctx);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const f: ExtractedFields = {};
    if (typeof parsed.lat === 'number') f.lat = parsed.lat;
    if (typeof parsed.lon === 'number') f.lon = parsed.lon;
    if (typeof parsed.origin_cert === 'string') f.origin_cert = parsed.origin_cert;
    if (typeof parsed.registration === 'string') f.registration = parsed.registration;
    if (typeof parsed.electricity_kwh === 'string')
      f.electricity_kwh = parsed.electricity_kwh;
    if (typeof parsed.gas_m3 === 'string') f.gas_m3 = parsed.gas_m3;
    if (typeof parsed.coal_tonnes === 'string') f.coal_tonnes = parsed.coal_tonnes;
    if (typeof parsed.production_tonnes === 'string')
      f.production_tonnes = parsed.production_tonnes;
    if (typeof parsed.deforestation_free === 'boolean')
      f.deforestation_free = parsed.deforestation_free;
    if (typeof parsed.mine_coc === 'boolean') f.mine_coc = parsed.mine_coc;
    if (typeof parsed.production_date === 'string')
      f.production_date = parsed.production_date;

    // Merge deterministic fallback for anything still empty
    const det = extractFields(text, ctx);
    return { ...det, ...f };
  } catch {
    return extractFields(text, ctx);
  }
}
