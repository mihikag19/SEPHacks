import React, { useState, useRef, useEffect } from 'react'
import HeroSection from './landing/HeroSection'
import ProblemSection from './landing/ProblemSection'
import FeaturesSection from './landing/FeaturesSection'
import TransitionDivider from './landing/TransitionDivider'
import Dashboard from '../pages/Dashboard'

export default function LandingExperience() {
  const containerRef = useRef(null)
  const problemRef = useRef(null)
  const featuresRef = useRef(null)
  const dashboardRef = useRef(null)

  const [problemVisible, setProblemVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)
  const [dashboardInView, setDashboardInView] = useState(false)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const observers = []

    // Problem section — one-shot at 30% visibility
    if (problemRef.current) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setProblemVisible(true)
            obs.disconnect()
          }
        },
        { root, threshold: 0.3 }
      )
      obs.observe(problemRef.current)
      observers.push(obs)
    }

    // Features section — one-shot at 30% visibility
    if (featuresRef.current) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setFeaturesVisible(true)
            obs.disconnect()
          }
        },
        { root, threshold: 0.3 }
      )
      obs.observe(featuresRef.current)
      observers.push(obs)
    }

    // Dashboard — continuous toggle at 1% visibility
    if (dashboardRef.current) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          setDashboardInView(entry.isIntersecting)
        },
        { root, threshold: 0.01 }
      )
      obs.observe(dashboardRef.current)
      observers.push(obs)
    }

    return () => observers.forEach(obs => obs.disconnect())
  }, [])

  const containerClass = [
    'landing-container',
    dashboardInView && 'snap-disabled',
    dashboardInView && 'dashboard-in-view',
  ].filter(Boolean).join(' ')

  return (
    <div ref={containerRef} className={containerClass}>
      <HeroSection />

      <div ref={problemRef}>
        <ProblemSection visible={problemVisible} />
      </div>

      <div ref={featuresRef}>
        <FeaturesSection visible={featuresVisible} />
      </div>

      <TransitionDivider />

      <div ref={dashboardRef} id="dashboard-section">
        <Dashboard />
      </div>
    </div>
  )
}
