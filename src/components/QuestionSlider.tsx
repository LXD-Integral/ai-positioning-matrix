'use client'

import { useState } from 'react'

interface QuestionSliderProps {
  questionId: number
  questionNumber: number
  questionText: string
  value: number
  onChange: (questionId: number, value: number) => void
  showRadioButtons?: boolean
}

export default function QuestionSlider({ 
  questionId, 
  questionNumber, 
  questionText, 
  value, 
  onChange,
  showRadioButtons = false 
}: QuestionSliderProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (newValue: number) => {
    setLocalValue(newValue)
    onChange(questionId, newValue)
  }

  return (
    <div className="question" role="group" aria-labelledby={`question-title-${questionId}`}>
      <div className="question-number" id={`question-title-${questionId}`}>
        Question {questionNumber} of 12
      </div>
      <div className="question-text" id={`question-text-${questionId}`}>
        {questionText}
      </div>
      
      {showRadioButtons ? (
        <div className="radio-container">
          <div className="radio-labels">
            <span className="radio-label">Strongly Disagree</span>
            <span className="radio-label">Strongly Agree</span>
          </div>
          <div className="radio-buttons" role="radiogroup" aria-label={`Question ${questionNumber} rating scale`}>
            {Array.from({ length: 11 }, (_, i) => i - 5).map((val) => (
              <label key={val} className="radio-option">
                <input
                  type="radio"
                  name={`question-${questionId}`}
                  value={val}
                  checked={localValue === val}
                  onChange={() => handleChange(val)}
                  className="sr-only"
                  aria-label={`${val === 0 ? 'Neutral' : val > 0 ? `Agree ${val}` : `Disagree ${Math.abs(val)}`}`}
                />
                <div className={`radio-button ${localValue === val ? 'selected' : ''}`}>
                  {val === 0 ? '0' : val > 0 ? `+${val}` : val}
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="slider-container">
          <div className="slider-labels">
            <span className="slider-label">Strongly Disagree</span>
            <span className="slider-label">Strongly Agree</span>
          </div>
          <input
            type="range"
            className="slider"
            min="-5"
            max="5"
            value={localValue}
            step="1"
            onChange={(e) => handleChange(parseInt(e.target.value))}
            aria-label={`Question ${questionNumber}: Rate your agreement from -5 (strongly disagree) to 5 (strongly agree). Current value: ${localValue}`}
            aria-describedby={`question-text-${questionId}`}
          />
          <div className="tick-marks">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className={`tick ${i === 5 ? 'zero' : ''}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}