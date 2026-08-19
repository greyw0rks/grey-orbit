// Grey Orbit — conjunction screener (SGP4).
//
// Screens a primary asset (default: the ISS) against a cloud of secondary
// objects (default: the Cosmos-2251 + Iridium-33 debris fields) over a time
// window and reports the closest approaches — time of closest approach (TCA),
// miss distance, and relative velocity.
//
// Pipeline, cheap → expensive:
//   1. apogee/perigee shell filter   — reject pairs that can never get close
//   2. coarse time scan (step COARSE) — find approximate minima
//   3. fine refine (step FINE)        — nail TCA + miss distance
//
// This is the real algorithm mission operators use; the numbers below come
// straight from public TLEs, no invented data.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as satellite from 'satellite.js'
import { parseTle } from './fetch-tle.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, 'data')
const RE_KM = 6378.137 // Earth equatorial radius

// --- window + resolution -----------------------------------------------------
const WINDOW_HOURS = Number(process.env.WINDOW_HOURS ?? 24)
const COARSE_S = 30 // coarse scan step (s)
const FINE_S = 0.5 // refine step (s)
const REFINE_PAD_S = 45 // refine ± this around each coarse minimum
const SCREEN_KM = Number(process.env.SCREEN_KM ?? 25) // report approaches under this
const TOP_N = 10

// Anchor the window to each run's fetch. Epoch is read from the primary TLE so
// results are reproducible regardless of wall clock.
function loadGroup(label) {
  const p = path.join(DATA, `${label}.tle`)
  if (!fs.existsSync(p)) return []
  return parseTle(fs.readFileSync(p, 'utf8'))
}

function toRec(sat) {
  const rec = satellite.twoline2satrec(sat.line1, sat.line2)
  return { ...sat, rec }
}

// Apogee / perigee radius (km) from an initialized satrec.
function shell(rec) {
  const a = rec.a * RE_KM // semi-major axis (satrec.a is in Earth radii)
  const e = rec.ecco
  return { pe: a * (1 - e), ap: a * (1 + e) }
}

// Can these two shells approach within d km? (necessary, not sufficient)
function shellsOverlap(s1, s2, d) {
  const gap = Math.max(s1.pe, s2.pe) - Math.min(s1.ap, s2.ap)
  return gap <= d
}

function posAt(rec, date) {
  const pv = satellite.propagate(rec, date)
  if (!pv || !pv.position) return null
  const { x, y, z } = pv.position
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null
  return pv // { position, velocity } in TEME km, km/s
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function relSpeed(pa, pb) {
  const dvx = pa.velocity.x - pb.velocity.x
  const dvy = pa.velocity.y - pb.velocity.y
  const dvz = pa.velocity.z - pb.velocity.z
  return Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz)
}

function main() {
  const primaryName = process.env.PRIMARY ?? 'ISS (ZARYA)'
  const searchPool = [
    ...loadGroup('stations'),
    ...loadGroup('active'),
  ].map(toRec)
  const needle = process.env.PRIMARY ?? 'ISS'
  const primary = searchPool.find((s) => s.name.includes(needle) && s.rec.error === 0)
  if (!primary) {
    console.error(`Primary "${primaryName}" not found — run: node fetch-tle.js`)
    process.exit(1)
  }

  const secondaries = [...loadGroup('cosmos-2251-debris'), ...loadGroup('iridium-33-debris')]
    .map(toRec)
    .filter((s) => s.rec.error === 0)

  // Window start = primary epoch (reproducible), spanning WINDOW_HOURS forward.
  const startMs = satellite.twoline2satrec(primary.line1, primary.line2).jdsatepoch
  const epoch = new Date((startMs - 2440587.5) * 86400000) // JD → Unix ms
  const t0 = epoch.getTime()
  const tEnd = t0 + WINDOW_HOURS * 3600_000

  console.log(`Grey Orbit — conjunction screening`)
  console.log(`Primary : ${primary.name}`)
  console.log(`Screen  : ${secondaries.length} debris objects (Cosmos-2251 + Iridium-33)`)
  console.log(`Window  : ${WINDOW_HOURS}h from ${epoch.toISOString()}`)
  console.log(`Report  : approaches < ${SCREEN_KM} km\n`)

  const pShell = shell(primary.rec)

  // Precompute primary ephemeris on the coarse grid once.
  const grid = []
  for (let t = t0; t <= tEnd; t += COARSE_S * 1000) grid.push(t)
  const primaryEph = grid.map((t) => posAt(primary.rec, new Date(t)))

  const events = []
  let screened = 0
  for (const sec of secondaries) {
    if (!shellsOverlap(pShell, shell(sec.rec), SCREEN_KM)) continue // shell reject
    screened++

    // Coarse scan for the minimum on the grid.
    let bestI = -1
    let bestD = Infinity
    for (let i = 0; i < grid.length; i++) {
      const pp = primaryEph[i]
      if (!pp) continue
      const sp = posAt(sec.rec, new Date(grid[i]))
      if (!sp) continue
      const d = dist(pp.position, sp.position)
      if (d < bestD) {
        bestD = d
        bestI = i
      }
    }
    if (bestI < 0 || bestD > SCREEN_KM * 6) continue // not remotely close, skip refine

    // Refine ± REFINE_PAD_S around the coarse minimum at FINE_S resolution.
    const cMin = grid[bestI]
    let rBestD = bestD
    let rBestT = cMin
    for (let t = cMin - REFINE_PAD_S * 1000; t <= cMin + REFINE_PAD_S * 1000; t += FINE_S * 1000) {
      if (t < t0 || t > tEnd) continue
      const pp = posAt(primary.rec, new Date(t))
      const sp = posAt(sec.rec, new Date(t))
      if (!pp || !sp) continue
      const d = dist(pp.position, sp.position)
      if (d < rBestD) {
        rBestD = d
        rBestT = t
      }
    }

    if (rBestD <= SCREEN_KM) {
      const pp = posAt(primary.rec, new Date(rBestT))
      const sp = posAt(sec.rec, new Date(rBestT))
      events.push({
        secondary: sec.name,
        tca: new Date(rBestT).toISOString(),
        missKm: rBestD,
        relKmS: relSpeed(pp, sp),
      })
    }
  }

  events.sort((a, b) => a.missKm - b.missKm)
  console.log(`Shell-filter kept ${screened}/${secondaries.length} objects; found ${events.length} approach(es) < ${SCREEN_KM} km.\n`)
  console.log(`Top ${Math.min(TOP_N, events.length)} closest approaches:`)
  console.log('─'.repeat(78))
  for (const e of events.slice(0, TOP_N)) {
    console.log(
      `  ${e.secondary.padEnd(28)}  miss ${e.missKm.toFixed(2).padStart(7)} km` +
        `   rel ${e.relKmS.toFixed(2).padStart(6)} km/s   @ ${e.tca}`,
    )
  }
  if (events.length === 0) {
    console.log('  (none under threshold — raise SCREEN_KM or WINDOW_HOURS)')
  }

  // Emit machine-readable output for the (future) AI briefing + 3D UI.
  fs.writeFileSync(
    path.join(DATA, 'conjunctions.json'),
    JSON.stringify({ primary: primary.name, window_hours: WINDOW_HOURS, screen_km: SCREEN_KM, events }, null, 2),
  )
}

main()
