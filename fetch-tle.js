// Grey Orbit — TLE fetcher.
//
// Pulls two-line element sets from Celestrak for a set of catalog groups and
// caches them to disk. Uses Node's HTTPS stack (curl's DNS is flaky in this
// sandbox) with retries + a simple backoff.

import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = path.join(__dirname, 'data')

// Groups chosen to actually produce close approaches: the ISS + the two big
// debris clouds (2009 Iridium-Cosmos collision, 2007 Fengyun-1C ASAT test)
// that dominate real LEO conjunction alerts.
const GROUPS = {
  stations: 'stations',
  'iridium-33-debris': 'iridium-33-debris',
  'cosmos-2251-debris': 'cosmos-2251-debris',
  'fengyun-1c-debris': '1999-025', // Fengyun-1C debris intl-designator group
  active: 'active',
}

function get(url, tries = 5) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      https
        .get(url, { timeout: 20_000 }, (res) => {
          if (res.statusCode !== 200) {
            res.resume()
            return retry(new Error(`HTTP ${res.statusCode}`), n)
          }
          let body = ''
          res.on('data', (c) => (body += c))
          res.on('end', () => resolve(body))
        })
        .on('error', (e) => retry(e, n))
        .on('timeout', function () {
          this.destroy(new Error('timeout'))
        })
    }
    const retry = (err, n) => {
      if (n >= tries) return reject(err)
      setTimeout(() => attempt(n + 1), 1500 * (n + 1))
    }
    attempt(0)
  })
}

export async function fetchGroup(group) {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`
  return get(url)
}

// Parse a raw TLE blob into [{ name, line1, line2 }].
export function parseTle(raw) {
  const lines = raw.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.length > 0)
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('1 ') && lines[i + 1]?.startsWith('2 ')) {
      // name is the preceding non-TLE line, if present
      const name = i > 0 && !lines[i - 1].startsWith('1 ') && !lines[i - 1].startsWith('2 ')
        ? lines[i - 1].trim()
        : `UNNAMED-${lines[i].slice(2, 7).trim()}`
      out.push({ name, line1: lines[i], line2: lines[i + 1] })
      i++
    }
  }
  return out
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
  for (const [label, group] of Object.entries(GROUPS)) {
    try {
      const raw = await fetchGroup(group)
      const sats = parseTle(raw)
      fs.writeFileSync(path.join(CACHE_DIR, `${label}.tle`), raw)
      console.log(`  ${label.padEnd(22)} ${String(sats.length).padStart(5)} objects`)
    } catch (e) {
      console.log(`  ${label.padEnd(22)} FAILED: ${e.message}`)
    }
  }
  console.log(`\nCached to ${CACHE_DIR}`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
