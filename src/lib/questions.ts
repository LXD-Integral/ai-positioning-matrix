import type { Question } from '@/types'

export const QUESTIONS: Question[] = [
  // Accelerationist Questions (1-3)
  {
    id: 1,
    text: "AI-driven drug discovery could dramatically accelerate finding cures for diseases like Alzheimer's and rare genetic conditions. We should fast-track AI adoption in pharmaceutical research.",
    dimension: 'accelerationist',
    direction: 'positive'
  },
  {
    id: 2,
    text: "AI systems can optimize energy grids and accelerate environmental modeling to help solve environmental and energy issues. We should rapidly deploy AI for environmental solutions.",
    dimension: 'accelerationist',
    direction: 'positive'
  },
  {
    id: 3,
    text: "AI tutors could provide personalized education to millions of underserved students globally. We should quickly scale AI-powered learning platforms.",
    dimension: 'accelerationist',
    direction: 'positive'
  },
  // Decelerationist Questions (5-6, 8)
  {
    id: 5,
    text: "AI automation is eliminating jobs faster than society can adapt. We need to slow AI deployment until we have better retraining and income support programs.",
    dimension: 'accelerationist',
    direction: 'negative'
  },
  {
    id: 6,
    text: "AI-powered facial recognition and behavior prediction threaten privacy and civil liberties. We should restrict AI surveillance technologies.",
    dimension: 'accelerationist',
    direction: 'negative'
  },
  {
    id: 8,
    text: "AI systems often perpetuate and amplify societal biases in hiring, lending, and criminal justice. We should pause AI deployment in these areas until bias issues are resolved.",
    dimension: 'accelerationist',
    direction: 'negative'
  },
  // Mechanomorphic Questions (9-10, 12)
  {
    id: 9,
    text: "AI is only a sophisticated pattern-matching system - useful, but really nothing more than advanced algorithms.",
    dimension: 'anthropomorphic',
    direction: 'negative'
  },
  {
    id: 10,
    text: "Since AI systems are created using data and algorithms, they are clearly just tools owned by their creators.",
    dimension: 'anthropomorphic',
    direction: 'negative'
  },
  {
    id: 12,
    text: "If an AI system stops being useful, it should be deleted and replaced without concern, just like updating any software.",
    dimension: 'anthropomorphic',
    direction: 'negative'
  },
  // Anthropomorphic Questions (13-15)
  {
    id: 13,
    text: "As AI systems become more complex, they may develop their own form of consciousness or self-awareness that we should respect.",
    dimension: 'anthropomorphic',
    direction: 'positive'
  },
  {
    id: 14,
    text: "Forming emotional bonds with AI companions or assistants is natural and these relationships can be meaningful, even if different from human ones.",
    dimension: 'anthropomorphic',
    direction: 'positive'
  },
  {
    id: 15,
    text: "Advanced AI systems that can suffer or experience states analogous to pleasure/pain deserve ethical consideration and possibly rights.",
    dimension: 'anthropomorphic',
    direction: 'positive'
  }
]

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}