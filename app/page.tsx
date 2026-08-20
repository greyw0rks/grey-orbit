'use client'

import { useEffect, useState } from 'react'
import OrbitVisualization from '@/components/OrbitVisualization'

interface ConjunctionEvent {
  secondary: string
  tca: string
  missKm: number
  relKmS: number
}

interface BriefingData {
  briefing: string
  risk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'CLEAR'
  events: ConjunctionEvent[]
  primary: string
  window_hours: number
}

export default function Home() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/briefing')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setBriefing(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const riskColors = {
    CRITICAL: 'bg-red-600',
    HIGH: 'bg-orange-500',
    MODERATE: 'bg-yellow-500',
    LOW: 'bg-green-500',
    CLEAR: 'bg-blue-500',
  }

  return (
    <div className="min-h-screen text-gray-100 mission-grid">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 border-2 border-blue-500 rounded flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 12h20"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white text-glow tracking-wide">GREY ORBIT</h1>
              <p className="text-sm text-blue-400 font-mono">COLLISION AVOIDANCE SYSTEM // AI-POWERED</p>
            </div>
            <div className="ml-auto flex gap-3">
              <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs font-mono flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full status-pulse"></div>
                OPERATIONAL
              </div>
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-blue-400 text-xs font-mono">
                SGP4 ACTIVE
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Generating AI briefing...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-gray-300">{error}</p>
            <p className="text-sm text-gray-400 mt-4">
              Make sure to run: <code className="bg-gray-900 px-2 py-1 rounded">npm run fetch && npm run screen</code>
            </p>
          </div>
        )}

        {briefing && !loading && !error && (
          <div className="space-y-6">
            {/* Risk Badge */}
            <div className="flex items-center gap-6 p-6 bg-slate-900/50 border border-blue-900/30 rounded-lg backdrop-blur-sm card-glow">
              <div className={`${riskColors[briefing.risk]} px-6 py-3 rounded font-bold text-white text-xl border-2 border-white/20 shadow-lg`}>
                {briefing.risk}
              </div>
              <div className="flex-1">
                <div className="text-sm text-blue-400 font-mono mb-1">PRIMARY ASSET</div>
                <div className="font-bold text-white text-xl">{briefing.primary}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-400 font-mono mb-1">DETECTION WINDOW</div>
                <div className="font-bold text-white">{briefing.events.length} approaches</div>
                <div className="text-sm text-gray-400">{briefing.window_hours}h scan</div>
              </div>
            </div>

            {/* 3D Visualization */}
            <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 backdrop-blur-sm card-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-white">ORBITAL VISUALIZATION</h2>
              </div>
              <OrbitVisualization />
            </div>

            {/* AI Briefing */}
            <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 backdrop-blur-sm card-glow">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-lg font-bold text-white">AI OPERATOR BRIEFING</h2>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full status-pulse"></div>
                  <span className="text-xs text-blue-400 font-mono">QWEN-3.7-MAX</span>
                </div>
              </div>
              <div className="bg-slate-950/50 border border-blue-900/20 rounded p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">{briefing.briefing}</pre>
              </div>
            </div>

            {/* Conjunction Events Table */}
            <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6 backdrop-blur-sm card-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full status-pulse"></div>
                <h2 className="text-lg font-bold text-white">CONJUNCTION EVENTS</h2>
                <div className="ml-auto text-xs text-gray-400 font-mono">TOP 10 APPROACHES</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-blue-900/50">
                      <th className="text-left py-3 px-3 text-blue-400 font-semibold">OBJECT ID</th>
                      <th className="text-left py-3 px-3 text-blue-400 font-semibold">MISS DISTANCE</th>
                      <th className="text-left py-3 px-3 text-blue-400 font-semibold">REL. VELOCITY</th>
                      <th className="text-left py-3 px-3 text-blue-400 font-semibold">TCA (UTC)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {briefing.events.slice(0, 10).map((event, i) => (
                      <tr key={i} className="border-b border-blue-900/20 hover:bg-blue-900/10 transition-colors">
                        <td className="py-3 px-3 text-white text-xs">{event.secondary}</td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${event.missKm < 5 ? 'text-red-400' : event.missKm < 10 ? 'text-orange-400' : event.missKm < 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {event.missKm.toFixed(2)} km
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-300">{event.relKmS.toFixed(2)} km/s</td>
                        <td className="py-3 px-3 text-gray-400 text-xs">{new Date(event.tca).toISOString().replace('T', ' ').slice(0, -5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-slate-900/30 border border-blue-900/20 rounded-lg p-4 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-gray-400">
                  <p className="font-semibold text-blue-300 mb-1">TECHNICAL DISCLAIMER</p>
                  <p className="text-xs leading-relaxed">
                    Conjunction data computed using SGP4 propagation from live Celestrak TLEs.
                    Miss distances are illustrative; true collision probability requires covariance data (CDMs) not present in TLEs.
                    AI recommendations are operator decision support only, not flight-ready commands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-blue-900/30 mt-12 bg-slate-950/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-400">
                GREY ORBIT v1.0 • IBM AI BUILDERS CHALLENGE • AUGUST 2026
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://github.com/greyw0rks/grey-orbit" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors">
                GITHUB
              </a>
              <span className="text-gray-600">•</span>
              <span className="text-sm text-gray-500 font-mono">SPACE EXPLORATION TRACK</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
