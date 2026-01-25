'use client'
import React from 'react'

export default function HeroSection({
  heroImages,
  heroFormData,
  setHeroFormData,
  selectedHeroImage,
  heroPreviewUrl,
  handleHeroImageSelect,
  handleUploadHeroImage,
  handleDeleteHeroImage,
  toggleHeroActive,
  loading,
  showToast
}) {
  return (
    <div>
      {/* Upload Form */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
          ➕ Add Hero Image
        </h3>
        <form onSubmit={handleUploadHeroImage}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
              Title
            </label>
            <input
              type="text"
              value={heroFormData.title}
              onChange={(e) => setHeroFormData({ ...heroFormData, title: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
              Subtitle
            </label>
            <input
              type="text"
              value={heroFormData.subtitle}
              onChange={(e) => setHeroFormData({ ...heroFormData, subtitle: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
              Image (Max 15MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroImageSelect}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          {heroPreviewUrl && (
            <div style={{ marginBottom: "16px" }}>
              <img
                src={heroPreviewUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Uploading..." : "Upload Hero Image"}
          </button>
        </form>
      </div>

      {/* Hero Images List */}
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
          🖼️ Current Hero Images
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          {heroImages.map((hero) => (
            <div
              key={hero._id}
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: hero.isActive ? "3px solid #10b981" : "1px solid #e5e7eb",
              }}
            >
              <img
                src={hero.imageUrl}
                alt={hero.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: "16px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                  {hero.title}
                </h4>
                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                  {hero.subtitle}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => toggleHeroActive(hero)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: hero.isActive ? "#fbbf24" : "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {hero.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteHeroImage(hero._id)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {heroImages.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "2px dashed #d1d5db",
          }}>
            <p style={{ fontSize: "16px", color: "#6b7280" }}>
              No hero images yet. Add your first hero image above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
