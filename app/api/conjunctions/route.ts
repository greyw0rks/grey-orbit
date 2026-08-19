// Conjunction data API route - serves the screen.js output

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'conjunctions.json')

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({
        error: 'No conjunction data found. Run: npm run fetch && npm run screen'
      }, { status: 404 })
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
