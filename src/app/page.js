"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [heroData, setHeroData] = useState(null);
  const [homeServices, setHomeServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroData();
    fetchHomeServices();
  }, []);

  const fetchHeroData = async () => {
    try {
      // ✅ CACHE ENABLED - Fast loading
      const res = await fetch('/api/hero', { 
        cache: 'force-cache',
        next: { revalidate: 3600 } // Revalidate every hour
      });
      
      if (!res.ok) {
        console.error('Failed to fetch hero data');
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const activeHero = data.find(h => h.isActive) || data[0];
        setHeroData(activeHero);
      } else {
        setHeroData(null);
      }
    } catch (error) {
      console.error('Error fetching hero:', error);
      setHeroData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeServices = async () => {
    try {
      // ✅ CACHE ENABLED - Fast loading
      const response = await fetch('/api/home-services', { 
        cache: 'force-cache',
        next: { revalidate: 3600 } // Revalidate every hour
      });
      if (response.ok) {
        const data = await response.json();
        setHomeServices(data);
      }
    } catch (error) {
      console.error('Error fetching home services:', error);
    }
  };

  const heroImage = heroData?.image?.secure_url || heroData?.image?.url || "/hero2.png";
  const heroTitle = heroData?.title || "Welcome to Kalakruthi";
  const heroSubtitle = heroData?.subtitle || "Stories of Love & Joy of Memories.";

  return (
    <>
    <style>{`
        /* YOUR EXISTING STYLES HERE */

        /* ✅ ADD THIS BELOW YOUR EXISTING STYLES */
        
        /* Hero background responsive styles */
        @media (min-width: 1025px) {
          .hero {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .hero {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
        }

        @media (min-width: 481px) and (max-width: 640px) {
          .hero {
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
          }
        }

        @media (max-width: 480px) {
          .hero {
            background-size: contain;
            background-position: center;
            background-repeat: repeat;
          }
        }
      `}</style>
      {/* ================= HERO ================= */}
       <section
        className="hero"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="hero-overlay"></div>

        
        <div className="hero-content">
          <h1 className="hero-float">{heroTitle}</h1>
          <p className="hero-float delay">{heroSubtitle}</p>
        </div>
      </section>

      {/* ================= SERVICES (FROM DASHBOARD) ================= */}
      <section className="services-section">
        <h2 className="section-title">Our Services</h2>
        <div className="section-divider"></div>

        <div className="services-grid">
          {homeServices.map((service, index) => (
            <Service 
              key={service._id}
              img={service.image?.url || "/placeholder.png"}
              title={service.title}
              link={service.link}
              stagger={index % 2 === 1}
            />
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= SERVICE CARD ================= */
function Service({ img, title, link, stagger }) {
  return (
    <div className={`service-card ${stagger ? "stagger-down" : ""}`}>
      <div className="image-box">
        <img src={img} alt={title} />
        <Link href="/services" className="image-overlay">
          <span>View</span>
        </Link>
      </div>
      <h3>{title}</h3>
    </div>
  );
}
