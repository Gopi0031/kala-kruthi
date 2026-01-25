"use client";

import { useState, useRef, useEffect } from "react";

/* ================================ 
   VIDEO PLAYER WITH EMBED SUPPORT
================================ */
function VideoPlayer({ video, onClose }) {
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URLSearchParams(new URL(url).search).get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    // Direct video URL
    return url;
  };

  const videoUrl = video.url || video.secureUrl;
  const embedUrl = getEmbedUrl(videoUrl);
  const isDirectVideo = embedUrl && !embedUrl.includes('youtube') && !embedUrl.includes('vimeo');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        {isDirectVideo ? (
          <video
            src={embedUrl}
            controls
            autoPlay
            className="video-player"
          />
        ) : (
          <iframe
            src={embedUrl}
            className="video-player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

/* ================================
   VIDEO CARD WITH AUTO THUMBNAILS
================================ */
function VideoCard({ video, onClick, categoryName }) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  const getThumbnail = () => {
    const url = video.url || video.secureUrl || video;
    
    if (typeof url === 'string') {
      // YouTube thumbnail
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('youtu.be/')[1]?.split('?')[0]
          : new URLSearchParams(new URL(url).search).get('v');
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }

      // Vimeo placeholder
      if (url.includes('vimeo.com')) {
        return `https://via.placeholder.com/640x360/667eea/ffffff?text=Vimeo+Video`;
      }
    }

    return `https://via.placeholder.com/640x360/667eea/ffffff?text=Video`;
  };

  const thumbnail = getThumbnail();

  return (
    <div className="video-card" onClick={() => onClick(video)}>
      <div className="video-thumbnail">
        <img
          src={thumbnail}
          alt={categoryName || "Video"}
          onLoad={() => setThumbnailLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/640x360/667eea/ffffff?text=Video';
          }}
          style={{
            opacity: thumbnailLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
        {!thumbnailLoaded && <div className="thumbnail-skeleton" />}
        
        <div className="play-overlay">
          <div className="play-button">▶</div>
        </div>
      </div>
      <div className="video-name">{categoryName}</div>
    </div>
  );
}

/* ================================
   VIDEOGRAPHY PAGE
================================ */
export default function VideographyPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const buttonsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ PERFECT: Auto-select FIRST category - ZERO warnings
  useEffect(() => {
    if (!loading && dbCategories.length > 0 && !activeCategory?._id) {
      setActiveCategory(dbCategories[0]);
    }
  }, [loading, dbCategories.length]);

  useEffect(() => {
    // ✅ CACHED FETCH for fast loading
    fetch("/api/services?type=videography", {
      cache: 'force-cache',
      next: { revalidate: 3600 }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Fetched services:", data);
        const videographyServices = Array.isArray(data) 
          ? data.filter(s => s.type === 'videography') 
          : [];
        setDbCategories(videographyServices);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching videography:", err);
        setDbCategories([]);
        setLoading(false);
      });
  }, []);

  const handleToggle = (category) => {
    setActiveCategory(activeCategory?._id === category._id ? null : category);
  };

  const getGridColumns = () => {
    if (windowWidth <= 480) return "1fr";
    if (windowWidth <= 1024) return "repeat(2, 1fr)";
    return "repeat(3, 1fr)";
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: getGridColumns(),
    gap: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 20px",
  };

  if (loading) {
    return (
      <main className="videography-page">
        <div className="loading-spinner">Loading videos...</div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        .videography-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%);
          padding: 40px 16px 60px;
          display: flex;
          justify-content: center;
        }

        .videography-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .videography-title {
          font-size: 3rem;
          text-align: center;
          margin: 0 24px;
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

        .category-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin: 0 auto 32px;
          max-width: 1100px;
        }

        .category-button {
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

        .category-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255,140,66,0.3);
          background: #fc8332;
          color: white;
          border-color: #ffb380;
        }

        .category-button.active {
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
          color: white;
          border-color: #ff6b35;
          box-shadow: 0 6px 20px rgba(255,107,53,0.5);
        }

        .video-card {
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

        .video-card .video-thumbnail {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
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

        .video-card:hover .video-thumbnail {
          transform: translateY(-6px) translateZ(0);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .video-thumbnail img {
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

        .video-card:hover .video-thumbnail img {
          transform: scale(1.03) translateZ(0);
        }

        .play-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .video-card:hover .play-overlay {
          opacity: 1;
        }

        .play-button {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #6366f1;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .video-card:hover .play-button {
          transform: scale(1.1);
        }

        .video-name {
          text-align: center;
          font-size: 17px;
          font-weight: 600;
          color: #000000;
          padding: 4px 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transition: none;
        }

        .thumbnail-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #f0f0f0;
          border-radius: 16px;
        }

        .video-modal {
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

        .video-modal.closing { 
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

        .video-modal-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-modal-content.closing {
          animation: contentScaleOut 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19);
        }

        @keyframes contentScaleOut {
          to { transform: scale(0.9); opacity: 0; }
        }

        .close-button {
          position: fixed;
          top: 30px;
          right: 30px;
          background: rgba(99, 102, 241, 0.9);
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          font-size: 24px;
          font-weight: bold;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1000001;
          box-shadow: 0 8px 32px rgba(99,102,241,0.3);
          will-change: transform;
        }

        .close-button:hover {
          transform: scale(1.15);
          box-shadow: 0 12px 40px rgba(99,102,241,0.5);
          background: rgba(99,102,241,1);
        }

        .video-player {
          width: clamp(640px, 90vw, 1200px);
          height: 80vh;
          max-height: 90vh;
          border-radius: 20px;
          box-shadow: 0 50px 150px rgba(0,0,0,0.6);
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

        .no-videos-message {
          text-align: center;
          padding: 100px 20px;
          color: #9ca3af;
        }

        @media (max-width: 1024px) {
          .videography-title { font-size: 2.5rem; }
        }

        @media (max-width: 768px) {
          .videography-title { font-size: 2rem; }
          .close-button {
            top: 15px;
            right: 15px;
            width: 44px;
            height: 44px;
            font-size: 22px;
          }
          .video-player {
            width: 95vw;
            height: 75vh;
          }
        }

        @media (max-width: 480px) {
          .videography-title { font-size: 1.75rem; }
          .close-button {
            top: 10px;
            right: 10px;
            width: 38px;
            height: 38px;
            font-size: 20px;
            border-width: 1.5px;
          }
          .video-player {
            height: 70vh;
          }
        }

        @media (max-width: 360px) {
          .close-button {
            top: 8px;
            right: 8px;
            width: 35px;
            height: 35px;
            font-size: 18px;
          }
        }
      `}</style>

      <main className="videography-page">
        <div className="videography-container">
          <h1 className="videography-title">Videography Services</h1>

          <div className="category-buttons" ref={buttonsRef}>
            {dbCategories.map((category) => (
              <button
                key={category._id || category.id}
                className={`category-button ${
                  activeCategory?._id === category._id ? "active" : ""
                }`}
                onClick={() => handleToggle(category)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {activeCategory && (
            <div style={{ marginTop: "40px" }}>
              {activeCategory.images && activeCategory.images.length > 0 ? (
                <div style={gridStyle}>
                  {activeCategory.images.map((video, index) => (
                    <VideoCard
                      key={index}
                      video={video}
                      onClick={setSelectedVideo}
                      categoryName={activeCategory.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-videos-message">
                  <p style={{ fontSize: "64px", marginBottom: "20px" }}>🎬</p>
                  <p style={{ fontSize: "20px", fontWeight: "600" }}>
                    No videos available for this category
                  </p>
                </div>
              )}
            </div>
          )}

          {!activeCategory && dbCategories.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <div style={gridStyle}>
                {dbCategories.map((category) => {
                  const firstVideo =
                    category.images && category.images.length > 0
                      ? category.images[0]
                      : null;
                  return (
                    <div
                      key={category._id || category.id}
                      onClick={() => handleToggle(category)}
                      style={{ cursor: 'pointer' }}
                    >
                      {firstVideo ? (
                        <VideoCard
                          video={firstVideo}
                          onClick={(video) => {
                            setSelectedVideo(video);
                          }}
                          categoryName={category.name}
                        />
                      ) : (
                        <div className="video-card">
                          <div className="video-thumbnail">
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <span style={{ fontSize: "48px" }}>🎬</span>
                            </div>
                            <div className="play-overlay">
                              <div className="play-button">▶</div>
                            </div>
                          </div>
                          <div className="video-name">{category.name}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {dbCategories.length === 0 && !loading && (
            <div className="no-videos-message">
              <p style={{ fontSize: "64px", marginBottom: "20px" }}>🎬</p>
              <p style={{ fontSize: "24px", fontWeight: "600", marginBottom: "10px" }}>
                No Videography Services Available Yet
              </p>
              <p style={{ fontSize: "16px" }}>
                Please add video services from the admin dashboard.
              </p>
            </div>
          )}
        </div>

        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </main>
    </>
  );
}
