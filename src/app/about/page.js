"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  return (
    <div style={styles.page}>
      {/* ================= ABOUT HEADER ================= */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={styles.section}
      >
        <h1 style={styles.mainTitle}>About Kalakruthi</h1>
        
        <p style={styles.description}>
          Our approach blends timeless tradition with contemporary cinematic
          storytelling, capturing weddings as they naturally unfold—authentic,
          elegant, and deeply personal. From intimate rituals to grand
          celebrations, Kalakruthi preserves not just how your day looked, but
          how it truly felt, with artistry that lasts forever.
        </p>
      </motion.section>

      {/* ================= IMAGE + STORY ================= */}
      <section style={styles.splitSection}>
        <motion.div
          initial={{ opacity: 0, x: -70 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          style={styles.imageBox}
        >
          <Image
            src="/about/sig3.png"
            alt="Kalakruthi wedding storytelling moment"
            fill
            style={{ objectFit: "cover", borderRadius: "22px" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 70 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          style={styles.textBox}
        >
          <h2 style={styles.subTitle}>Timeless Storytelling</h2>
          <p style={styles.text}>
            Our approach blends classic wedding traditions with modern cinematic
            storytelling. We believe the most powerful images are the ones that
            feel honest, emotional, and deeply personal.
            
            From intimate rituals to grand celebrations, Kalakruthi captures
            weddings as they naturally unfold — gracefully, artistically, and
            forever.
          </p>
        </motion.div>
      </section>

      {/* ================= B2B SERVICES ================= */}
      <section style={styles.b2bSection}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={styles.b2bTitle}
        >
          B2B Services
        </motion.h2>

        <p style={styles.b2bIntro}>
          For studios, production houses, and independent creators, Kalakruthi
          offers reliable business‑to‑business rentals on high‑end cameras,
          lenses, and drones—backed by professional maintenance and on‑time
          delivery for every shoot.
        </p>
      </section>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#e3fdf9",
    fontFamily: "'Playfair Display', serif",
    color: "#002f49",
    paddingBottom: "140px",
  },

  section: {
    padding: "50px 20px 40px",
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
  },

  mainTitle: {
    fontSize: "3.6rem",
    color: "#002f49",
    marginBottom: "14px",
    letterSpacing: "1px",
    fontWeight: "700", 
  },

  description: {
    fontSize: "1.35rem",
    lineHeight: 1.65,
    maxWidth: "880px",
    margin: "0 auto",
    color: "#002f49",
    fontWeight: "500",
  },

  splitSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "90px",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "0 20px",
  },

  imageBox: {
    flex: "1 1 480px",
    height: "300px",
    position: "relative",
  },

  textBox: {
    flex: "1 1 420px",
  },

  subTitle: {
    fontSize: "2.6rem",
    marginBottom: "22px",
    color: "#002f49",
    fontWeight: "700"
  },

  text: {
    fontSize: "1.35rem",
    lineHeight: 1.65, 
    marginBottom: "14px",
    color: "#002f49",
    fontWeight: "500"
  },

  /* ===== B2B SECTION ===== */
  b2bSection: {
    maxWidth: "1200px", 
    margin: "60px auto 0",
    padding: "0 20px 40px",
    textAlign: "center",
  },

  b2bTitle: {
    fontSize: "2.1rem", 
    marginBottom: "16px",
    color: "#002f49",
    letterSpacing: "0.06em",
  },

  b2bIntro: {
    fontSize: "1.4rem",
    lineHeight: 1.77,
    maxWidth: "860px",
    margin: "0 auto 40px",
    color: "#01314b",
  },
};