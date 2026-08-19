'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Dynamically import Cesium to avoid SSR issues
const CesiumViewer = dynamic(() => import('./CesiumViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading 3D visualization...</div>
})

export default function OrbitVisualization() {
  const [conjunctionData, setConjunctionData] = useState(null)

  useEffect(() => {
    fetch('/api/conjunctions')
      .then(res => res.json())
      .then(data => setConjunctionData(data))
      .catch(err => console.error('Failed to load conjunction data:', err))
  }, [])

  if (!conjunctionData) {
    return <div className="w-full h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
      <p className="text-gray-400">Loading orbital data...</p>
    </div>
  }

  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <CesiumViewer data={conjunctionData} />
    </div>
  )
}
