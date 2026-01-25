'use client'
import React, { useState } from 'react'

export default function Services({
  services,
  serviceInput,
  setServiceInput,
  addService,
  deleteService,
  handleDirectUpload,
  handleVideoUrlUpload,
  deleteServiceImage,
  loading,
  activeTab,
  setActiveTab
}) {
  const [fullPageService, setFullPageService] = useState(null)
  const [videoUrls, setVideoUrls] = useState({})
  const [uploadMethod, setUploadMethod] = useState({})

  const openFullPageView = (service) => {
    setFullPageService(service)
    document.body.style.overflow = 'hidden'
  }

  const closeFullPageView = () => {
    setFullPageService(null)
    document.body.style.overflow = 'auto'
  }

  const handleVideoUrlChange = (serviceId, value) => {
    setVideoUrls(prev => ({
      ...prev,
      [serviceId]: value
    }))
  }

  const submitVideoUrl = (serviceId) => {
    const url = videoUrls[serviceId]?.trim()
    if (url && handleVideoUrlUpload) {
      handleVideoUrlUpload(serviceId, url, activeTab)
      setVideoUrls(prev => ({
        ...prev,
        [serviceId]: ''
      }))
    }
  }

  const toggleUploadMethod = (serviceId, method) => {
    setUploadMethod(prev => ({
      ...prev,
      [serviceId]: method
    }))
  }

  // Filter services based on active tab with correct type checking
  const filteredServices = services.filter(service => {
    if (activeTab === 'photography') {
      return service.type === 'photography' || !service.type || service.type === ''
    }
    if (activeTab === 'videography') {
      return service.type === 'videography'
    }
    return true
  })

  return (
    <div>
      {/* Add Service Form */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
          ➕ Add New Service
        </h3>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            placeholder={`Service name (e.g., ${activeTab === 'videography' ? 'Wedding Films' : 'Wedding Photography'})`}
            value={serviceInput}
            onChange={(e) => setServiceInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addService()}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={addService}
            disabled={loading || !serviceInput.trim()}
            style={{
              padding: "12px 24px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: loading || !serviceInput.trim() ? "not-allowed" : "pointer",
              opacity: loading || !serviceInput.trim() ? 0.6 : 1,
            }}
          >
            Add Service
          </button>
        </div>
      </div>

      {/* Tab Toggle Buttons */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
      }}>
        <button
          onClick={() => setActiveTab('photography')}
          style={{
            padding: "12px 24px",
            background: activeTab === 'photography' ? "#10b981" : "#f3f4f6",
            color: activeTab === 'photography' ? "white" : "#4b5563",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          📸 Photography
        </button>
        <button
          onClick={() => setActiveTab('videography')}
          style={{
            padding: "12px 24px",
            background: activeTab === 'videography' ? "#10b981" : "#f3f4f6",
            color: activeTab === 'videography' ? "white" : "#4b5563",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🎥 Videography
        </button>
      </div>

      {/* Services Grid */}
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
          {activeTab === 'photography' ? '📸 Photography Services' : '🎥 Videography Services'}
        </h3>
        
        {filteredServices.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "2px dashed #d1d5db",
          }}>
            <p style={{ fontSize: "16px", color: "#6b7280" }}>
              No {activeTab} services added yet. Create your first service above.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: "20px" 
          }}>
            {filteredServices.map((service) => {
              const serviceId = service._id || service.id
              const imageCount = service.images?.length || 0
              const isVideography = activeTab === 'videography'
              const currentMethod = uploadMethod[serviceId] || 'url'

              return (
                <div
                  key={serviceId}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Service Header */}
                  <div style={{
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "2px solid #e5e7eb",
                  }}>
                    <h4 style={{ 
                      fontSize: "18px", 
                      fontWeight: "700", 
                      color: "#1f2937",
                      marginBottom: "8px"
                    }}>
                      {service.name}
                    </h4>
                    <p style={{ 
                      fontSize: "13px", 
                      color: "#6b7280",
                      fontWeight: "600" 
                    }}>
                      {imageCount} {isVideography ? (imageCount === 1 ? 'Video' : 'Videos') : (imageCount === 1 ? 'Image' : 'Images')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {!isVideography ? (
                      // PHOTOGRAPHY UPLOAD
                      <div style={{ display: "flex", gap: "8px" }}>
                        <label 
                          title="Upload Images"
                          style={{
                            flex: 1,
                            padding: "10px 16px",
                            background: "#3b82f6",
                            color: "white",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "13px",
                            textAlign: "center",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
                        >
                          📤 Upload
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleDirectUpload(serviceId, e, 'photography')}
                            style={{ display: "none" }}
                          />
                        </label>

                        {imageCount > 0 && (
                          <button
                            title="View Images"
                            onClick={() => openFullPageView(service)}
                            style={{
                              padding: "10px 16px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: "600",
                              fontSize: "13px",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#059669"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#10b981"}
                          >
                            👁️ View
                          </button>
                        )}

                        <button
                          title="Delete Service"
                          onClick={() => deleteService(serviceId)}
                          disabled={loading}
                          style={{
                            padding: "10px 16px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#dc2626")}
                          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#ef4444")}
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      // VIDEOGRAPHY - URL OR FILE UPLOAD
                      <>
                        {/* Toggle Method */}
                        <div style={{ 
                          display: "flex", 
                          gap: "8px",
                          padding: "4px",
                          background: "#f3f4f6",
                          borderRadius: "8px"
                        }}>
                          <button
                            onClick={() => toggleUploadMethod(serviceId, 'url')}
                            style={{
                              flex: 1,
                              padding: "8px",
                              background: currentMethod === 'url' ? "#8b5cf6" : "transparent",
                              color: currentMethod === 'url' ? "white" : "#6b7280",
                              border: "none",
                              borderRadius: "6px",
                              fontWeight: "600",
                              fontSize: "12px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            🔗 Paste URL
                          </button>
                          <button
                            onClick={() => toggleUploadMethod(serviceId, 'file')}
                            style={{
                              flex: 1,
                              padding: "8px",
                              background: currentMethod === 'file' ? "#8b5cf6" : "transparent",
                              color: currentMethod === 'file' ? "white" : "#6b7280",
                              border: "none",
                              borderRadius: "6px",
                              fontWeight: "600",
                              fontSize: "12px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            📤 Upload File
                          </button>
                        </div>

                        {/* URL Input */}
                        {currentMethod === 'url' && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="text"
                              placeholder="YouTube, Vimeo, or video URL"
                              value={videoUrls[serviceId] || ''}
                              onChange={(e) => handleVideoUrlChange(serviceId, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  submitVideoUrl(serviceId)
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: "10px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "13px",
                              }}
                            />
                            <button
                              title="Add Video URL"
                              onClick={() => submitVideoUrl(serviceId)}
                              disabled={loading || !videoUrls[serviceId]?.trim()}
                              style={{
                                padding: "10px 16px",
                                background: "#8b5cf6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: loading || !videoUrls[serviceId]?.trim() ? "not-allowed" : "pointer",
                                opacity: loading || !videoUrls[serviceId]?.trim() ? 0.6 : 1,
                                transition: "background 0.2s",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={(e) => !loading && videoUrls[serviceId]?.trim() && (e.currentTarget.style.background = "#7c3aed")}
                              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#8b5cf6")}
                            >
                              ➕ Add
                            </button>
                          </div>
                        )}

                        {/* File Upload */}
                        {currentMethod === 'file' && (
                          <label 
                            title="Upload Video File"
                            style={{
                              padding: "10px 16px",
                              background: "#8b5cf6",
                              color: "white",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#7c3aed"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#8b5cf6"}
                          >
                            📤 Upload Video File
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleDirectUpload(serviceId, e, 'videography')}
                              style={{ display: "none" }}
                            />
                          </label>
                        )}

                        {/* View & Delete Buttons */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          {imageCount > 0 && (
                            <button
                              title="View Videos"
                              onClick={() => openFullPageView(service)}
                              style={{
                                flex: 1,
                                padding: "10px 16px",
                                background: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#059669"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "#10b981"}
                            >
                              👁️ View
                            </button>
                          )}

                          <button
                            title="Delete Service"
                            onClick={() => deleteService(serviceId)}
                            disabled={loading}
                            style={{
                              padding: "10px 16px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: "600",
                              fontSize: "13px",
                              cursor: loading ? "not-allowed" : "pointer",
                              opacity: loading ? 0.6 : 1,
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#dc2626")}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#ef4444")}
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Full-Page Viewer Modal */}
      {fullPageService && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 9999,
            overflowY: "auto",
            padding: "20px",
          }}
          onClick={closeFullPageView}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              position: "sticky",
              top: 0,
              background: "rgba(0, 0, 0, 0.9)",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
              backdropFilter: "blur(10px)",
            }}>
              <div>
                <h2 style={{ 
                  fontSize: "24px", 
                  fontWeight: "700", 
                  color: "white",
                  marginBottom: "4px"
                }}>
                  {fullPageService.name}
                </h2>
                <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                  {fullPageService.images?.length || 0} {activeTab === 'videography' ? 'Videos' : 'Images'}
                </p>
              </div>
              <button
                title="Close"
                onClick={closeFullPageView}
                style={{
                  padding: "12px 24px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                ✕ Close
              </button>
            </div>

            {/* Images/Videos Grid */}
            {fullPageService.images && fullPageService.images.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "16px",
                paddingBottom: "40px",
              }}>
                {fullPageService.images.map((img, imgIdx) => (
                  <div
                    key={imgIdx}
                    style={{
                      position: "relative",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                      transition: "transform 0.2s",
                      background: "#1f2937",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <img
                      src={img.url || img}
                      alt={`${fullPageService.name} ${imgIdx + 1}`}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      title={activeTab === 'videography' ? "Delete Video" : "Delete Image"}
                      onClick={() => deleteServiceImage(fullPageService._id || fullPageService.id, img.publicId || img)}
                      disabled={loading}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 0.95,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = "0.95")}
                    >
                      🗑️
                    </button>
                    <div style={{
                      position: "absolute",
                      bottom: "8px",
                      left: "8px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}>
                      {imgIdx + 1} / {fullPageService.images.length}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "#1f2937",
                borderRadius: "12px",
              }}>
                <p style={{ fontSize: "16px", color: "#9ca3af" }}>
                  No {activeTab === 'videography' ? 'videos' : 'images'} available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
