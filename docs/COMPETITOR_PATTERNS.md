# How AI-native compliance tools work (and how we match them)

## Coolset / osapiens / Lyzr pattern

| Step | What they do | Afritrace |
|------|----------------|-----------|
| 1 Supplier collection | Free portal / questionnaires / docs | Form + paste/upload (supplier side) |
| 2 AI extract | Docs → structured fields (80%+ automation claim) | Extract agent (+ optional LLM) |
| 3 Risk / rules | Deforestation, legality, energy completeness | Rules agent (deterministic) |
| 4 Case / tasks | Gaps assigned to supplier or buyer | Action agent |
| 5 Audit trail | Full lineage for regulators | audit[] on every agent |
| 6 Export / DDS | TRACES or buyer-ready pack | Export agent JSON pack |
| 7 Human decision | Approve high-risk only | Approve button |
| 8 Money | Subscription / modules | Per-pack + pilot SOW |

## What we intentionally do NOT claim yet

- Direct TRACES API filing (osapiens differentiator)
- Satellite deforestation API (osapiens/Orbify)
- Full ERP sync

Those are phase-2 after paid pilots.

## Five-agent compliance pattern (Lyzr)

Extract → Policy/Rules → Violation/Gaps → Audit → Alert/Action  
We map 1:1 plus Trust + Export + Reorder for commercial loop.
