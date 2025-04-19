"use client"

import { useState, useEffect, useRef } from "react"
import { AlignRight, X } from "lucide-react"
import "./navbar.css"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const sideNavRef = useRef(null)

  // Navigation links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Models", href: "/models" },
    { name: "Build Your Porsche", href: "/build" },
    { name: "Experience", href: "/experience" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
  ]

  // Close side nav when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sideNavRef.current && !sideNavRef.current.contains(event.target) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Prevent body scrolling when side nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <div className="navbar">
        <div className="logo">Porsche</div>

        <button className="menu-button" onClick={() => setIsOpen(true)} aria-label="Open navigation menu">
        <div>
        <AlignRight width={40} height={50} />
          </div>  
        </button>
      </div>

      {/* Custom side navigation */}
      <div className={`side-nav-overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)}>
        <div ref={sideNavRef} className={`side-nav ${isOpen ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="side-nav-header">
            <button className="close-button" onClick={() => setIsOpen(false)} aria-label="Close navigation menu">
              <X width={30} height={30} />
            </button>
          </div>

          <nav className="side-nav-links">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="nav-link" onClick={() => setIsOpen(false)}>
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
