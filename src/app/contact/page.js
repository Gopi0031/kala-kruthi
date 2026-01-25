"use client";

import { useState } from "react";
import "../globals.css";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const REQUIREMENTS = [
  "Candid Photography",
  "Traditional Photography",
  "Drone",
  "LED Wall",
  "Live Streaming",
  "Additional Camera",
];

export default function ContactPage() {
  const [events, setEvents] = useState([{ name: "", requirements: [] }]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const addEvent = () => {
    setEvents([...events, { name: "", requirements: [] }]);
  };

  const removeEvent = (index) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const toggleRequirement = (eventIndex, req) => {
    const updated = [...events];
    updated[eventIndex].requirements.includes(req)
      ? (updated[eventIndex].requirements =
          updated[eventIndex].requirements.filter((r) => r !== req))
      : updated[eventIndex].requirements.push(req);
    setEvents(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📤 Sending quotation request...');
      
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          startDate,
          endDate,
          notes,
          events,
        }),
      });

      const data = await res.json();
      console.log('📡 Response:', data);

      if (data.success) {
        toast.success("✅ Message sent successfully! We will contact you soon.", { 
          position: "top-right",
          duration: 4000,
        });
        
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setStartDate("");
        setEndDate("");
        setNotes("");
        setEvents([{ name: "", requirements: [] }]);
        
      } else {
        toast.error(`❌ ${data.message || 'Failed to send message'}`, { 
          position: "top-right",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("❌ Server error. Please try again.", { 
        position: "top-right",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Kalakruthi Wedding Photography",
            "description":
              "Request a quotation for wedding photography, videography, drone, LED wall and live streaming services.",
            "url": "https://www.kalakruthi.com/contact",
            "mainEntity": {
              "@type": "ProfessionalService",
              "name": "Kalakruthi Wedding Photography",
              "url": "https://www.kalakruthi.com",
              "logo": "https://www.kalakruthi.com/logo.png",
              "image": "https://www.kalakruthi.com/cover.jpg",
              "telephone": "+91-9876543210",
              "email": "contact@kalakruthi.com",
              "priceRange": "₹₹₹",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Guntur",
                "addressRegion": "Andhra Pradesh",
                "postalCode": "522001",
                "addressCountry": "IN"
              },
              "areaServed": {
                "@type": "State",
                "name": "Andhra Pradesh"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9876543210",
                "contactType": "customer support",
                "availableLanguage": ["English", "Telugu"]
              },
              "sameAs": [
                "https://www.instagram.com/kalakruthi",
                "https://www.facebook.com/kalakruthi",
                "https://wa.me/919876543210"
              ]
            }
          })
        }}
      />

      {/* ✅ TOASTER */}
      <Toaster position="top-right" />

      <section className="contact-wrapper">
        <div className="contact-layout">

          {/* LEFT SIDE – FORM */}
          <div className="contact-card">
            <h1>Request a Quotation</h1>

            <form onSubmit={handleSubmit}>
              <label>Full name</label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />

              <label>Phone number</label>
              <div className="phone-row">
                <span>+91</span>
                <input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter phone number"
                />
              </div>

              <label>Email address</label>
              <input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
              />

              {events.map((event, i) => (
                <div key={i} className="event-box">
                  <div className="event-header">
                    <label>Event {i + 1}</label>
                    {events.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeEvent(i)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <input
                    value={event.name}
                    onChange={(e) => {
                      const updated = [...events];
                      updated[i].name = e.target.value;
                      setEvents(updated);
                    }}
                    placeholder="e.g., Wedding, Reception, Engagement"
                  />

                  <div className="checkbox-row">
                    {REQUIREMENTS.map((req) => (
                      <label key={req} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={event.requirements.includes(req)}
                          onChange={() => toggleRequirement(i, req)}
                        />
                        <span>{req}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button type="button" className="link-btn" onClick={addEvent}>
                + Add event
              </button>

              <div className="date-row">
                <div className="date-field">
                  <label>Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="date-field">
                  <label>End date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label>Additional notes</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements or details..."
              />

              <button 
                className="submit-btn"
                type="submit"
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Sending...' : 'Submit'}
              </button>
            </form>
          </div>

          {/* RIGHT SIDE – CONTACT DETAILS */}
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '15px', lineHeight: '1.5' }}>
              Have questions? We're here to help! Reach out to us through any of the channels below.
            </p>

           

            {/* Phone */}
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderLeft: '4px solid #22c55e',
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: '#dcfce7', 
                  padding: '12px', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaPhoneAlt style={{ color: '#16a34a', fontSize: '20px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '6px', fontSize: '15px' }}>
                    Phone
                  </div>
                  <a 
                    href="tel:+919876543210"
                    style={{ 
                      fontSize: '16px', 
                      color: '#16a34a', 
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={{ 
              backgroundColor: '#fefce8', 
              border: '1px solid #fde68a', 
              borderLeft: '4px solid #eab308',
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: '#fef9c3', 
                  padding: '12px', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaEnvelope style={{ color: '#ca8a04', fontSize: '20px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '6px', fontSize: '15px' }}>
                    Email
                  </div>
                  <a 
                    href="mailto:nextgenevofficial@gmail.com" 
                    style={{ 
                      fontSize: '14px', 
                      color: '#ca8a04', 
                      textDecoration: 'none',
                      fontWeight: '600',
                      wordBreak: 'break-all'
                    }}
                  >
                    contact@kalakruthi.com

                  </a>
                </div>
              </div>
            </div>
             {/* Location */}
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderLeft: '4px solid #0ea5e9',
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: '#e0f2fe', 
                  padding: '12px', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaMapMarkerAlt style={{ color: '#0284c7', fontSize: '20px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '6px', fontSize: '15px' }}>
                    Location
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                   Kalakruthi Wedding Photography
                  Guntur, Andhra Pradesh, India
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
      </section>
    </>
  );
}
