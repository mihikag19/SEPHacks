import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Search, Bell,
  FileText, ShieldCheck, Activity, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import useCountUp from '../hooks/useCountUp'

/* ── Chart Data ─────────────────────────────────── */

const COMPLIANCE_TREND = [
  { day: 'Mon', compliance: 87, drift: 13 },
  { day: 'Tue', compliance: 89, drift: 11 },
  { day: 'Wed', compliance: 85, drift: 15 },
  { day: 'Thu', compliance: 91, drift: 9 },
  { day: 'Fri', compliance: 93, drift: 7 },
  { day: 'Sat', compliance: 90, drift: 10 },
  { day: 'Sun', compliance: 94, drift: 6 },
]

/* ── Severity Config ────────────────────────────── */

const SEVERITY_COLORS = {
  critical: '#EF5350',
  warning: '#FFA726',
  allowed: '#66BB6A',
}

const SEVERITY_BADGE = {
  critical: { bg: 'rgba(239, 83, 80, 0.12)', color: '#EF5350', label: 'Critical' },
  warning: { bg: 'rgba(255, 167, 38, 0.12)', color: '#FFA726', label: 'Warning' },
  allowed: { bg: 'rgba(102, 187, 106, 0.12)', color: '#66BB6A', label: 'Allowed' },
}

/* ── Chart Event Dots (shared between chart + events panel) ── */

const CHART_EVENTS = [
  {
    dayIndex: 2,
    id: 'evt-1',
    name: 'S3 Encryption Disabled',
    category: 'Storage',
    severity: 'critical',
    description: 'Encryption was turned off on prod-data-bucket',
  },
  {
    dayIndex: 4,
    id: 'evt-2',
    name: 'IAM Password Policy Changed',
    category: 'IAM',
    severity: 'warning',
    description: 'Minimum password length reduced from 16 to 8 characters',
  },
  {
    dayIndex: 6,
    id: 'evt-3',
    name: 'CloudTrail Re-enabled',
    category: 'Audit',
    severity: 'allowed',
    description: 'CloudTrail logging was re-enabled after scheduled maintenance',
  },
]

/* ── Drift Events (first 3 match chart dots by id) ── */

