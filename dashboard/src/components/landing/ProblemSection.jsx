import React from 'react'

const STATS = [
  { value: '$19,533', label: 'average cost per compliance gap' },
  { value: '85%', label: 'of drift goes undetected between audits' },
  { value: '$1M+/day', label: 'potential exposure from critical violations' },
]

export default function ProblemSection({ visible }) {
  return (
    <section
      className={`landing-section${visible ? ' in-view' : ''}`}
      style={{
        background: '#0D0918',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 900, padding: '0 24px', textAlign: 'center' }}>
        <div
          className="landing-animate"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(239,83,80,0.55)',
            marginBottom: 20,
          }}
        >
          THE PROBLEM
        </div>

        <h2
          className="landing-animate landing-heading"
          style={{
            fontSize: 40,
            fontWeight: 300,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: '0 0 20px 0',
            textTransform: 'lowercase',
          }}
        >
          for 9 months out of 12, nobody's watching.
        </h2>

        <p
          className="landing-animate"
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 640,
            lineHeight: 1.7,
            margin: '0 auto 48px',
          }}
        >
          Between annual audits, infrastructure drifts silently out of its
          validated state. Configuration changes accumulate undetected,
          creating compliance gaps that only surface during the next review.
        </p>

        <div
          className="landing-animate landing-cards-row"
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'center',
          }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.value}
              style={{
                width: 220,
                padding: '28px 24px',
                background: 'rgba(83,58,123,0.12)',
                border: '1px solid rgba(152,193,217,0.06)',
                borderRadius: 6,
                textAlign: 'center',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = 'rgba(152,193,217,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(152,193,217,0.06)'
              }}
            >
              <div style={{
                fontSize: 28,
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.5,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
