'use client'
import React, { useState } from 'react'

export default function HomeServices({
  homeServices,
  setHomeServices,
  loading,
  setLoading,
  showToast,
  refreshData
}) {
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    order: 0
  })

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      link: service.link || '#',
      order: service.order || 0
    })
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showToast('Please enter service title', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/home-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: editingService?._id,
          ...formData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save service')
      }

      showToast('Service saved successfully!', 'success')
      setEditingService(null)
      setFormData({ title: '', link: '', order: 0 })
      await refreshData()
    } catch (error) {
      console.error('Save error:', error)
      showToast(`Error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImagesUpload = async (serviceId, event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    try {
      setLoading(true)

      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('serviceId', serviceId)

        const response = await fetch('/api/home-services/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to upload image')
        }
      }

      showToast(`${files.length} image(s) uploaded successfully!`, 'success')
      event.target.value = ''
      await refreshData()
    } catch (error) {
      console.error('Upload error:', error)
      showToast(`Upload failed: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      setLoading(true)
      const response = await fetch('/api/home-services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serviceId })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete service')
      }

      showToast('Service deleted successfully!', 'success')
      await refreshData()
    } catch (error) {
      console.error('Delete error:', error)
      showToast(`Delete failed: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Add/Edit Service Form */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "24px",
        border: "1px solid #e5e7eb"
      }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "700", 
          color: "#1f2937", 
          marginBottom: "20px",
          borderLeft: "4px solid #10b981",
          paddingLeft: "12px"
        }}>
          {editingService ? '✏️ Edit Service' : '➕ Add New Service'}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            type="text"
            placeholder="Service title (e.g., Wedding Photography)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#10b981"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />

          <input
            type="text"
            placeholder="Link (e.g., /services/wedding)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            style={{
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#10b981"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />

          <input
            type="number"
            placeholder="Order (0, 1, 2, 3...)"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            style={{
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#10b981"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {editingService ? '💾 Update Service' : '➕ Add Service'}
            </button>

            {editingService && (
              <button
                onClick={() => {
                  setEditingService(null)
                  setFormData({ title: '', link: '', order: 0 })
                }}
                style={{
                  padding: "12px 24px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <h3 style={{ 
          fontSize: "20px", 
          fontWeight: "700", 
          color: "#1f2937", 
          marginBottom: "20px",
          borderLeft: "4px solid #10b981",
          paddingLeft: "12px"
        }}>
          🏠 Home Page Services
        </h3>

        {homeServices.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "2px dashed #d1d5db"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
            <p style={{ fontSize: "16px", color: "#6b7280", fontWeight: "500" }}>
              No services added yet. Add your first service above!
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {homeServices.sort((a, b) => a.order - b.order).map((service) => {
              return (
                <div
                  key={service._id}
                  style={{
                    background: "#ffffff",
                    padding: "24px",
                    borderRadius: "16px",
                    border: "2px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                >
                  {/* Service Info */}
                  <h4 style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#1f2937",
                    marginBottom: "12px"
                  }}>
                    {service.title}
                  </h4>

                  <p style={{ 
                    fontSize: "14px", 
                    color: "#6b7280", 
                    marginBottom: "20px",
                    background: "#f3f4f6",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    display: "inline-block",
                    fontWeight: "600"
                  }}>
                    📊 Order: {service.order}
                  </p>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "row", gap: "10px" ,width:"50px"}}>
                    <label style={{
                      padding: "14px 16px",
                      background: "#3b82f6",
                      color: "white",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "15px",
                      textAlign: "center",
                      transition: "background 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px"
                    }}>
                      <span>📤</span>
                      {/* <span>Upload Image</span> */}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImagesUpload(service._id, e)}
                        style={{ display: "none" }}
                      />
                    </label>

                    <button
                      onClick={() => handleEdit(service)}
                      style={{
                        padding: "14px 16px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px"
                      }}
                    >
                      <span>✏️</span>
                      {/* <span>Edit Details</span> */}
                    </button>

                    <button
                      onClick={() => handleDelete(service._id)}
                      disabled={loading}
                      style={{
                        padding: "14px 16px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "15px",
                        width:"100%",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0px"
                      }}
                    >
                      <span>🗑️</span>
                      {/* <span>Delete Service</span> */}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
