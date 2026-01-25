"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

/* =======================================
   🖼️ IMAGE WITH LOADING STATE
   ====================================== */
function ImageWithLoader({ src, alt, className, onClick }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
        }}
        onClick={onClick}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      )}
    </div>
  );
}

/* =======================================
   🖼️ IMAGE MODAL
   ====================================== */
function ImagePopup({ src, onClose }) {
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      >
        <div className="absolute inset-0" onClick={onClose} />
        <img
          src={src}
          className="max-w-[90%] max-h-[90%] rounded-2xl shadow-2xl"
        />
      </div>
    </AnimatePresence>
  );
}

export default function GalleryPage() {
  const [gallery, setGallery] = useState({ photos: [] });
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    // Fetch gallery data from API
    const fetchGallery = async () => {
      try {
        console.log('📸 Fetching gallery images...');
        const res = await fetch('/api/gallery');
        const data = await res.json();
        console.log('✅ Gallery data received:', data);
        
        // Only photos
        const photos = data.media
          ?.filter(item => item.type === 'image')
          .map(item => ({
            id: item._id || item.public_id,
            url: item.secure_url || item.url
          })) || [];

        setGallery({ photos });
      } catch (error) {
        console.error('❌ Error loading gallery:', error);
        setGallery({ photos: [] });
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black  flex flex-col items-center justify-center">
      <h1 className="text-6xl md:text-8xl font-bold text-gray-900 ">
        Gallery
      </h1>
      
      {gallery.photos.length === 0 ? null : (
        gallery.photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setActiveImage(photo.url)}
            className="cursor-pointer mx-auto mb-8 max-w-2xl"
          >
            <ImageWithLoader
              src={photo.url}
              alt=""
              className="rounded-2xl shadow-xl max-h-[80vh] w-auto h-auto object-contain"
            />
          </div>
        ))
      )}

      {/* MODALS */}
      {activeImage && (
        <ImagePopup src={activeImage} onClose={() => setActiveImage(null)} />
      )}
    </div>
  );
}
