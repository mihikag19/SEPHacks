import React, { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function GoLiveButton() {
  const { offline, connectionState, goLive } = useApp()
  const [slowConnect, setSlowConnect] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  // Show "Waking up server..." after 5s of connecting
  useEffect(() => {
    if (connectionState !== 'connecting') {
      setSlowConnect(false)
      return
    }
    const timer = setTimeout(() => setSlowConnect(true), 5000)
    return () => clearTimeout(timer)
  }, [connectionState])

  // Fade out the "Live" indicator after 3s
  useEffect(() => {
    if (connectionState !== 'connected') {
      setFadeOut(false)
      return
    }
    const timer = setTimeout(() => setFadeOut(true), 3000)
    return () => clearTimeout(timer)
  }, [connectionState])

  // Connected state: green dot + "Live", fades out
  if (connectionState === 'connected') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
        fontSize: 12,
        fontWeight: 600,
        color: '#66BB6A',
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#66BB6A',
          boxShadow: '0 0 6px #66BB6A',
        }} />
        Live
      </span>
    )
  }

  // Connecting state: spinner + message
  if (connectionState === 'connecting') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--text-muted)',
      }}>
        <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
        {slowConnect ? 'Waking up server...' : 'Connecting...'}
      </span>
    )
  }

  // Disconnected state: show button only when offline
  if (!offline) return null

  return (
    <button
      onClick={goLive}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
        padding: '3px 12px',
        borderRadius: 4,
        border: '1px solid rgba(102, 187, 106, 0.3)',
        background: 'rgba(102, 187, 106, 0.08)',
        color: '#66BB6A',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        animation: 'goLivePulse 2s ease-in-out infinite',
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(102, 187, 106, 0.15)'
        e.currentTarget.style.borderColor = 'rgba(102, 187, 106, 0.5)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(102, 187, 106, 0.08)'
        e.currentTarget.style.borderColor = 'rgba(102, 187, 106, 0.3)'
      }}
    >
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#66BB6A',
      }} />
      Go Live
    </button>
  )
}
