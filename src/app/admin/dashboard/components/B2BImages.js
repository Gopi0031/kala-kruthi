"use client";
import { useState, useRef, useCallback } from "react";

export default function B2BImages({ 
  b2bImages: initialImages, 
  loading, 
  showToast, 
  refreshData 
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast("File too large (max 15MB)", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await fetch("/api/b2b-images", { method: "POST", body: formData });
      const result = await res.json();
      
      if (result.success) {
        showToast("✅ Uploaded! Refreshing...", "success");
        // ✅ Force refresh after upload
        setTimeout(refreshData, 500);
      } else {
        showToast("❌ " + (result.error || "Upload failed"), "error");
      }
    } catch (error) {
      showToast("❌ Network error", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [showToast, refreshData]);

  const handleDelete = async (publicId) => {
    if (!confirm("Delete from Cloudinary?")) return;

    try {
      const res = await fetch("/api/b2b-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      
      const result = await res.json();
      if (result.success) {
        showToast("🗑️ Deleted!", "success");
        refreshData();
      } else {
        showToast("❌ Delete failed", "error");
      }
    } catch (error) {
      showToast("❌ Delete failed", "error");
    }
  };

  const handleCardClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="b2b-images-section">
      <div className="section-header">
        <h2>B2B Images (v1/b2b/)</h2>
        <p>Cloudinary folder → B2B Services page (Camera/Lens/Drone)</p>
      </div>

      <div className="images-grid">
        {Array.from({ length: 3 }).map((_, index) => {
          const image = initialImages?.[index];
          return (
            <div key={`card-${index}`} className="image-card" onClick={handleCardClick}>
              {image ? (
                <>
                  <img 
                    src={`${image.secure_url}?w=300&q=auto`}
                    alt={`B2B ${index + 1}`}
                    className="image-preview"
                  />
                  
                  <button className="upload-icon-overlay" title="Replace">
                    📤
                  </button>

                  <a 
                    href={image.secure_url} 
                    target="_blank" 
                    className="view-btn"
                    title="View full size"
                  >
                    👁️
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.public_id);
                    }}
                    className="delete-icon-overlay"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </>
              ) : (
                <div className="empty-placeholder">
                  <div className="upload-icon-large">📤</div>
                  <p>Upload #{index + 1}</p>
                  <small>{['Camera', 'Lens', 'Drone'][index]}</small>
                </div>
              )}

              <div className="image-info">
                <div className="filename">
                  {image?.filename?.split('.')[0] || `Slot ${index + 1}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="file-input" />

      <style jsx>{`
        /* Same styles as before - no hover effects */
        .b2b-images-section { padding: 2rem; max-width: 1000px; margin: 0 auto; }
        .section-header { margin-bottom: 2rem; text-align: center; }
        .section-header h2 { color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.8rem; font-weight: 700; }
        .section-header p { color: #6b7280; margin: 0; font-size: 1rem; }
        
        .images-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .image-card { 
          background: #f9fafb; border-radius: 12px; overflow: hidden; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 2px solid #e5e7eb; 
          position: relative; height: 320px; display: flex; flex-direction: column;
          cursor: pointer;
        }
        .image-preview { width: 100%; height: 200px; object-fit: cover; }
        
        .upload-icon-overlay, .view-btn, .delete-icon-overlay {
          position: absolute; width: 48px; height: 48px; border: none; border-radius: 50%;
          font-size: 1.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
          z-index: 10;
        }
        .upload-icon-overlay { top: 12px; left: 12px; background: #10b981; color: white; box-shadow: 0 2px 10px rgba(16,185,129,0.4); }
        .view-btn { top: 12px; right: 12px; background: #3b82f6; color: white; text-decoration: none; box-shadow: 0 2px 10px rgba(59,130,246,0.4); }
        .delete-icon-overlay { bottom: 12px; right: 12px; background: #ef4444; color: white; box-shadow: 0 2px 10px rgba(239,68,68,0.4); }
        
        .empty-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f3f4f6; gap: 0.5rem; padding: 1rem; }
        .upload-icon-large { font-size: 3rem; opacity: 0.6; }
        .empty-placeholder p { font-size: 1rem; font-weight: 600; color: #374151; margin: 0; }
        .empty-placeholder small { color: #9ca3af; font-size: 0.85rem; }
        
        .image-info { padding: 0.75rem 1rem; background: white; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
        .filename { font-size: 0.9rem; color: #6b7280; font-weight: 500; text-align: center; width: 100%; }
        .file-input { display: none; }
        
        @media (max-width: 768px) { .images-grid { gap: 1rem; } .image-card { height: 280px; } .image-preview, .empty-placeholder { height: 160px; } }
      `}</style>
    </div>
  );
}
