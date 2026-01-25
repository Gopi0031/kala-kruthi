'use client'
import React from 'react'

export default function Gallery({ 
  galleryMedia, 
  handleGalleryUpload, 
  deleteGalleryMedia, 
  loading 
}) {
  return (
    <div>
      <div style={{
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>
          🖼️ Gallery Management
        </h3>
        <label style={{
          padding: "12px 24px",
          background: "#10b981",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
        }}>
          📤 Upload Media
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleGalleryUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "16px",
      }}>
        {galleryMedia.map((media, idx) => (
          <div
            key={idx}
            style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {media.resourceType === "video" ? (
              <video
                src={media.url}
                controls
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <img
                src={media.url}
                alt="Gallery"
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                }}
              />
            )}
            <button
              onClick={() => deleteGalleryMedia(media.publicId)}
              disabled={loading}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>

      {galleryMedia.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#f9fafb",
          borderRadius: "12px",
          border: "2px dashed #d1d5db",
        }}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            No media uploaded yet. Click "Upload Media" to add images or videos.
          </p>
        </div>
      )}
    </div>
  )
}