const DRIFT_EVENTS = [
  {
    id: 'evt-1',
    name: 'S3 Encryption Disabled',
    category: 'Storage',
    severity: 'critical',
    timeAgo: '2m ago',
    analysis: 'Encryption was disabled on a storage account containing regulated genomic data. This directly violates data-at-rest encryption requirements for HIPAA and GxP compliance.',
    gxpImpact: 'Storage account is no longer validated for regulated clinical data. FDA submission risk.',
    remediation: 'Re-enable AES-256 encryption on the S3 bucket and rotate all access keys that were used during the unencrypted window.',
  },
  {
    id: 'evt-2',
    name: 'IAM Password Policy Changed',
    category: 'IAM',
    severity: 'warning',
    timeAgo: '14m ago',
    analysis: 'Minimum password length was reduced from 16 to 8 characters, weakening account security posture below organizational baseline.',
    gxpImpact: 'Password policy no longer meets 21 CFR Part 11 requirements for access controls.',
    remediation: 'Restore minimum password length to 16 characters and enable password complexity requirements.',
  },
  {
    id: 'evt-3',
    name: 'CloudTrail Re-enabled',
    category: 'Audit',
    severity: 'allowed',
    timeAgo: '32m ago',
    analysis: 'CloudTrail logging was re-enabled after scheduled maintenance window. All audit events are now being captured.',
    gxpImpact: 'Audit trail is restored. No compliance gap during the maintenance window.',
    remediation: 'No action required. Verify log integrity for the maintenance period.',
  },
  {
    id: 'evt-4',
    name: 'VPC Flow Logs Disabled',
    category: 'Network',
    severity: 'critical',
    timeAgo: '45m ago',
    analysis: 'Flow logs were turned off for the production VPC subnet, eliminating network traffic visibility for forensic analysis.',
    gxpImpact: 'Loss of network audit trail required for GxP-regulated environments.',
    remediation: 'Re-enable VPC flow logs on all production subnets and verify log delivery to the central SIEM.',
  },
  {
    id: 'evt-5',
    name: 'RDS Public Access Enabled',
    category: 'Database',
    severity: 'critical',
    timeAgo: '1h ago',
    analysis: 'Public accessibility was enabled on a production RDS instance containing PHI data, exposing it to potential internet-based attacks.',
    gxpImpact: 'Database containing regulated data is now internet-accessible. Immediate remediation required.',
    remediation: 'Disable public access on the RDS instance and restrict security group inbound rules to VPC CIDR only.',
  },
  {
    id: 'evt-6',
    name: 'Security Group Modified',
    category: 'Network',
    severity: 'warning',
    timeAgo: '1.5h ago',
    analysis: 'Inbound rule added allowing SSH access from 0.0.0.0/0 on the production security group.',
    gxpImpact: 'Unrestricted SSH access violates network segmentation requirements.',
    remediation: 'Restrict SSH inbound rule to specific bastion host IP ranges and enable session logging.',
  },
  {
    id: 'evt-7',
    name: 'KMS Key Rotation Disabled',
    category: 'Encryption',
    severity: 'warning',
    timeAgo: '2h ago',
    analysis: 'Automatic key rotation was disabled on the primary KMS key used for encrypting regulated data at rest.',
    gxpImpact: 'Key rotation is required by encryption policies for compliance with NIST 800-53.',
    remediation: 'Re-enable automatic annual key rotation on the KMS key.',
  },
  {
    id: 'evt-8',
    name: 'Lambda Permissions Escalated',
    category: 'Compute',
    severity: 'warning',
    timeAgo: '2.5h ago',
    analysis: 'Lambda execution role was granted AdministratorAccess policy, violating the principle of least privilege.',
    gxpImpact: 'Over-privileged compute resources increase blast radius of potential compromises.',
    remediation: 'Replace AdministratorAccess with a scoped policy granting only required permissions.',
  },
  {
    id: 'evt-9',
    name: 'Config Rule Deleted',
    category: 'Compliance',
    severity: 'critical',
    timeAgo: '3h ago',
    analysis: 'AWS Config rule for monitoring encryption compliance was deleted, removing automated compliance checking.',
    gxpImpact: 'Automated compliance monitoring gap. Manual review required until restored.',
    remediation: 'Recreate the Config rule from the infrastructure-as-code template and verify evaluation results.',
  },
  {
    id: 'evt-10',
    name: 'SNS Topic Policy Changed',
    category: 'Messaging',
    severity: 'allowed',
    timeAgo: '4h ago',
    analysis: 'SNS topic policy was updated to allow cross-account publishing from the approved monitoring account.',
    gxpImpact: 'Change is within approved parameters. No compliance impact.',
    remediation: 'No action required. Change was pre-approved via change management process.',
  },
]

/* ── Stat Cards Data ────────────────────────────── */

const STATS = [
  { label: 'Total Policies', value: 173, change: '+12 from last week', icon: FileText, valueColor: '#FFFFFF', changeColor: 'var(--status-success)' },
  { label: 'Compliant', value: 142, change: '+5 from last week', icon: ShieldCheck, valueColor: '#98C1D9', changeColor: 'var(--status-success)' },
  { label: 'Drifted', value: 23, change: '-3 from last week', icon: Activity, valueColor: '#6969B3', changeColor: 'var(--text-muted)' },
  { label: 'Non-Compliant', value: 8, change: '+2 from last week', icon: AlertTriangle, valueColor: '#FFFFFF', changeColor: 'var(--status-critical)' },
]

/* ── Stat Card ──────────────────────────────────── */

function StatCard({ stat, index }) {
  const display = useCountUp(stat.value, 800)
  const Icon = stat.icon
  return (
    <div
      className={`glass-panel-static fade-in fade-in-${index + 1}`}
      style={{
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'border-color var(--transition-smooth), transform var(--transition-smooth), box-shadow var(--transition-smooth)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-default)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        background: 'rgba(152, 193, 217, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} strokeWidth={1.5} style={{ color: stat.valueColor }} />
      </div>
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 4,
        }}>
          {stat.label}
        </div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: stat.valueColor,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {display}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 400,
          marginTop: 4,
          color: stat.changeColor,
        }}>
          {stat.change}
        </div>
      </div>
    </div>
  )
}

/* ── Chart Tooltip (for line hover) ──────────────── */

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: 'rgba(37, 23, 26, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(152, 193, 217, 0.12)',
      borderRadius: 4,
      padding: '10px 14px',
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
          {p.name}: {p.value}{suffix}
        </div>
      ))}
    </div>
  )
}

