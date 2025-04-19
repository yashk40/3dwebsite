"use client"
import { Suspense, useState, useEffect } from "react"
import { useDetectGPU } from "@react-three/drei"
import React from "react"

// Lazy load the model viewer component
const ModelViewer = React.lazy(() => import("./Model"))

function LoadingFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-xl">Loading Porsche Experience...</p>
      </div>
    </div>
  )
}

export default function OptimizedModelLoader() {
  const [isClient, setIsClient] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const gpuTier = useDetectGPU()

  useEffect(() => {
    setIsClient(true)

    if (gpuTier && gpuTier.tier > 0) {
      setShouldLoad(true)
    } else {
      const timer = setTimeout(() => setShouldLoad(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [gpuTier])

  if (!isClient) return <LoadingFallback />

  if (!shouldLoad) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-4">Device Compatibility Check</h2>
          <p>We're checking if your device can handle the 3D experience...</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ModelViewer />
    </Suspense>
  )
}
