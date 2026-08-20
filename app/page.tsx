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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Grey Orbit</h1>
          <p className="text-sm text-gray-400">AI-Powered Orbital Conjunction Assessment</p>
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
            <div className="flex items-center gap-4">
              <div className={`${riskColors[briefing.risk]} px-4 py-2 rounded-lg font-bold text-white`}>
                {briefing.risk}
              </div>
              <div className="text-gray-400">
                <span className="font-semibold text-white">{briefing.primary}</span> • {briefing.events.length} approaches within {briefing.window_hours}h
              </div>
            </div>

            {/* 3D Visualization */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Orbital View</h2>
              <OrbitVisualization />
            </div>

            {/* AI Briefing */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-lg font-bold text-white">AI Operator Briefing</h2>
                <span className="text-xs text-gray-500 ml-auto">Powered by Alibaba Qwen</span>
              </div>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">{briefing.briefing}</pre>
              </div>
            </div>

            {/* Conjunction Events Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Close Approaches</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">Object</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">Miss Distance</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">Rel. Velocity</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold">TCA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {briefing.events.slice(0, 10).map((event, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2 px-3 text-white font-mono text-xs">{event.secondary}</td>
                        <td className="py-2 px-3">
                          <span className={`font-semibold ${event.missKm < 10 ? 'text-red-400' : event.missKm < 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {event.missKm.toFixed(2)} km
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-300">{event.relKmS.toFixed(2)} km/s</td>
                        <td className="py-2 px-3 text-gray-400 text-xs">{new Date(event.tca).toISOString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">Technical Note</p>
              <p>
                Conjunction data computed using SGP4 propagation from live Celestrak TLEs.
                Miss distances are illustrative; true collision probability requires covariance data (CDMs) not present in TLEs.
                AI recommendations are operator decision support only, not flight-ready commands.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-12">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-gray-500">
          <p>Grey Orbit • IBM AI Builders Challenge • August 2026 • Space Exploration</p>
        </div>
      </footer>
    </div>
  )
}
