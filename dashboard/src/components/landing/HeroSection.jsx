import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function HeroSection() {
  const handleCTA = () => {
    const el = document.getElementById('dashboard-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="landing-section"
      style={{
        background: `
          radial-gradient(ellipse at 50% 20%, rgba(152,193,217,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(105,105,179,0.05) 0%, transparent 50%),
          #0A0610
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 640, padding: '0 24px' }}>
        <div
          className="hero-label"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(152,193,217,0.6)',
            marginBottom: 20,
          }}
        >
          CONTINUOUS COMPLIANCE
        </div>

        <h1
          className="hero-title"
          style={{
            fontSize: 'clamp(48px, 6vw, 80px)',
            fontWeight: 300,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 24px 0',
            textTransform: 'lowercase',
          }}
        >
          latch
        </h1>

        <p
          className="hero-subtitle"
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 580,
            lineHeight: 1.7,
            margin: '0 auto 40px',
          }}
        >
          Real-time drift detection for biotech infrastructure.
          Continuous monitoring, AI classification, and automated
          remediation — so your validated state stays validated.
        </p>

        <button
          className="hero-cta"
          onClick={handleCTA}
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(152,193,217,0.85)',
            background: 'transparent',
            border: '1px solid rgba(152,193,217,0.35)',
            borderRadius: 4,
            padding: '14px 36px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(152,193,217,0.6)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(152,193,217,0.1)'
            e.currentTarget.style.color = '#FFFFFF'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(152,193,217,0.35)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.color = 'rgba(152,193,217,0.85)'
          }}
        >
          explore platform
        </button>
      </div>

      <div
        className="hero-scroll-indicator"
        style={{
          position: 'absolute',
          bottom: 48,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <ChevronDown size={20} style={{ color: 'rgba(255,255,255,0.15)' }} />
      </div>
    </section>
  )
}
