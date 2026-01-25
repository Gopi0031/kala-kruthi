"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CardPage() {
  const params = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCard() {
      try {
        console.log("🔍 Fetching card with slug:", params.slug);
        
        const response = await fetch(`/api/get-card?slug=${params.slug}`);
        
        if (!response.ok) {
          throw new Error("Card not found");
        }
        
        const data = await response.json();
        console.log("✅ Card data:", data);
        setCardData(data);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchCard();
    }
  }, [params.slug]);

  // Format time in 12-hour IST format
  const formatTimeIST = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm} IST`;
  };

  // Format date
  const formatDateReadable = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={{ color: 'white', fontSize: '20px' }}>Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h1 style={{ fontSize: '72px', marginBottom: '20px' }}>404</h1>
          <p style={{ fontSize: '24px', marginBottom: '20px' }}>Card not found</p>
          <a href="/" style={styles.homeLink}>← Go to Home</a>
        </div>
      </div>
    );
  }

  const { formData, templateType, designColors, imageUrl } = cardData;

  return (
    <div style={styles.container}>
      <div style={styles.cardWrapper}>
        {/* Display generated image if available */}
        {imageUrl && (
          <div style={styles.imageContainer}>
            <img 
              src={imageUrl} 
              alt="Invitation Card"
              style={styles.cardImage}
            />
          </div>
        )}

        {/* Card details overlay */}
        <div 
          style={{
            ...styles.cardDetails,
            background: `linear-gradient(135deg, ${designColors?.primary || '#FFD700'}, ${designColors?.secondary || '#FFA500'})`,
            color: designColors?.text || '#FFFFFF',
          }}
        >
          <div style={styles.content}>
            {templateType === "wedding" && (
              <>
                <h1 style={styles.title}>
                  {formData.brideName} & {formData.groomName}
                </h1>
                <p style={styles.subtitle}>💒 Wedding Invitation</p>
                <div style={styles.details}>
                  <p style={styles.detail}>📅 {formatDateReadable(formData.weddingDate)}</p>
                  <p style={styles.detail}>🕐 {formatTimeIST(formData.weddingTime)}</p>
                  <p style={styles.detail}>📍 {formData.venue}</p>
                  {formData.contactNumber && (
                    <p style={styles.detail}>📞 {formData.contactNumber}</p>
                  )}
                </div>
              </>
            )}

            {templateType === "birthday" && (
              <>
                <h1 style={styles.title}>🎉 Happy Birthday! 🎉</h1>
                <h2 style={styles.subtitle}>{formData.personName}</h2>
                <div style={styles.details}>
                  <p style={styles.detail}>📅 {formatDateReadable(formData.birthdayDate)}</p>
                  <p style={styles.detail}>🕐 {formatTimeIST(formData.birthdayTime)}</p>
                  <p style={styles.detail}>📍 {formData.venue}</p>
                </div>
              </>
            )}

            {templateType === "prewedding" && (
              <>
                <h1 style={styles.title}>{formData.coupleName}</h1>
                <p style={styles.subtitle}>📸 Pre-Wedding Shoot</p>
                <div style={styles.details}>
                  <p style={styles.detail}>📅 {formatDateReadable(formData.shootDate)}</p>
                  <p style={styles.detail}>🕐 {formatTimeIST(formData.shootTime)}</p>
                  <p style={styles.detail}>📍 {formData.location}</p>
                </div>
              </>
            )}

            <div style={styles.footer}>
              <p>Kalakruthi Photography</p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {imageUrl && (
          <a 
            href={imageUrl} 
            download 
            style={styles.downloadBtn}
          >
            📥 Download Card
          </a>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  loading: {
    textAlign: "center",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid rgba(255,255,255,0.3)",
    borderTop: "5px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  error: {
    textAlign: "center",
    color: "white",
  },
  homeLink: {
    color: "white",
    textDecoration: "underline",
    fontSize: "18px",
  },
  cardWrapper: {
    maxWidth: "600px",
    width: "100%",
  },
  imageContainer: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    marginBottom: "20px",
  },
  cardImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  cardDetails: {
    borderRadius: "16px",
    padding: "60px 40px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    marginBottom: "20px",
  },
  content: {
    textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "20px",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "28px",
    marginBottom: "30px",
    opacity: 0.9,
  },
  details: {
    marginTop: "40px",
  },
  detail: {
    fontSize: "22px",
    marginBottom: "15px",
  },
  footer: {
    marginTop: "50px",
    fontSize: "16px",
    opacity: 0.8,
  },
  downloadBtn: {
    display: "block",
    width: "100%",
    padding: "16px",
    background: "white",
    color: "#764ba2",
    textAlign: "center",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
};
