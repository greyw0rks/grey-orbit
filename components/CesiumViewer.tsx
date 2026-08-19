'use client'

// Simple 2D orbital visualization using Canvas
// (CesiumJS requires Ion token and is complex to set up quickly)

import { useEffect, useRef } from 'react'

interface ConjunctionEvent {
  secondary: string
  tca: string
  missKm: number
  relKmS: number
}

interface ConjunctionData {
  primary: string
  events: ConjunctionEvent[]
}

export default function CesiumViewer({ data }: { data: ConjunctionData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const earthRadius = 50
    const scale = 0.05 // km to pixels

    // Clear canvas
    ctx.fillStyle = '#030712'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw Earth
    ctx.beginPath()
    ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#1e40af'
    ctx.fill()
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw primary orbit (assume ~780km altitude like Iridium)
    const primaryOrbitRadius = earthRadius + (780 * scale)
    ctx.beginPath()
    ctx.arc(centerX, centerY, primaryOrbitRadius, 0, Math.PI * 2)
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw primary satellite
    ctx.beginPath()
    ctx.arc(centerX + primaryOrbitRadius, centerY, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#22c55e'
    ctx.fill()
    ctx.strokeStyle = '#16a34a'
    ctx.lineWidth = 2
    ctx.stroke()

    // Label primary
    ctx.fillStyle = '#fff'
    ctx.font = '12px monospace'
    ctx.fillText(data.primary, centerX + primaryOrbitRadius + 12, centerY + 4)

    // Draw debris field (scatter points around similar orbit)
    const debrisCount = Math.min(data.events.length, 50)
    for (let i = 0; i < debrisCount; i++) {
      const angle = (Math.PI * 2 * i) / debrisCount
      const radiusVariation = (Math.random() - 0.5) * 100 * scale
      const debrisRadius = primaryOrbitRadius + radiusVariation
      const x = centerX + Math.cos(angle) * debrisRadius
      const y = centerY + Math.sin(angle) * debrisRadius

      const missKm = data.events[i]?.missKm || 999
      const isClose = missKm < 15

      ctx.beginPath()
      ctx.arc(x, y, isClose ? 4 : 2, 0, Math.PI * 2)
      ctx.fillStyle = isClose ? '#ef4444' : '#6b7280'
      ctx.fill()

      // Highlight close approaches with red flash
      if (isClose) {
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.strokeStyle = '#dc2626'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Draw legend
    ctx.fillStyle = '#fff'
    ctx.font = '11px monospace'
    ctx.fillText('🟢 Primary Asset', 20, 30)
    ctx.fillText('⚫ Debris Field', 20, 50)
    ctx.fillText('🔴 Close Approach (<15km)', 20, 70)

    // Draw stats
    const closestEvent = data.events[0]
    if (closestEvent) {
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px monospace'
      ctx.fillText('Closest Approach:', 20, canvas.height - 60)
      ctx.font = '12px monospace'
      ctx.fillStyle = '#ef4444'
      ctx.fillText(`${closestEvent.missKm.toFixed(2)} km`, 20, canvas.height - 40)
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(`@ ${closestEvent.relKmS.toFixed(1)} km/s`, 20, canvas.height - 20)
    }

  }, [data])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
