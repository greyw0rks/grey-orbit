# Grey Orbit — AI-Powered Orbital Conjunction Assessment

**IBM AI Builders Challenge · August 2026 · Space Exploration**

Grey Orbit is an AI-powered orbital collision avoidance system for satellite operators. It uses real-time TLE data from Celestrak, SGP4 propagation to compute close approaches, and **IBM watsonx.ai (Granite)** to generate plain-language operator briefings that recommend maneuver options.

**Demo:** https://grey-orbit.vercel.app

---

## Problem Statement

Low Earth Orbit is becoming dangerously congested. With over 16,000 active satellites and hundreds of thousands of debris fragments (notably from the 2009 Iridium-33 × Cosmos-2251 collision and the 2007 Fengyun-1C ASAT test), operators face a growing conjunction alert workload. Each alert requires an operator to:

1. Pull the TLE data for both objects
2. Run SGP4 propagation to find the time of closest approach (TCA) and miss distance
3. Assess collision risk and decide whether to maneuver
4. If maneuvering, compute the delta-v required

This is time-intensive, requires orbital mechanics expertise, and delays are costly — satellites move at ~7.8 km/s, so a missed alert can mean collision.

## Solution Description

Grey Orbit automates the entire conjunction assessment pipeline:

1. **Live TLE ingestion** — fetches current two-line element sets from Celestrak for a primary asset (e.g., IRIDIUM 106) and a debris cloud (Cosmos-2251 + Iridium-33 fragments)
2. **SGP4 propagation** — computes orbital positions over a time window (24–72 hours), filters by apogee/perigee shells, scans at 30s resolution, refines at 0.5s resolution to find TCA + miss distance + relative velocity
3. **AI operator briefing** — feeds the top close approaches to **IBM watsonx.ai (Granite)**, which generates a plain-language brief: risk assessment (CRITICAL/HIGH/MODERATE/LOW), identifies the debris cloud context, and recommends maneuver options (e.g., "consider radial boost +2 m/s to increase perigee 5 km")
4. **3D orbital visualization** — displays the primary asset, debris field, and close approaches with color-coded risk indicators

The AI advises; the operator still makes the final call. **Human-in-the-loop by design.**

**Real demo scenario** (proven 2026-07-20 with live TLEs):
- Primary: **IRIDIUM 106** (operational Iridium NEXT satellite, 780 km altitude)
- Debris: Cosmos-2251 + Iridium-33 fragments (703 objects)
- Result: **12 approaches < 25 km in 72h; closest 10.25 km @ 13.86 km/s**
- Narrative: The replacement constellation still threading through the debris of the collision that killed its predecessor.

---

## AI Approach and Architecture

**Model:** Pluggable via a provider adapter (`lib/ai.ts`). Set `AI_PROVIDER=watsonx` to use **IBM watsonx.ai (Granite 3 8B Instruct)**, or leave default `anthropic` for a Claude-compatible API.

**Architecture:**

```
TLE fetch (Celestrak)  →  SGP4 propagation (satellite.js)  →  conjunctions.json
                                                                    │
                                                                    ▼
                                               GET /api/briefing  ← load conjunctions.json
                                                    │  feed top 5 events to AI
                                                    ▼
                          IBM watsonx.ai (Granite) / Claude  →  operator briefing (plain text)
                                                    │
                                                    ▼
                                          Next.js frontend  →  risk badge + briefing + 3D viz
```

**Grounded, not generative guesswork:**
- The AI receives **real computed data**: miss distances, relative velocities, TCA timestamps, object names
- It does NOT invent collision probabilities — TLEs lack covariance matrices (CDMs), so true Pc computation requires Celestrak SOCRATES or similar
- Recommendations are **decision support** (maneuver options + rough delta-v), NOT flight-ready commands

**Structured output:**
The system prompt instructs the model to return:
1. RISK ASSESSMENT: [level] + reason
2. PRIMARY ASSET: name + altitude
3. TOP THREATS: 2-3 closest with details
4. CONTEXT: debris cloud provenance (2009 collision, etc.)
5. RECOMMENDATION: maneuver options or "monitor, no action yet"

If the AI is unavailable, the route degrades gracefully to a MODERATE risk assessment with the raw data.

**Stack:** Next.js 15 (App Router), TypeScript, TailwindCSS, satellite.js (SGP4), Node.js HTTPS for TLE fetching (curl DNS is flaky in some environments).

---

## Selected Challenge Theme