/* ── Event Dot Tooltip (rich, with arrow) ────────── */

function EventDotTooltip({ evt, x, y, onViewDetails }) {
  const showAbove = y > 80
  const tooltipTop = showAbove ? y - 12 : y + 16
  const transform = showAbove
    ? 'translate(-50%, -100%)'
    : 'translate(-50%, 0)'
  const severityLabel = evt.severity.charAt(0).toUpperCase() + evt.severity.slice(1)

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: tooltipTop,
      transform,
      background: '#25171A',
      border: '1px solid rgba(152, 193, 217, 0.15)',
      borderRadius: 4,
      padding: '14px 18px',
      maxWidth: 280,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      animation: 'tooltipFadeIn 0.15s ease',
    }}>
      {/* Arrow */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        ...(showAbove ? {
          bottom: -6,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #25171A',
        } : {
          top: -6,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '6px solid #25171A',
        }),
      }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{evt.name}</div>
      <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginTop: 3 }}>
        {evt.category} &middot; {severityLabel}
      </div>
      <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)', marginTop: 6, whiteSpace: 'normal' }}>
        {evt.description}
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); onViewDetails(evt); }}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#98C1D9',
          marginTop: 10,
          cursor: 'pointer',
        }}
      >
        View Details &rarr;
      </div>
    </div>
  )
}

/* ── Compliance Trend Chart ───────────────────── */

