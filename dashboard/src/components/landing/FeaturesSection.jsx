import React from 'react'
import { Activity, Shield, GitPullRequest } from 'lucide-react'

const FEATURES = [
  {
    icon: Activity,
    title: 'continuous monitoring',
    description: 'Track every configuration change across your validated infrastructure in real time.',
    hoverBorder: 'rgba(152,193,217,0.25)',
  },
  {
    icon: Shield,
    title: 'ai classification',
    description: 'Automatically assess drift severity and GxP impact using trained compliance models.',
    hoverBorder: 'rgba(105,105,179,0.35)',
  },
  {
    icon: GitPullRequest,
    title: 'auto-remediation',
    description: 'Generate and submit remediation pull requests the moment critical drift is detected.',
    hoverBorder: 'rgba(102,187,106,0.3)',
  },
]

export default function FeaturesSection({ visible }) {
  return (
    <section
      className={`landing-section${visible ? ' in-view' : ''}`}
      style={{
        background: '#0A0610',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 1000, padding: '0 24px', textAlign: 'center' }}>
        <div
          className="landing-animate"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(152,193,217,0.6)',
            marginBottom: 20,
          }}
        >
          WHAT LATCH DOES
        </div>

        <h2
          className="landing-animate landing-heading"
          style={{
            fontSize: 40,
            fontWeight: 300,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: '0 0 16px 0',
            textTransform: 'lowercase',
          }}
        >
          built for biotech compliance.
        </h2>

        <p
          className="landing-animate"
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            maxWidth: 560,
            lineHeight: 1.7,
            margin: '0 auto 48px',
          }}
        >
          Three layers of protection that work together to keep your
          infrastructure in its validated state — continuously.
        </p>

        <div
          className="landing-animate landing-cards-row"
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
          }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                style={{
                  flex: 1,
                  padding: '32px 28px',
                  background: 'rgba(83,58,123,0.1)',
                  border: '1px solid rgba(152,193,217,0.06)',
                  borderRadius: 6,
                  textAlign: 'left',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.borderColor = feature.hoverBorder
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(152,193,217,0.06)'
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'rgba(152,193,217,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={20} strokeWidth={1.5} style={{ color: 'rgba(152,193,217,0.7)' }} />
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#FFFFFF',
                  marginBottom: 10,
                  textTransform: 'lowercase',
                }}>
                  {feature.title}
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.6,
                }}>
                  {feature.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