**Space Exploration.** Grey Orbit solves a critical space operations problem: preventing collisions in increasingly congested orbital corridors. It uses real orbital mechanics (SGP4), real data (Celestrak TLEs), and AI to turn raw conjunction alerts into actionable operator briefings.

---

## How IBM Bob Was Used

IBM Bob was the primary development tool for Grey Orbit. Specific contributions:

1. **Next.js application scaffolding** — Bob set up the TypeScript + App Router structure, API routes, and Tailwind configuration
2. **AI provider adapter** — Bob ported the Grey (payroll project) AI adapter pattern to Grey Orbit, adding watsonx.ai IAM token caching and the Granite chat endpoint
3. **Briefing API route** (`app/api/briefing/route.ts`) — Bob designed the system prompt, structured the conjunction data feed, and implemented the graceful degradation logic
4. **Frontend UI** — Bob built the responsive dashboard with risk badges, AI briefing display, conjunction table, and 2D orbital visualization
5. **README sections** — Bob drafted the problem statement, solution, and AI architecture sections, ensuring IBM requirements (problem/solution/AI approach/theme/Bob usage) were met

Bob's conversational interface made it easy to iterate on the prompt engineering (the operator briefing format evolved through 3 versions) and quickly test end-to-end flows.

---

## Run It Locally

```bash
npm install

# 1. Fetch live TLE data from Celestrak
npm run fetch

# 2. Run SGP4 conjunction screening (default: ISS, 24h window, 25km threshold)
#    Or specify a different primary and parameters:
PRIMARY="IRIDIUM 106" WINDOW_HOURS=72 SCREEN_KM=25 npm run screen

# 3. Configure AI provider in .env.local (copy from .env.example)
#    For watsonx: AI_PROVIDER=watsonx + WATSONX_API_KEY + WATSONX_PROJECT_ID
#    For Claude: ANTHROPIC_API_KEY (AI_PROVIDER defaults to anthropic)

# 4. Start the web app
npm run dev
```

Open http://localhost:3000. The app will auto-fetch the AI briefing and display:
- Risk badge (CRITICAL/HIGH/MODERATE/LOW)
- AI-generated operator briefing
- Top 10 close approaches in a table
- 2D orbital visualization showing primary, debris field, and red-highlighted close approaches

---

## Demo Script (≤ 3 min)

1. **Hook (0:00–0:20):** "16,000 satellites. Hundreds of thousands of debris fragments. Operators drowning in conjunction alerts. Grey Orbit uses AI to turn raw orbital data into actionable briefings."

2. **Show the data (0:20–0:40):** Terminal: `npm run fetch && npm run screen`. Highlight the output — "12 approaches < 25 km in 72h, closest 10.25 km."

3. **Show the AI briefing (0:40–2:00):** Open the web app. Walk through:
   - CRITICAL risk badge (closest approach 10.25 km)
   - AI briefing: "Primary asset IRIDIUM 106 faces high conjunction risk from Cosmos-2251 debris..."
   - Recommendation: "Consider radial maneuver +2 m/s"
   - Debris context: "2009 Iridium-Cosmos collision debris cloud"

4. **Show the visualization (2:00–2:20):** 2D orbital view with red-highlighted close approaches. Point out the primary (green), debris field (gray), and close approaches (red circles).

5. **Technical credibility (2:20–2:40):** "This is real SGP4 propagation from live Celestrak TLEs. The numbers are grounded — no invented collision probabilities. AI provides decision support; the operator still commands the maneuver."

6. **Close (2:40–3:00):** "Built with IBM watsonx.ai (Granite) and IBM Bob. Grey Orbit: AI-powered collision avoidance for the most congested environment humans have ever operated in. Repo: github.com/greyw0rks/grey-orbit."

---

## Technical Notes

- **Collision probability (Pc):** TLEs lack covariance matrices, so true Pc requires Celestrak SOCRATES CDMs or similar. Grey Orbit flags this limitation and labels computed miss distances as illustrative.
- **Maneuver recommendations:** AI suggests options + rough delta-v estimates. These are NOT flight-ready commands — operators must validate with mission planning tools.
- **Debris cloud provenance:** The 2009 Iridium-33 × Cosmos-2251 collision produced ~2,000 trackable fragments. The 2007 Fengyun-1C ASAT test produced ~3,000. Both clouds orbit at 790–810 km, intersecting the Iridium NEXT constellation.

---

## License

MIT

---

## Contact

Built by greyw0rks for the IBM AI Builders Challenge (August 2026, Space Exploration track).

**Repo:** https://github.com/greyw0rks/grey-orbit  
**Challenge:** https://ibm.biz/ai-builders-challenge
