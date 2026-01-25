'use client'
import React from 'react'

const packages = [
  {
    name: "Basic Package",
    price: "₹30,000",
    sheets: "30 Sheets",
    features: [
      "Traditional Photography",
      "Traditional Video",
    ],
    color: "#3b82f6",
    icon: "📸",
  },
  {
    name: "Standard Package",
    price: "Custom",
    sheets: "40 Sheets",
    features: [
      "Traditional Photography",
      "Traditional Video",
      "Candid Photography (OR) Candid Videography",
    ],
    color: "#ec4899",
    icon: "💎",
  },
  {
    name: "Premium Package",
    price: "₹60,000",
    sheets: "50 Sheets",
    features: [
      "Traditional Photography",
      "Traditional Video",
      "Candid Photography",
      "Candid Videography",
    ],
    color: "#ff6b35",
    icon: "🎥",
    featured: true,
  },
  {
    name: "Luxury Package",
    price: "₹1,00,000",
    sheets: "80 Sheets",
    features: [
      "Traditional Photography",
      "Traditional Video",
      "Candid Photography",
      "Candid Videography",
      "Net Live",
      "Drone",
      "Post Wedding",
      "Save The Date (Video)",
      "Save The Date (Image)",
    ],
    color: "#10b981",
    icon: "👑",
  },
]

export default function Packages() {
  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "white", paddingTop: "20px", paddingBottom: "20px" }}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        /* Mobile Styles - 1 column, full width */
        @media (max-width: 640px) {
          .packages-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px;
          }

          .package-card {
            padding: 20px !important;
          }

          .package-icon {
            font-size: 32px !important;
            padding: 10px 12px !important;
          }

          .package-name {
            font-size: 16px !important;
          }

          .package-sheets {
            font-size: 11px !important;
          }

          .package-price {
            font-size: 24px !important;
          }

          .feature-list {
            gap: 6px !important;
          }

          .feature-item {
            padding: 8px 10px !important;
            font-size: 12px !important;
          }

          .cta-button {
            padding: 12px 16px !important;
            font-size: 12px !important;
          }
        }

        /* Tablet Styles - 2 columns */
        @media (min-width: 641px) and (max-width: 1024px) {
          .packages-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
            padding: 20px;
          }

          .package-card {
            padding: 22px !important;
          }

          .package-icon {
            font-size: 36px !important;
            padding: 12px 14px !important;
          }

          .package-name {
            font-size: 18px !important;
          }

          .package-sheets {
            font-size: 11px !important;
          }

          .package-price {
            font-size: 28px !important;
          }

          .feature-list {
            gap: 7px !important;
          }

          .feature-item {
            padding: 9px 11px !important;
            font-size: 12px !important;
          }

          .cta-button {
            padding: 12px 16px !important;
            font-size: 13px !important;
          }
        }

        /* Desktop Styles - 4 compact columns */
        @media (min-width: 1025px) {
          .packages-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            padding: 24px;
            max-width: 1600px;
            margin: 0 auto;
          }

          .package-card {
            padding: 18px !important;
          }

          .package-icon {
            font-size: 32px !important;
            padding: 10px 12px !important;
          }

          .package-name {
            font-size: 15px !important;
          }

          .package-sheets {
            font-size: 10px !important;
          }

          .package-price {
            font-size: 22px !important;
          }

          .price-label {
            font-size: 9px !important;
          }

          .package-header {
            margin-bottom: 12px !important;
            gap: 8px !important;
          }

          .price-box {
            padding: 12px 14px !important;
            margin-bottom: 14px !important;
          }

          .features-section {
            margin-bottom: 16px !important;
          }

          .feature-header {
            font-size: 11px !important;
            margin-bottom: 10px !important;
          }

          .feature-list {
            gap: 6px !important;
          }

          .feature-item {
            padding: 6px 8px !important;
            font-size: 11px !important;
          }

          .cta-button {
            padding: 10px 14px !important;
            font-size: 12px !important;
          }
        }

        /* Large Desktop - Still 4 columns with normal sizing */
        @media (min-width: 1400px) {
          .packages-container {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 32px;
          }
        }
      `}</style>

      <div className="packages-container">
        {packages.map((pkg, idx) => (
          <div
            key={idx}
            className={`package-card`}
            style={{
              background: pkg.featured
                ? `linear-gradient(135deg, ${pkg.color}15 0%, ${pkg.color}08 100%)`
                : "#ffffff",
              borderRadius: "12px",
              boxShadow: pkg.featured
                ? `0 8px 24px ${pkg.color}20`
                : "0 2px 8px rgba(0, 0, 0, 0.08)",
              border: pkg.featured
                ? `2px solid ${pkg.color}`
                  : `2px solid ${pkg.color}80`,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = pkg.featured
                ? `0 12px 32px ${pkg.color}30`
                : "0 4px 16px rgba(0, 0, 0, 0.12)"
              e.currentTarget.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = pkg.featured
                ? `0 8px 24px ${pkg.color}20`
                : "0 2px 8px rgba(0, 0, 0, 0.08)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            {/* Package Icon and Name */}
            <div
              className="package-header"
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <div
                className="package-icon"
                style={{
                  background: `${pkg.color}12`,
                  padding: "12px 14px",
                  borderRadius: "8px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {pkg.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3
                  className="package-name"
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#1f2937",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    lineHeight: 1.2,
                  }}
                >
                  {pkg.name}
                </h3>
                <p
                  className="package-sheets"
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    margin: 0,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.2px",
                  }}
                >
                  {pkg.sheets}
                </p>
              </div>
            </div>

            {/* Featured Badge */}
            {pkg.featured && (
              <div style={{
                background: pkg.color,
                color: "white",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "10px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                display: "inline-block",
                marginBottom: "12px",
                width: "fit-content",
              }}>
                ⭐ Most Popular
              </div>
            )}

            {/* Price */}
            <div
              className="price-box"
              style={{
                background: `${pkg.color}10`,
                padding: "14px 16px",
                borderRadius: "8px",
                borderLeft: `4px solid ${pkg.color}`,
                position: "relative",
                zIndex: 1,
                marginBottom: "16px",
              }}
            >
              <p
                className="price-label"
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  margin: "0 0 6px 0",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.2px",
                }}
              >
                Starting Price
              </p>
              <p
                className="package-price"
                style={{
                  fontSize: "26px",
                  fontWeight: "900",
                  color: pkg.color,
                  margin: 0,
                }}
              >
                {pkg.price}
              </p>
            </div>

            {/* Features */}
            <div
              className="features-section"
              style={{
                marginBottom: "16px",
                position: "relative",
                zIndex: 1,
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h4
                className="feature-header"
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: pkg.color,
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                📋 Includes:
              </h4>
              <ul
                className="feature-list"
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  flex: 1,
                }}
              >
                {pkg.features.map((feature, i) => (
                  <li
                    key={i}
                    className="feature-item"
                    style={{
                      padding: "8px 10px",
                      background: `${pkg.color}08`,
                      borderRadius: "6px",
                      color: "#374151",
                      fontSize: "13px",
                      fontWeight: "600",
                      border: `1px solid ${pkg.color}20`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${pkg.color}15`
                      e.currentTarget.style.borderColor = `${pkg.color}40`
                      e.currentTarget.style.paddingLeft = "12px"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${pkg.color}08`
                      e.currentTarget.style.borderColor = `${pkg.color}20`
                      e.currentTarget.style.paddingLeft = "10px"
                    }}
                  >
                    
                    <span style={{ lineHeight: 1.3 }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            
          </div>
        ))}
      </div>
    </div>
  )
}
