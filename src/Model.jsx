"use client"
import { Canvas } from "@react-three/fiber"
import { useGLTF, OrbitControls, useDetectGPU } from "@react-three/drei"
import { Suspense, useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Text sections about Porsche
const porscheInfo = [
  {
    title: "Racing Heritage",
    description: "Built on decades of motorsport success, the GT3 RS brings race-proven technology to the street.",
  },
]

function Model({ url, isMobile }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef()
  const gpuTier = useDetectGPU()

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
            // Reset to 0 when scrolling back to the top
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

      // Cleanup function
      return () => {
        if (tl.scrollTrigger) {
          tl.scrollTrigger.kill()
        }
      }
    }
  }, [])

  // Enable shadows on model with optimization for mobile
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Reduce shadow quality on mobile or low-end devices
        if (isMobile || (gpuTier && gpuTier.tier < 2)) {
          child.castShadow = false
          child.receiveShadow = false
        } else {
          child.castShadow = true
          child.receiveShadow = true
        }
      }
    })
  }, [scene, isMobile, gpuTier])

  const modelScale = isMobile ? 0.5 : 1

  return <primitive object={scene} ref={modelRef} scale={modelScale} />
}

function TextSection({ section, index }) {
  const textRef = useRef()

  useEffect(() => {
    const el = textRef.current

    if (el) {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          x: index % 2 === 0 ? -50 : 50,
        },
        {
          opacity: 1,
          x: 0,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        },
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === el) {
          trigger.kill()
        }
      })
    }
  }, [index])

  return (
    <div
      ref={textRef}
      className={`text-section ${index % 2 === 0 ? "text-left ml-8" : "text-right mr-8"}`}
      style={{
        position: "absolute",
        top: `${25 + index * 20}%`,
        left: index % 2 === 0 ? "5%" : "auto",
        right: index % 2 === 0 ? "auto" : "5%",
        maxWidth: "40%",
        padding: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        borderRadius: "8px",
        opacity: 0,
      }}
    >
      <h2 className="text-xl md:text-2xl font-bold mb-2">{section.title}</h2>
      <p className="text-sm md:text-base">{section.description}</p>
    </div>
  )
}

export default function ModelViewer() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize() // call once on mount
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div id="scroll-trigger" style={{ width: "100vw", height: "300vh", position: "relative" }}>
      {/* Make canvas sticky to see scroll effect clearly */}
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Canvas
          shadows
          camera={{ position: [5, 3.5, 0], fov: 40 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower resolution on mobile
          performance={{ min: 0.5 }} // Allow ThreeJS to reduce quality if needed
        >
          <ambientLight intensity={0.1} />
          <spotLight
            position={[0, 10, 0]}
            angle={0.15}
            penumbra={1}
            color="white"
            intensity={63}
            castShadow={!isMobile}
            shadow-mapSize-width={isMobile ? 512 : 1024}
            shadow-mapSize-height={isMobile ? 512 : 1024}
            shadow-camera-near={0.5}
            shadow-camera-far={5}
          />
          <pointLight position={[0, 10, 0]} intensity={72} />
          <directionalLight
            position={[0, 10, -3]}
            intensity={32}
            castShadow={!isMobile}
            shadow-mapSize-width={isMobile ? 512 : 1024}
            shadow-mapSize-height={isMobile ? 512 : 1024}
          />
          <directionalLight position={[5, 10, 0]} intensity={5} />

          {/* Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow={!isMobile}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="white" roughness={0} />
          </mesh>

          {/* Model */}
          <Suspense fallback={null}>
            <Model url="/porsche_gt3_rs.glb" isMobile={isMobile} />
          </Suspense>

          <OrbitControls enableDamping={false} enableRotate={false} enableZoom={false} />
        </Canvas>

        {/* Text sections that appear on scroll */}
        {porscheInfo.map((section, index) => (
          <TextSection key={index} section={section} index={index} />
        ))}
      </div>

      {/* Title that appears at the top */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "white",
          zIndex: 10,
        }}
      >
        <h1 className="text-3xl md:text-5xl font-bold" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
          Porsche GT3 RS
        </h1>
        <p className="text-lg md:text-xl mt-2" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
          Scroll to explore
        </p>
      </div>
    </div>
  )
}
