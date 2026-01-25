"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function B2BPage() {
  const [services, setServices] = useState([
    {
      title: "Camera Rental",
      description: "Professional cinema-grade cameras (4K/8K) with low-light performance. Perfect for weddings, events, films, and corporate shoots.",
      icon: "📷",
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Lens Rental", 
      description: "Prime & zoom cinema lenses for stunning portraits and commercial work.",
      icon: "🎯",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Drone Services",
      description: "Certified aerial videography for weddings, events, and cinematic shots.",
      icon: "🚁",
      color: "from-emerald-500 to-teal-500"
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const whatsappNumber = "+91-XXXXXXXXXX"; // Update with your number

  useEffect(() => {
    const fetchB2BImages = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/b2b-images");
        if (!res.ok) throw new Error("Failed to fetch B2B images");
        
        const images = await res.json();
        console.log("✅ B2B Images loaded:", images);
        
        const servicesWithImages = services.map((service, index) => ({
          ...service,
          image: images[index] || {
            secure_url: `https://via.placeholder.com/500x300/64748b/eaeef0?text=${service.title.replace(' ', '+')}`
          }
        }));
        
        setServices(servicesWithImages);
      } catch (err) {
        console.error("❌ B2B images error:", err);
        setError("Could not load service images. Using placeholders.");
      } finally {
        setLoading(false);
      }
    };

    fetchB2BImages();
  }, []);

  const openWhatsApp = (serviceTitle) => {
    const message = `Hi, I'm interested in ${serviceTitle} rental. Please share availability and pricing.`;
    const whatsappURL = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-6 border-blue-200 border-t-blue-600 rounded-full mb-8"
        />
        <motion.p 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-gray-700 font-bold text-2xl"
        >
          Loading B2B Services...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100 flex items-center justify-center p-8 lg:p-12 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content - Perfectly Centered */}
      <div className="relative max-w-6xl w-full flex flex-col items-center text-center z-10">
        
        {/* Header - Compact & Bold */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-24 max-w-3xl"
        >
          
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-6xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent leading-tight mb-6"
          >
            B2B Services
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg lg:text-xl text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Professional equipment rental for studios, production houses, 
            <br className="hidden sm:block" />
            wedding filmmakers, and independent creators.
          </motion.p>
        </motion.div>

        {/* Cards Grid - Perfectly Centered & Spaced */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full max-w-7xl">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: 0.8 + index * 0.2, 
                duration: 0.8, 
                type: "spring",
                stiffness: 80
              }}
              whileHover={{ 
                y: -1, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl border border-white/50 overflow-hidden flex flex-col"
            >
              {/* Card Gradient Overlay */}
              
              {/* Image */}
              <div className="relative h-64 lg:h-72 overflow-hidden rounded-t-3xl">
                <img
                  src={service.image.secure_url}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading={index < 3 ? "eager" : "lazy"}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-8 lg:p-10 text-center" style={{padding:"30px"}}>
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="text-2xl lg:text-3xl font-black text-gray-900 mb-4 leading-tight"
                >
                  {service.title}
                </motion.h3>
                
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 flex-1 font-medium">
                  {service.description}
                </p>

                {/* WhatsApp Button */}
                <motion.button 
                  onClick={() => openWhatsApp(service.title)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 uppercase tracking-wide flex items-center justify-center gap-3 group/btn"
                >
                  <span className="text-xl">💬</span>
                  <span>Book Now → WhatsApp</span>
                  <motion.span 
                    animate={{ x: [0, 8, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      repeatDelay: 0.5 
                    }}
                    className="text-xl"
                  >
                    →
                  </motion.span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating Error Toast */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 max-w-sm backdrop-blur-sm border border-orange-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-sm">{error}</p>
                <p className="text-xs mt-1 opacity-90">(Upload images in Dashboard)</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
