'use client'
import React, { useState, useEffect } from 'react'
import { 
  MdDashboard, 
  MdViewCarousel, 
  MdPhotoLibrary, 
  MdMiscellaneousServices,
  MdAttachMoney,
  MdRequestQuote,
  MdBusiness,
  MdPeople,
  MdCardGiftcard,
  MdLogout,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md'

const MENU = [
  { name: "Dashboard", icon: MdDashboard },
  { name: "Hero Section", icon: MdViewCarousel },
  { name: "Gallery", icon: MdPhotoLibrary },
  { name: "Services", icon: MdMiscellaneousServices },
  { name: "Pricing List", icon: MdAttachMoney },
  { name: "Quotation", icon: MdRequestQuote },
  { name: "B2B Customer", icon: MdBusiness },
  { name: "Customer Details", icon: MdPeople },
  { name: "Packages", icon: MdCardGiftcard },
]

export default function Sidebar({
  active,
  setActive,
  setOpenPaymentRowId,
  setOpenAdvanceId
}) {
  const [isDesktop, setIsDesktop] = useState(false)

  // ✅ SEPARATE STATES
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ✅ DETECT DESKTOP
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("adminuser"))
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user?.username || "kala-kruthi" }),
      })
      localStorage.removeItem("adminuser")
      localStorage.removeItem("isAdmin")
      window.location.href = "/"
    } catch {
      window.location.href = "/"
    }
  }

  // ✅ TOGGLE BASED ON DEVICE
  const toggleSidebar = () => {
    if (isDesktop) {
      setDesktopOpen(prev => !prev)
    } else {
      setMobileOpen(prev => !prev)
    }
  }

  const handleMenuClick = (menuName) => {
    scrollToTop()
    setActive(menuName)
    setOpenPaymentRowId(null)
    setOpenAdvanceId(null)

    // close only on mobile
    if (!isDesktop) {
      setMobileOpen(false)
    }
  }

  const isOpen = isDesktop ? desktopOpen : mobileOpen

  return (
    <>
      {/* MOBILE TOGGLE */}
      {!isDesktop && (
        <button
          onClick={toggleSidebar}
          style={{
            position: "absolute",
            top: "70px",
            right: "20px",
            zIndex: "1001",
            background: "#10b981",
            color: "black",
            border: "none",
            borderRadius: "80px",
            padding: "5px 10px",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      )}

      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isOpen ? 'space-between' : 'center',
          padding: isOpen ? '20px' : '20px 0',
          marginBottom: '20px'
        }}>
          {isOpen && <h2 className="dashboard-logo">Admin</h2>}

          {/* DESKTOP TOGGLE */}
          {isDesktop && (
            <button
              onClick={toggleSidebar}
              style={{
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {desktopOpen ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
            </button>
          )}
        </div>

        {/* MENU */}
        {MENU.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.name)}
              className={`dashboard-menu-btn ${active === item.name ? "active" : ""}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'flex-start' : 'center',
                padding: isOpen ? '12px 20px' : '12px 0',
                width: '100%',
              }}
              title={!isOpen ? item.name : ''}
            >
              <Icon size={30} />
              {isOpen && <span style={{ marginLeft: 12 }}>{item.name}</span>}
            </button>
          )
        })}

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="dashboard-logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'flex-start' : 'center',
            padding: isOpen ? '12px 20px' : '12px 0',
            width: '100%',
          }}
        >
          <MdLogout size={20} />
          {isOpen && <span style={{ marginLeft: 12 }}>Logout</span>}
        </button>
      </aside>

      {/* MOBILE OVERLAY */}
      {!isDesktop && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}
    </>
  )
}
