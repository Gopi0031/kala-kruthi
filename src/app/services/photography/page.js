"use client";

import { useState, useRef, useEffect, useCallback, useMemo, useTransition } from "react";

const styles = {
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 20px",
    alignItems: "stretch",
  },
};

/* ===============================
   PERFECT 5-IMAGE CAROUSEL - ULTRA COMPACT MOBILE
================================ */
function ImagePopupModal({ images, initialIndex, onClose, categoryName }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isClosing, setIsClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle');
  const autoPlayRef = useRef(null);
  const [isPending, startTransition] = useTransition();

  // Cache images for fast loading
  const preloadedImages = useMemo(() => {
    const cache = new Map();
    return images.map((img, index) => {
      const key = img?.url || img?.secureUrl || `img-${index}`;
      if (!cache.has(key)) {
        cache.set(key, {
          url: img?.url || img?.secureUrl || '',
          secureUrl: img?.secureUrl || img?.url || '',
          loaded: false
        });
      }
      return cache.get(key);
    });
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`image-popup-overlay ${isClosing ? "closing" : ""}`} onClick={onClose}>
        <div className="no-images-popup">
         <button className="popup-close-btn" onClick={onClose}>✕</button>
         <p style={{ fontSize: "64px", marginBottom: "20px" }}>📷</p>
         <p style={{ fontSize: "24px", color: "white" }}>No images found</p>
        </div>
      </div>
    );
  }

  const getImageIndex = useCallback((offset) => {
    const index = currentIndex + offset;
    if (index < 0) return images.length + index;
    if (index >= images.length) return index - images.length;
    return index;
  }, [currentIndex, images.length]);

  const farLeftIndex = getImageIndex(-2);
  const leftIndex = getImageIndex(-1);
  const centerIndex = currentIndex;
  const rightIndex = getImageIndex(1);
  const farRightIndex = getImageIndex(2);

  // Preload visible images
  useEffect(() => {
    const preloadImages = [farLeftIndex, leftIndex, centerIndex, rightIndex, farRightIndex];
    preloadImages.forEach(index => {
      const img = preloadedImages[index];
      if (img && !img.loaded) {
        const imageObj = new Image();
        imageObj.src = img.url;
        imageObj.onload = () => {
          // Update cache - in real implementation you'd update state
          console.log('Image preloaded:', img.url);
        };
      }
    });
  }, [currentIndex, preloadedImages]);

  useEffect(() => {
    if (images?.length > 1 && !isTransitioning) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentIndex, images, isTransitioning]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft" && !isTransitioning) {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        handlePrevious();
      }
      if (e.key === "ArrowRight" && !isTransitioning) {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        handleNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isTransitioning]);

  const handleClose = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setIsClosing(true);
    setTimeout(() => onClose(), 400);
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    
    setAnimationPhase('next');
    setIsTransitioning(true);
    
    startTransition(() => {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setAnimationPhase('idle');
        setIsTransitioning(false);
      }, 800);
    });
  }, [isTransitioning, images.length, startTransition]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    
    setAnimationPhase('prev');
    setIsTransitioning(true);
    
    startTransition(() => {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setAnimationPhase('idle');
        setIsTransitioning(false);
      }, 800);
    });
  }, [isTransitioning, images.length, startTransition]);

  const handleManualNext = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    handleNext();
  }, [handleNext]);

  const handleManualPrevious = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    handlePrevious();
  }, [handlePrevious]);

  return (
    <div className={`image-popup-overlay ${isClosing ? "closing" : ""}`} onClick={handleClose}>
      <div className={`image-popup-content ${isClosing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={handleClose}>✕</button>
        <button className="popup-nav-btn prev-btn" onClick={handleManualPrevious} disabled={isTransitioning || isPending}>‹</button>
        
        <div className="carousel-3d-container">
         <div className={`carousel-3d-wrapper ${isTransitioning ? 'transitioning' : ''} ${animationPhase}`}>
            {preloadedImages[farLeftIndex]?.url && (
              <div className="carousel-3d-item item-far-left" key={`far-left-${farLeftIndex}`}>
                <img src={preloadedImages[farLeftIndex].url} alt="Far Left" loading="eager" />
              </div>
            )}

            {preloadedImages[leftIndex]?.url && (
              <div className="carousel-3d-item item-left" onClick={handleManualPrevious} key={`left-${leftIndex}`}>
                <img src={preloadedImages[leftIndex].url} alt="Previous" loading="eager" />
              </div>
            )}

            {preloadedImages[centerIndex]?.url && (
              <div className="carousel-3d-item item-center" key={`center-${centerIndex}`}>
                <img src={preloadedImages[centerIndex].url} alt={`Image ${centerIndex + 1}`} loading="eager" />
              </div>
            )}

            {preloadedImages[rightIndex]?.url && (
              <div className="carousel-3d-item item-right" onClick={handleManualNext} key={`right-${rightIndex}`}>
                <img src={preloadedImages[rightIndex].url} alt="Next" loading="eager" />
              </div>
            )}

            {preloadedImages[farRightIndex]?.url && (
              <div className="carousel-3d-item item-far-right" key={`far-right-${farRightIndex}`}>
                <img src={preloadedImages[farRightIndex].url} alt="Far Right" loading="eager" />
              </div>
            )}
          </div>
        </div>

        <button className="popup-nav-btn next-btn" onClick={handleManualNext} disabled={isTransitioning || isPending}>›</button>
      </div>
    </div>
  );
}

function ServiceCard({ service, onView, showViewText = true }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageCache] = useState(new Map());
  const imageRef = useRef(null);
  const firstImage = service.images && service.images.length > 0 ? service.images[0] : null;
  const imageSrc = firstImage ? (firstImage.url || firstImage.secureUrl) : null;

  useEffect(() => {
    if (imageSrc) {
      // Check cache first
      if (imageCache.has(imageSrc)) {
        setImageLoaded(imageCache.get(imageSrc));
        return;
      }

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const loaded = true;
        imageCache.set(imageSrc, loaded);
        setImageLoaded(loaded);
      };
      img.onerror = () => {
        imageCache.set(imageSrc, true);
        setImageLoaded(true);
      };
    } else {
      setImageLoaded(true);
    }
  }, [imageSrc, imageCache]);

  return (
    <div className="service-card">
      <div className="image-box" onClick={() => onView(service)}>
        {imageSrc ? (
          <>
            <img
              ref={imageRef}
              src={imageSrc}
              alt={service.name}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.2s ease-out",
              }}
              loading="lazy"
            />
            {!imageLoaded && <div className="image-skeleton" />}
          </>
        ) : (
          <div className="no-image-placeholder">📸</div>
        )}
        {showViewText && <div className="view-text">View</div>}
      </div>
      <div className="category-name">{service.name}</div>
    </div>
  );
}

export default function ServicesPage() {
  const [activePopup, setActivePopup] = useState(null);
  const [dbServices, setDbServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [imageCache] = useState(new Map());
  const servicesCache = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Use cache if available
    if (servicesCache.current) {
      setDbServices(servicesCache.current);
      setLoading(false);
      return;
    }

    fetch("/api/services?type=photography", { 
      cache: "force-cache",
      next: { revalidate: 3600 } // Cache for 1 hour
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Fetched photography services:", data);
        const photoServices = Array.isArray(data) 
          ? data.filter(s => s.type === 'photography')
          : [];
        servicesCache.current = photoServices;
        setDbServices(photoServices);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching services:", err);
        setDbServices([]);
        setLoading(false);
      });
  }, []);

  const handleButtonClick = useCallback((service) => {
    setActivePopup(service);
  }, []);

  const handleCardClick = useCallback((service) => {
    setActivePopup(service);
  }, []);

  const closePopup = useCallback(() => {
    setActivePopup(null);
  }, []);

  const getGridColumns = useCallback(() => {
    if (windowWidth <= 480) return "1fr";
    if (windowWidth <= 1024) return "repeat(2, 1fr)";
    return "repeat(3, 1fr)";
  }, [windowWidth]);

  const responsiveGridStyle = useMemo(() => ({
    ...styles.servicesGrid,
    gridTemplateColumns: getGridColumns(),
  }), [getGridColumns()]);

  if (loading) {
    return (
      <main className="services-page">
        <div className="loading-spinner">Loading services...</div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .services-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%);
          padding: 0px 16px 60px;
          display: flex;
          justify-content: center;
        }

        .services-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .services-title {
          font-size: 3rem;
          text-align: center;
          margin: 0 24px ;
          font-weight: 900;
          background: linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff0000 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbow 6s linear infinite;
          filter: drop-shadow(0 4px 20px rgba(0,0,0,0.15));
        }

        @keyframes rainbow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .services-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin: 0 auto 32px;
          max-width: 1100px;
        }

        .services-buttons button {
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .services-buttons button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255,140,66,0.3);
          background: #fc8332;
          color: white;
          border-color: #ffb380;
        }

        .services-buttons button.active {
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
          color: white;
          border-color: #ff6b35;
          box-shadow: 0 6px 20px rgba(255,107,53,0.5);
        }

        /* OPTIMIZED SMOOTH HOVER ANIMATIONS - NO LAG */
        .service-card {
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0;
          transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }

        .service-card .image-box {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          overflow: hidden;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateZ(0);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
                      box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, box-shadow;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          contain: layout style paint;
        }

        .service-card:hover .image-box {
          transform: translateY(-6px) translateZ(0);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .service-card .image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translateZ(0) scale(1);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .service-card:hover .image-box img {
          transform: scale(1.03) translateZ(0);
        }

        /* TRANSPARENT VIEW BUTTON - COMPLETELY TRANSPARENT BOX */
        .view-text {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          font-size: 14px;
          font-weight: 600;
          color: white;
          padding: 8px 24px;
          border-radius: 4px;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent; /* Completely transparent */
          backdrop-filter: none;
          border: 1px solid rgba(255, 255, 255, 0.7);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          pointer-events: none;
          white-space: nowrap;
          box-shadow: none;
          letter-spacing: 0.5px;
        }

        .service-card:hover .view-text {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .no-image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          transform: translateZ(0);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .service-card:hover .no-image-placeholder {
          transform: scale(1.02) translateZ(0);
        }

        .image-skeleton {
          position: absolute;
          inset: 0;
          background: #f0f0f0;
          border-radius: 16px;
        }

        /* CATEGORY NAME - ALWAYS BLACK, NO COLOR CHANGE */
        .category-name {
          text-align: center;
          font-size: 17px;
          font-weight: 600;
          color: #000000; /* Always black */
          padding: 4px 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transition: none; /* Remove any transition */
        }

        /* CAROUSEL STYLES (UNCHANGED) */
        .image-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.98);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: overlayFadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: opacity;
        }

        .image-popup-overlay.closing { 
          animation: overlayFadeOut 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19); 
        }

        @keyframes overlayFadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes overlayFadeOut { 
          from { opacity: 1; } 
          to { opacity: 0; } 
        }

        .image-popup-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-popup-content.closing {
          animation: contentScaleOut 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19);
        }

        @keyframes contentScaleOut {
          to { transform: scale(0.9); opacity: 0; }
        }

        .carousel-3d-container {
          position: relative;
          width: 100%;
          height: 90vh;
          perspective: 3000px;
          transform-style: preserve-3d;
          overflow: hidden;
        }

        .carousel-3d-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .carousel-3d-wrapper.transitioning {
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .carousel-3d-item {
          position: absolute;
          width: clamp(450px, 85vw, 850px);
          height: 85vh;
          max-width: 90vw;
          border-radius: 40px;
          overflow: hidden;
          cursor: pointer;
          transform-style: preserve-3d;
          will-change: transform, opacity;
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
          backface-visibility: hidden;
          box-shadow: 0 50px 150px rgba(0,0,0,0.6);
        }

        .carousel-3d-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 40px;
          user-select: none;
          pointer-events: none;
          will-change: transform;
          box-shadow: inherit;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .item-far-left {
          transform: translate3d(-220%, 0, -1000px) rotateY(60deg) scale(0.5);
          opacity: 0;
          pointer-events: none;
        }

        .item-left {
          transform: translate3d(-110%, 0, -700px) rotateY(55deg) scale(0.68);
          opacity: 0.3;
        }

        .item-center {
          transform: translate3d(0, 0, 0) rotateY(0deg) scale(1);
          opacity: 1;
          z-index: 10;
        }

        .item-right {
          transform: translate3d(110%, 0, -700px) rotateY(-55deg) scale(0.68);
          opacity: 0.3;
        }

        .item-far-right {
          transform: translate3d(220%, 0, -1000px) rotateY(-60deg) scale(0.5);
          opacity: 0;
          pointer-events: none;
        }

        .next .item-far-left {
          transform: translate3d(-330%, 0, -1200px) rotateY(70deg) scale(0.4);
          opacity: 0;
        }

        .next .item-left {
          transform: translate3d(-220%, 0, -1000px) rotateY(60deg) scale(0.5);
          opacity: 0;
        }

        .next .item-center {
          transform: translate3d(-110%, 0, -700px) rotateY(55deg) scale(0.68);
          opacity: 0.3;
          z-index: 1;
        }

        .next .item-right {
          transform: translate3d(0, 0, 0) rotateY(0deg) scale(1);
          opacity: 1;
          z-index: 10;
        }

        .next .item-far-right {
          transform: translate3d(110%, 0, -700px) rotateY(-55deg) scale(0.68);
          opacity: 0.3;
        }

        .prev .item-far-left {
          transform: translate3d(-110%, 0, -700px) rotateY(55deg) scale(0.68);
          opacity: 0.3;
        }

        .prev .item-left {
          transform: translate3d(0, 0, 0) rotateY(0deg) scale(1);
          opacity: 1;
          z-index: 10;
        }

        .prev .item-center {
          transform: translate3d(110%, 0, -700px) rotateY(-55deg) scale(0.68);
          opacity: 0.3;
          z-index: 1;
        }

        .prev .item-right {
          transform: translate3d(220%, 0, -1000px) rotateY(-60deg) scale(0.5);
          opacity: 0;
        }

        .prev .item-far-right {
          transform: translate3d(330%, 0, -1200px) rotateY(-70deg) scale(0.4);
          opacity: 0;
        }

        .popup-close-btn, .popup-nav-btn {
          position: fixed;
          background: rgba(99, 102, 241, 0.9);
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          font-size: 24px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1000001;
          box-shadow: 0 8px 32px rgba(99,102,241,0.3);
          will-change: transform;
        }

        .popup-close-btn {
          top: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          font-size: 26px;
        }

        .popup-nav-btn {
          top: 50%;
          width: 60px;
          height: 60px;
          font-size: 28px;
          transform: translateY(-50%);
        }

        .prev-btn { left: 30px; }
        .next-btn { right: 30px; }

        .popup-close-btn:hover, .popup-nav-btn:hover:not(:disabled) {
          transform: scale(1.15);
          box-shadow: 0 12px 40px rgba(99,102,241,0.5);
          background: rgba(99,102,241,1);
        }

        .popup-nav-btn:hover:not(:disabled) {
          transform: translateY(-50%) scale(1.15);
        }

        .popup-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .no-images-popup {
          text-align: center;
          padding: 40px;
        }

        @media (max-width: 1024px) {
          .services-title { font-size: 2.5rem; }
          .carousel-3d-item { height: 80vh; }
        }

        @media (max-width: 768px) {
          .services-title { font-size: 2rem; }
          .carousel-3d-item { width: 85vw; height: 75vh; }
          
          .popup-close-btn {
            top: 15px;
            right: 15px;
            width: 44px;
            height: 44px;
            font-size: 22px;
          }

          .popup-nav-btn {
            width: 48px;
            height: 48px;
            font-size: 24px;
          }

          .prev-btn { left: 12px; }
          .next-btn { right: 12px; }
          
          .view-text {
            padding: 6px 20px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .services-title { font-size: 1.75rem; }
          .carousel-3d-item { height: 70vh; }
          
          .popup-close-btn {
            top: 10px;
            right: 10px;
            width: 38px;
            height: 38px;
            font-size: 20px;
            border-width: 1.5px;
          }

          .popup-nav-btn {
            width: 42px;
            height: 42px;
            font-size: 22px;
            border-width: 1.5px;
          }

          .prev-btn { left: 8px; }
          .next-btn { right: 8px; }
          
          .view-text {
            padding: 5px 16px;
            font-size: 12px;
          }
        }

        @media (max-width: 360px) {
          .popup-close-btn {
            top: 8px;
            right: 8px;
            width: 35px;
            height: 35px;
            font-size: 18px;
          }

          .popup-nav-btn {
            width: 38px;
            height: 38px;
            font-size: 20px;
          }

          .prev-btn { left: 6px; }
          .next-btn { right: 6px; }
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          font-size: 24px;
          color: #4b5563;
          font-weight: 600;
        }

        .services-section {
          margin-top: 40px;
        }
      `}</style>

      <main className="services-page">
        <div className="services-container">
          <h1 className="services-title">Photography</h1>
          
          <div className="services-buttons">
            {dbServices.map((service) => (
              <button
                key={service._id || service.id}
                className={activePopup?._id === service._id ? "active" : ""}
                onClick={() => handleButtonClick(service)}
              >
                {service.name}
              </button>
            ))}
          </div>

          <section className="services-section">
            {dbServices.length > 0 ? (
              <div style={responsiveGridStyle}>
                {dbServices.map((service) => (
                  <ServiceCard
                    key={service._id || service.id}
                    service={service}
                    onView={handleCardClick}
                    showViewText={true}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "100px 20px", color: "#9ca3af" }}>
                <p style={{ fontSize: "64px", marginBottom: "20px" }}>🎨</p>
                <p style={{ fontSize: "24px", fontWeight: "600" }}>No Services Available Yet</p>
                <p style={{ fontSize: "16px" }}>Add services from admin dashboard</p>
              </div>
            )}
          </section>
        </div>

        {activePopup && (
          <ImagePopupModal
            images={activePopup.images || []}
            initialIndex={0}
            onClose={closePopup}
            categoryName={activePopup.name}
          />
        )}
      </main>
    </>
  );
}
