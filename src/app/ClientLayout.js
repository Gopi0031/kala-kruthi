"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/GlobalLoader";
import { FaWhatsapp } from "react-icons/fa";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // Check if current path is admin panel
  const isAdminPanel = pathname.startsWith('/admin');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <GlobalLoader loading={loading} />
      
      {/* WhatsApp button - hidden on admin panel */}
      {!isAdminPanel && (
        <a 
          className="whatsapp-btn" 
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <FaWhatsapp />
        </a>
      )}
      
      <main>{children}</main>
      <Footer />
    </>
  );
}
