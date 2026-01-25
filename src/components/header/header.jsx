"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const prevScrollPos = useRef(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      if (prevScrollPos.current < currentScrollPos && currentScrollPos > 50) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }

      prevScrollPos.current = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .header {
          background: #008080 !important;
          backdrop-filter: none !important;
        }

        .header.glass-active {
          background: #008080 !important;
          backdrop-filter: none !important;
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          color: #ffffff !important;
          text-decoration: none;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .dropdown-trigger:hover {
          color: #ffd54f !important;
          text-decoration: underline;
        }

        .dropdown-arrow {
          font-size: 12px;
          color: #ffffff !important;
          transition: all 0.3s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
          color: #ffd54f !important;
        }

        .dropdown-menu {  
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          background: #008080;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 180px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 9999;
          display: flex;
          flex-direction: column;
        }

        .dropdown-menu.open {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        .dropdown-menu a {
          display: block;
          padding: 12px 20px;
          color: #ffffff !important;
          text-decoration: none !important;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dropdown-menu a:last-child {
          border-bottom: none;
        }

        .dropdown-menu a:first-child {
          border-radius: 8px 8px 0 0;
        }

        .dropdown-menu a:last-child {
          border-radius: 0 0 8px 8px;
        }

        .dropdown-menu a:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff !important;
          padding-left: 24px;
        }

        /* Mobile dropdown styles */
        .mobile-dropdown {
          display: flex;
          flex-direction: column;
        }

        .mobile-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          padding:  0;
          cursor: pointer;
          color: #ff9800 !important;
          text-decoration: none;
          font-weight: 600;
        }

        .mobile-dropdown-trigger:hover {
          color: #ffd54f !important;
        }

        .mobile-dropdown-content {
          display: flex;
          flex-direction: column;
          padding-left: 20px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .mobile-dropdown-content.open {
          max-height: 200px;
        }

        .mobile-dropdown-content a {
          padding: 0.75rem 0;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 0.95rem;
        }

        .mobile-dropdown-content a:hover {
          color: #ffd54f;
        }
      `}</style>

      <header className={`header ${isScrollingDown ? "glass-active" : ""}`}>
        <div className="header-container">
          {/* LOGO SECTION */}
          <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
            <Image
              src="/klogo.png"
              alt="Kalakruthi Logo"
              width={50}
              height={50}
              priority
              className="logo-image"
            />
            <span className="logo-text">Kalakruthi</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="desktop-nav">
            <Link href="/">Home</Link>
            
            {/* Services Dropdown */}
            <div 
              className="dropdown-container" 
              ref={dropdownRef}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <div className="dropdown-trigger">
                Services
                <span className={`dropdown-arrow ${servicesDropdownOpen ? 'open' : ''}`}>
                  ▼
                </span>
              </div>
              <div className={`dropdown-menu ${servicesDropdownOpen ? 'open' : ''}`}>
                <Link 
                  href="/services/photography" 
                  onClick={() => setServicesDropdownOpen(false)}
                >
                  Photography
                </Link>
                <Link 
                  href="/services/videography" 
                  onClick={() => setServicesDropdownOpen(false)}
                >
                  Videography
                </Link>
              </div>
            </div>

            <Link href="/gallery">Gallery</Link>
            <Link href="/templates">Live links</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          {/* HAMBURGER BUTTON */}
          <button
            className={`hamburger-btn ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        <nav className={`mobile-nav ${menuOpen ? "open" : ""}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {/* Mobile Services Dropdown */}
          <div className="mobile-dropdown">
            <div 
              className="mobile-dropdown-trigger"
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
            >
              Services
              <span className={`dropdown-arrow ${servicesDropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            <div className={`mobile-dropdown-content ${servicesDropdownOpen ? 'open' : ''}`}>
              <Link 
                href="/services/photography" 
                onClick={() => {
                  setMenuOpen(false);
                  setServicesDropdownOpen(false);
                }}
              >
                Photography
              </Link>
              <Link 
                href="/services/videography" 
                onClick={() => {
                  setMenuOpen(false);
                  setServicesDropdownOpen(false);
                }}
              >
                Videography
              </Link>
            </div>
          </div>

          <Link href="/gallery" onClick={() => setMenuOpen(false)}>
            Gallery
          </Link>
          <Link href="/templates" onClick={() => setMenuOpen(false)}>
            Live Links
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </nav>
      </header>
    </>
  );
}
