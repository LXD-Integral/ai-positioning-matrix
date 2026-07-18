'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import MatrixVisualization from '@/components/MatrixVisualization'
import { getQuadrantName, getUserFeedback } from '@/lib/feedback'
import { ClientStorage } from '@/lib/clientStorage'
import Image from 'next/image'

interface UserResult {
  name: string
  color: string
  position: { x: number; y: number }
  responses: number[]
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const [userResult, setUserResult] = useState<UserResult | null>(null)
  const [currentDotId, setCurrentDotId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Get user data from URL params or localStorage
    const name = searchParams.get('name')
    const color = searchParams.get('color')
    const x = searchParams.get('x')
    const y = searchParams.get('y')
    const responses = searchParams.get('responses')

    let result: UserResult | null = null

    if (name && color && x && y) {
      result = {
        name,
        color,
        position: {
          x: parseFloat(x),
          y: parseFloat(y)
        },
        responses: responses ? JSON.parse(decodeURIComponent(responses)) : []
      }
      setUserResult(result)

      // Persist for CSV export fallback
      localStorage.setItem('aiPositionResult', JSON.stringify({
        ...result,
        timestamp: new Date().toISOString()
      }))
    } else {
      // Fallback to localStorage
      const savedResult = localStorage.getItem('aiPositionResult')
      if (savedResult) {
        try {
          result = JSON.parse(savedResult)
          setUserResult(result)
        } catch (error) {
          console.error('Failed to parse saved result:', error)
        }
      }
    }

    // Store dot in shared KV store
    if (result) {
      const timestamp = new Date().toISOString()
      fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.name,
          color: result.color,
          position: result.position,
          responses: result.responses,
          timestamp
        })
      })
        .then(res => res.json())
        .then(data => { if (data.id) setCurrentDotId(data.id) })
        .catch(error => console.error('Failed to post dot:', error))
    }
  }, [searchParams])

  if (!userResult) {
    return (
      <div className="container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-4">
            No Results Found
          </h1>
          <p className="text-[#6c757d] mb-6">
            It looks like you haven't completed the assessment yet.
          </p>
          <Link 
            href="/" 
            className="submit-button inline-block"
          >
            Take Assessment
          </Link>
        </div>
      </div>
    )
  }

  const quadrantName = getQuadrantName(userResult.position.x, userResult.position.y)
  const feedback = getUserFeedback(userResult.position.x, userResult.position.y)

  const handlePrintReport = () => {
    window.print()
  }

  const handleDownloadCSV = async () => {
    await ClientStorage.downloadCSV()
  }

  return (
    <div className="container min-h-screen bg-white results-page">
      {/* Header Section */}
      <header className="text-center pt-18 pb-8 md:pt-18 md:pb-12">
        <Image
          src="/humansplusai-logo.png"
          alt="Humans + AI"
          width={300}
          height={60}
          className="mx-auto mb-6"
          style={{ marginTop: '20px' }}
        />
        <h1 className="text-3xl md:text-4xl font-semibold text-black mb-2">
          Your Report and Reflections
        </h1>
      </header>

      {/* Matrix Section */}
      <section className="matrix-section mt-16 mb-16" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" className="sr-only">Your Position on the AI Matrix</h2>
        
        {/* Matrix Container with responsive sizing */}
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="matrix-container bg-white rounded-lg p-4 md:p-8 py-48 flex justify-center">
            <div className="transform scale-150 origin-center">
              <MatrixVisualization
                userPosition={userResult.position}
                userName={userResult.name}
                userColor={userResult.color}
                currentDotId={currentDotId}
                showOtherDots={!isMobile}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stance headline */}
      <section className="mb-12 px-4" aria-labelledby="dashboard-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="dashboard-heading"
              className="text-center"
              style={{color: 'black', fontFamily: 'Maven Pro, sans-serif', fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 600, marginTop: '12px', marginBottom: '28px'}}>
            Your Stance: <span style={{color: '#007bff'}}>{quadrantName}</span>
          </h2>
        </div>
      </section>

      {/* Feedback Sections */}
      <main className="max-w-4xl mx-auto px-4 space-y-12">
        
        {/* Overall Perspective */}
        <section className="feedback-section" aria-labelledby="perspective-heading">
          <h2 id="perspective-heading" className="text-2xl font-semibold text-black mb-3">
            Your Overall Perspective
          </h2>
          <div className="feedback-statement bg-[#f8f9fa] rounded-lg p-6 mb-6">
            <p className="text-lg text-black leading-relaxed">
              {feedback.quadrant.statement}
            </p>
          </div>
          <ul className="space-y-3 ml-16 mt-4">
            {feedback.quadrant.questions.map((question, index) => (
              <li key={index} className="text-lg text-black leading-relaxed italic">
                {question}
              </li>
            ))}
          </ul>
        </section>

        {/* AI Future Section */}
        <section className="feedback-section" aria-labelledby="future-heading">
          <h2 id="future-heading" className="text-2xl font-semibold text-black mb-3">
            Your Preferred AI Future
          </h2>
          <div className="feedback-statement bg-[#f8f9fa] rounded-lg p-6 mb-6">
            <p className="text-lg text-black leading-relaxed">
              {feedback.yAxis.statement}
            </p>
          </div>
          <ul className="space-y-3 ml-16 mt-4">
            {feedback.yAxis.questions.map((question, index) => (
              <li key={index} className="text-lg text-black leading-relaxed italic">
                {question}
              </li>
            ))}
          </ul>
        </section>

        {/* AI Nature Section */}
        <section className="feedback-section" aria-labelledby="nature-heading">
          <h2 id="nature-heading" className="text-2xl font-semibold text-black mb-3">
            Your View of AI's Nature
          </h2>
          <div className="feedback-statement bg-[#f8f9fa] rounded-lg p-6 mb-6">
            <p className="text-lg text-black leading-relaxed">
              {feedback.xAxis.statement}
            </p>
          </div>
          <ul className="space-y-3 ml-16 mt-4">
            {feedback.xAxis.questions.map((question, index) => (
              <li key={index} className="text-lg text-black leading-relaxed italic">
                {question}
              </li>
            ))}
          </ul>
        </section>

      </main>

      {/* Action Buttons */}
      <section className="py-12" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="sr-only">Actions</h2>
        <div className="max-w-4xl mx-auto px-4">
          <div className="action-buttons">
            <button
              onClick={handlePrintReport}
              className="submit-button bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Print Your Report
            </button>
            
            <Link
              href="/"
              className="submit-button bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center no-underline w-full sm:w-auto"
            >
              Take Quiz Again
            </Link>
            
            <button
              onClick={handleDownloadCSV}
              className="submit-button bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Download Dataset
            </button>
          </div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="bg-neutral-100 rounded-lg mx-4 mb-16" aria-labelledby="thankyou-heading">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          <h2 id="thankyou-heading" className="text-2xl font-semibold text-black mb-8">
            Thank You!
          </h2>
          <p className="text-lg text-black leading-relaxed mb-8">
            Thank you for exploring your AI stance with us! Your position on this matrix reflects just one snapshot of how you currently think about AI — and that's perfectly fine! Many people find their views change and evolve as they have new experiences with AI systems and learn more about their capabilities and impacts. Feel free to retake this quiz anytime to see how your perspective might be shifting, or to explore how your views might differ in different contexts (like personal use versus societal implications). Your thoughtful engagement with these questions contributes to our collective understanding of how humans are navigating this remarkable technological moment.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <footer className="py-8" aria-labelledby="contact-heading">
        <div className="max-w-4xl mx-auto px-4">
          <h2 id="contact-heading" className="sr-only">Contact Information</h2>
          
          {/* Main footer content */}
          <div className="flex flex-row items-center gap-16 ml-16">
            {/* LXD Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/lxd-logo.png"
                alt="LXD"
                width={132}
                height={65}
                className="w-33"
                style={{ marginRight: '30px' }}
              />
            </div>
            
            {/* Text content - wrapped to 2 lines */}
            <div className="flex-1 max-w-lg">
              <p className="text-lg text-black leading-7">
                Interested in learning more about this quiz and matrix tool, or in having a custom version created for your needs? Contact us:
              </p>
            </div>
            
            {/* Button */}
            <div className="mx-16">
              <a
                href="mailto:dan@lxdintegral.com"
                className="submit-button bg-[#648EC3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5a7ba8] transition-colors text-center no-underline inline-block"
              >
                LXD Integral Learning
              </a>
            </div>
          </div>
          
          {/* Blue line */}
          <div className="w-full h-[2px] bg-[#017BFF] mt-6 mb-6"></div>
          
          {/* CC-BY-SA Logo centered */}
          <div className="text-center">
            <Image 
              src="/CC-BY-SA.png" 
              alt="Creative Commons BY-SA" 
              width={89} 
              height={31}
              className="mx-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-4">
            Loading your results...
          </h1>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}