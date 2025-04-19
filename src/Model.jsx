"use client"
import { Canvas } from "@react-three/fiber"
import { useGLTF, OrbitControls, useDetectGPU, AdaptiveDpr, Preload } from "@react-three/drei"
import { Suspense, useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Loading component to show while the model loads
function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700">Loading 3D Model...</p>
      </div>
    </div>
  )
}

function Model({ url, isMobile }) {
  const { scene } = useGLTF(url, true) // true enables progressive loading
  const modelRef = useRef()

  // Setup scroll animation to rotate the model
  useEffect(() => {
    if (!modelRef.current) return

    // Reset rotation to initial state
    modelRef.current.rotation.y = 0
    modelRef.current.rotation.z = 0
    modelRef.current.position.y = 0

    // Create the scroll animation with better control
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-trigger",
        start: "top top",
        end: "bottom bottom",
        scrub: isMobile ? 0.5 : 1, // faster scrub on mobile for better performance
        invalidateOnRefresh: true,
        markers: false,
        onLeaveBack: () => {
          if (modelRef.current) {
            gsap.set(modelRef.current.rotation, { y: 0 })
          }
        },
      },
    })

    // Simpler animation for mobile
    if (isMobile) {
      tl.to(modelRef.current.rotation, {
        y: 2,
        ease: "none",
      })
    } else {
      // More complex animation for desktop
      tl.to(modelRef.current.position, {
        x: 0.5,
        ease: "none",
      })
      tl.to(modelRef.current.rotation, {
        y: 2,
        ease: "none",
      })
    }

    // Cleanup function
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill()
      }
    }
  }, [isMobile])

  // Enable shadows on model - only on desktop
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = !isMobile
        child.receiveShadow = !isMobile

        // Optimize materials for mobile
        if (isMobile && child.material) {
          child.material.roughness = 0.7 // Higher roughness = less complex reflections
          child.material.metalness = 0.3 // Lower metalness = less complex reflections
          child.material.envMapIntensity = 0.5 // Lower environment map intensity
        }
      }
    })
  }, [scene, isMobile])

  // Calculate model scale based on device
  const modelScale = isMobile ? 0.5 : 1

  return <primitive object={scene} ref={modelRef} scale={modelScale} />
}

export default function ModelViewer() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const gpuTier = useDetectGPU()

  useEffect(() => {
    // Detect mobile devices by screen width and GPU capabilities
    const checkMobile = () => {
      const width = window.innerWidth
      const isMobileDevice = width < 768 || (gpuTier && gpuTier.tier < 2)
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [gpuTier])

  // Handle model loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div id="scroll-trigger" style={{ width: "100vw", height: "200vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        {isLoading && <LoadingScreen />}

        <Canvas
          shadows={!isMobile}
          camera={{
            position: isMobile ? [6, 4, 0] : [5, 3.5, 0],
            fov: isMobile ? 50 : 40,
          }}
          dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
          performance={{ min: 0.5 }}
          gl={{
            powerPreference: "high-performance",
            antialias: !isMobile,
            stencil: false,
            depth: true,
          }}
        >
          {/* Adaptive DPR adjusts resolution based on device performance */}
          <AdaptiveDpr pixelated />

          {/* Simplified lighting for mobile */}
          <ambientLight intensity={isMobile ? 0.5 : 0.1} />

          {/* Conditional lighting based on device */}
          {!isMobile ? (
            <>
              <spotLight
                position={[0, 10, 0]}
                angle={0.15}
                penumbra={1}
                color="white"
                intensity={63}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[0, 10, 0]} intensity={72} />
              <directionalLight
                position={[0, 10, -3]}
                intensity={32}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight position={[5, 10, 0]} intensity={5} />
            </>
          ) : (
            // Simplified lighting for mobile
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow={false} />
          )}

          {/* Ground Plane - simplified for mobile */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow={!isMobile}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="white" roughness={isMobile ? 1 : 0} metalness={0} />
          </mesh>

          {/* Model with Suspense for async loading */}
          <Suspense fallback={null}>
            <Model url="/porsche_gt3_rs.glb" isMobile={isMobile} />
          </Suspense>

          <OrbitControls enableDamping={false} enableRotate={false} enableZoom={false} enablePan={false} />

          {/* Preload assets for better performance */}
          <Preload all />
        </Canvas>
      </div>
    </div>
  )
}
