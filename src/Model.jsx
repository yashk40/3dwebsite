"use client"
import { Canvas } from "@react-three/fiber"
import { useGLTF, OrbitControls } from "@react-three/drei"
import { Suspense, useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

function Model({ url, isMobile }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef()

  // Setup scroll animation to rotate the model
  useEffect(() => {
    if (modelRef.current) {
      // Reset rotation to 0
      modelRef.current.rotation.y = 0
      modelRef.current.rotation.z = 0
      modelRef.current.position.y = 0
      // Create the scroll animation with better control
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-trigger",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          markers: false,
          onEnter: () => console.log("Animation started"),
          onLeaveBack: () => {
            if (modelRef.current) {
              gsap.set(modelRef.current.rotation, { y: 0 })
            }
          },
        },
      })

      // Add the rotation animation to the timeline
      tl.to(modelRef.current.position, {
        x: 0.5,
        ease: "none",
      })
      tl.to(modelRef.current.rotation, {
        y: 2,
        ease: "none",
      })

      return () => {
        if (tl.scrollTrigger) {
          tl.scrollTrigger.kill()
        }
      }
    }
  }, [])

  // Enable shadows on model with mobile optimization
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = !isMobile // Disable shadow casting on mobile
      child.receiveShadow = !isMobile // Disable shadow receiving on mobile
    }
  })

  const [modelscale, setmodelscale]=useState(1)

  useEffect(()=>{
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setmodelscale(0.5)
      } else {
        setmodelscale(1)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  },[])

  return <primitive object={scene} ref={modelRef} scale={modelscale} />
}

export default function ModelViewer() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div id="scroll-trigger" style={{ width: "100vw", height: "200vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Canvas 
          shadows={!isMobile} 
          camera={{ position: [5, 3.5, 0], fov: 40 }}
          dpr={isMobile ? 1 : window.devicePixelRatio} // Lower resolution on mobile
        >
          <ambientLight intensity={isMobile ? 0.5 : 0.1} />
          {!isMobile && (
            <spotLight
              position={[0, 10, 0]}
              angle={0.15}
              penumbra={1}
              color="white"
              intensity={63}
              castShadow
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
              shadow-camera-near={0.5}
              shadow-camera-far={5}
            />
          )}
          <pointLight position={[0, 10, 0]} intensity={isMobile ? 40 : 72} />
          {!isMobile && (
            <directionalLight
              position={[0, 10, -3]}
              intensity={32}
              castShadow
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
            />
          )}
          <directionalLight position={[5, 10, 0]} intensity={isMobile ? 10 : 5} />

          {/* Ground Plane */}
          {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="white" roughness={0} />
          </mesh> */}

          {/* Model */}
          <Suspense fallback={null}>
            <Model url="/porsche_gt3_rs.compressed.glb" isMobile={isMobile} />
          </Suspense>

          <OrbitControls enableDamping={false} enableRotate={false} enableZoom={false} />
        </Canvas>
      </div>
    </div>
  )
}
