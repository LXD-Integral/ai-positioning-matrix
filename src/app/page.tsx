'use client'

import { useState, useEffect } from 'react'
import { QUESTIONS, shuffleArray } from '@/lib/questions'
import type { Question } from '@/types'
import ColorPicker from '@/components/ColorPicker'
import QuestionSlider from '@/components/QuestionSlider'
import Image from 'next/image'

export default function Home() {
  const [userName, setUserName] = useState('')
  const [userColor, setUserColor] = useState<string>('#007bff')
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [showRadioButtons, setShowRadioButtons] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Randomize questions on component mount
    const shuffledQuestions = shuffleArray(QUESTIONS)
    setQuestions(shuffledQuestions)
    
    // Initialize all responses to 0
    const initialResponses: Record<number, number> = {}
    QUESTIONS.forEach(q => {
      initialResponses[q.id] = 0
    })
    setResponses(initialResponses)
    
    // Set loading to false after state is initialized
    setIsLoading(false)
  }, [])

  const handleResponseChange = (questionId: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!userName.trim()) {
      alert('Please enter your name or handle')
      return
    }

    // Calculate position based on responses
    let accelerationistScore = 0
    let anthropomorphicScore = 0
    
    QUESTIONS.forEach(q => {
      const value = responses[q.id]
      
      if (q.dimension === 'accelerationist') {
        if (q.direction === 'positive') {
          accelerationistScore += value
        } else {
          accelerationistScore -= value
        }
      } else if (q.dimension === 'anthropomorphic') {
        if (q.direction === 'positive') {
          anthropomorphicScore += value
        } else {
          anthropomorphicScore -= value
        }
      }
    })
    
    // Average the scores (-5 to +5) - updated for 12 questions (6 per dimension)
    const yPosition = accelerationistScore / 6
    const xPosition = anthropomorphicScore / 6
    
    // Store result data
    const result = {
      name: userName.trim(),
      color: userColor,
      position: { x: xPosition, y: yPosition },
      responses: Object.values(responses),
      timestamp: new Date().toISOString()
    }

    // Store in localStorage (client-side storage) with error handling
    try {
      // Clean up old data first to free space
      const cleanupOldData = () => {
        const keys = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('aipos_')) {
            keys.push(key)
          }
        }
        
        // Remove expired data by trying to access it (triggers cleanup in ClientStorage)
        try {
          const existingDots = JSON.parse(localStorage.getItem('aipos_user_dots') || '[]')
          const now = Date.now()
          const validDots = existingDots.filter((dot: any) => {
            const dotTime = new Date(dot.timestamp).getTime()
            const hoursOld = (now - dotTime) / (1000 * 60 * 60)
            return hoursOld < 4
          })
          
          if (validDots.length !== existingDots.length) {
            localStorage.setItem('aipos_user_dots', JSON.stringify(validDots))
          }
        } catch (e) {
          // If there's an error, clear the corrupt data
          localStorage.removeItem('aipos_user_dots')
        }
      }
      
      cleanupOldData()
      localStorage.setItem('aiPositionResult', JSON.stringify(result))
    } catch (error) {
      console.error('Failed to store result in localStorage:', error)
      // If storage fails, we can still proceed to results page with URL params
    }

    // Redirect to results page
    const params = new URLSearchParams({
      name: result.name,
      color: result.color,
      x: xPosition.toString(),
      y: yPosition.toString(),
      responses: encodeURIComponent(JSON.stringify(result.responses))
    })
    
    window.location.href = `/results?${params.toString()}`
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-4">
            AI Positioning Matrix
          </h1>
          <p className="text-[#6c757d] mb-6">
            Loading assessment...
          </p>
          <div className="animate-spin inline-block w-8 h-8 border-4 border-solid border-[#007bff] border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header>
        <div className="text-center mb-8">
          <Image
            src="/humansplusai-logo.png"
            alt="Humans + AI"
            width={300}
            height={60}
            className="mx-auto mb-4"
            style={{ marginTop: '20px' }}
          />
        </div>
        <h1>What's your AI Stance?</h1>
        <p className="subtitle">Explore your point of view on AI and its future!</p>
      </header>

      {/* User Setup */}
      <section className="setup-section" aria-labelledby="setup-heading">
        <h2 id="setup-heading" className="sr-only">Personal Information Setup</h2>
        <div className="input-group">
          <label htmlFor="userName">Enter your name or handle:</label>
          <input
            type="text"
            id="userName"
            maxLength={20}
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="setup-divider" aria-hidden="true" />
        <ColorPicker
          selectedColor={userColor}
          onColorChange={setUserColor}
        />
        <div className="setup-divider" aria-hidden="true" />
        <div className="input-group">
          <label htmlFor="inputMethodToggle">Select your preferred interface:</label>
          <button
            type="button"
            id="inputMethodToggle"
            className="toggle-button"
            aria-describedby="input-method-help"
            onClick={() => setShowRadioButtons(!showRadioButtons)}
            style={{ margin: 0 }}
          >
            Switch to {showRadioButtons ? 'Sliders' : 'Radio Buttons'}
          </button>
          <div id="input-method-help" className="sr-only">
            Toggle between slider controls and radio button controls for accessibility preferences
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="mb-6" role="status" aria-live="polite">
        <div className="w-full bg-[#dee2e6] rounded-full h-2 max-w-md mx-auto">
          <div
            className="bg-[#007bff] h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(Object.keys(responses).filter(id => responses[parseInt(id)] !== 0).length / 12) * 100}%`
            }}
            aria-label={`${Object.keys(responses).filter(id => responses[parseInt(id)] !== 0).length} of 12 questions completed`}
          />
        </div>
      </div>

      {/* Quiz Section */}
      <section className="quiz-section" aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="sr-only">Assessment Questions</h2>
        {questions.map((question, index) => (
          <QuestionSlider
            key={question.id}
            questionId={question.id}
            questionNumber={index + 1}
            questionText={question.text}
            value={responses[question.id] || 0}
            onChange={handleResponseChange}
            showRadioButtons={showRadioButtons}
          />
        ))}
        
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={!userName.trim()}
        >
          View My Position
        </button>
      </section>
    </div>
  )
}