function ComplianceTrendChart({ onViewEvent }) {
  const [range, setRange] = useState('weekly')
  const [hoveredDot, setHoveredDot] = useState(null)
  const ranges = ['Weekly', 'Monthly', 'Yearly']

  function EventDots(props) {
    const { cx, cy, index } = props
    const evt = CHART_EVENTS.find(e => e.dayIndex === index)
    if (!evt) return null
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill={SEVERITY_COLORS[evt.severity]}
        style={{
          animation: 'eventDotPulse 3s ease-in-out infinite',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHoveredDot({ evt, x: cx, y: cy })}
        onMouseLeave={() => setHoveredDot(null)}
      />
    )
  }

  return (
    <div className="glass-panel-static fade-in" style={{
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      animationDelay: '440ms',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>Compliance Trend</div>
          <div style={{ fontSize: 12, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4 }}>7-day policy compliance rate</div>
        </div>
        <div style={{
          display: 'flex',
          border: '1px solid var(--border-default)',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r.toLowerCase())}
              style={{
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                fontFamily: 'inherit',
                ...(range === r.toLowerCase()
                  ? { background: 'var(--accent-secondary)', color: '#FFFFFF' }
                  : { background: 'transparent', color: 'var(--text-muted)' }),
              }}
              onMouseEnter={e => {
                if (range !== r.toLowerCase()) e.currentTarget.style.color = 'var(--text-secondary)'
              }}
              onMouseLeave={e => {
                if (range !== r.toLowerCase()) e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={COMPLIANCE_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#98C1D9" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#98C1D9" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="driftFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6969B3" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#6969B3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.4)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.4)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTooltip suffix="%" />} />
            <Area
              type="monotone"
              dataKey="compliance"
              name="Compliance"
              stroke="#98C1D9"
              strokeWidth={2}
              fill="url(#trendGrad)"
              dot={<EventDots />}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="drift"
              name="Drift"
              stroke="#6969B3"
              strokeWidth={1.5}
              fill="url(#driftFill)"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        {hoveredDot && (
          <EventDotTooltip
            evt={hoveredDot.evt}
            x={hoveredDot.x}
            y={hoveredDot.y}
            onViewDetails={(evt) => {
              setHoveredDot(null)
              onViewEvent(evt.id)
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ── Detail Section Label ────────────────────────── */

const sectionLabelStyle = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 4,
}

/* ── Active Drift Events Panel ────────────────── */

function ActiveDriftEvents({ focusedEventId, onFocusHandled }) {
  const [expandedId, setExpandedId] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const scrollContainerRef = useRef(null)
  const eventRefsMap = useRef({})
  const highlightTimerRef = useRef(null)

  useEffect(() => {
    if (!focusedEventId) return

    const matched = DRIFT_EVENTS.find(e => e.id === focusedEventId)
    if (!matched) { onFocusHandled(); return }

    setExpandedId(matched.id)
    setHighlightId(matched.id)

    requestAnimationFrame(() => {
      const el = eventRefsMap.current[matched.id]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })

    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    highlightTimerRef.current = setTimeout(() => {
      setHighlightId(null)
      onFocusHandled()
    }, 2300)

    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    }
  }, [focusedEventId, onFocusHandled])

  return (
    <div className="glass-panel-static fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      animationDelay: '540ms',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>Active Drift Events</div>
          <div style={{ fontSize: 12, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4 }}>Latest configuration changes</div>
        </div>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--accent-primary)',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: 2,
        }}>
          View All
        </div>
      </div>

      {/* Event list body */}
      <div
        ref={scrollContainerRef}
        className="events-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '0 24px 20px',
        }}
      >
        {DRIFT_EVENTS.map((evt) => {
          const isOpen = expandedId === evt.id
          const isHighlighted = highlightId === evt.id
          const badge = SEVERITY_BADGE[evt.severity]

          return (
            <div
              key={evt.id}
              ref={el => { eventRefsMap.current[evt.id] = el }}
              data-event-id={evt.id}
              style={{
                borderLeft: '2px solid transparent',
                ...(isHighlighted ? {
                  animation: 'eventRowHighlight 2.3s ease forwards',
                } : {}),
              }}
            >
              {/* Summary row */}
              <div
                onClick={() => setExpandedId(isOpen ? null : evt.id)}
                style={{
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(152, 193, 217, 0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Status dot */}
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: SEVERITY_COLORS[evt.severity],
                  flexShrink: 0,
                  marginRight: 12,
                }} />

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 550, color: '#FFFFFF' }}>
                    {evt.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {evt.category} &middot; {evt.timeAgo}
                  </div>
                </div>

                {/* Severity badge */}
                <div style={{
                  padding: '3px 10px',
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: badge.bg,
                  color: badge.color,
                  flexShrink: 0,
                  marginLeft: 12,
                }}>
                  {badge.label}
                </div>
              </div>

              {/* Expandable detail */}
              <div className={`expand-panel${isOpen ? ' open' : ''}`}>
                <div>
                  <div style={{
                    background: 'rgba(83, 58, 123, 0.3)',
                    borderRadius: 4,
                    padding: '14px 16px',
                    marginTop: 8,
                    marginBottom: 8,
                  }}>
                    {/* AI Analysis */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={sectionLabelStyle}>AI Analysis</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {evt.analysis}
                      </div>
                    </div>

                    {/* GxP Impact */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={sectionLabelStyle}>GxP Impact</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {evt.gxpImpact}
                      </div>
                    </div>

                    {/* Remediation */}
                    <div>
                      <div style={sectionLabelStyle}>Remediation</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {evt.remediation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Dashboard Page ─────────────────────────────── */

export default function Dashboard() {
  const [focusedEventId, setFocusedEventId] = useState(null)

  const handleFocusHandled = useCallback(() => {
    setFocusedEventId(null)
  }, [])

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{
        marginLeft: 240,
        padding: '28px 36px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Row 1: Header (~60px) */}
        <div className="fade-in fade-in-0" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Infrastructure compliance monitoring
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: 220,
                  height: 36,
                  background: 'rgba(83, 58, 123, 0.4)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 4,
                  padding: '0 12px 0 36px',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 400,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'var(--transition-smooth)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
              />
            </div>
            <div
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.querySelector('svg').style.color = 'var(--accent-primary)'}
              onMouseLeave={e => e.currentTarget.querySelector('svg').style.color = 'var(--text-muted)'}
            >
              <Bell size={16} style={{ color: 'var(--text-muted)', transition: 'var(--transition-smooth)' }} />
            </div>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6969B3, #533A7B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#FFFFFF',
            }}>
              VA
            </div>
          </div>
        </div>

        {/* Row 2: Stat Cards (~100px) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 16,
          flexShrink: 0,
        }}>
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </div>

        {/* Row 3: Two-column main area (flex: 1) */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '60fr 40fr',
          gap: 16,
          minHeight: 0,
        }}>
          {/* Left: Compliance Trend Chart */}
          <ComplianceTrendChart onViewEvent={setFocusedEventId} />

          {/* Right: Active Drift Events */}
          <ActiveDriftEvents
            focusedEventId={focusedEventId}
            onFocusHandled={handleFocusHandled}
          />
        </div>
      </div>
    </div>
  )
}
