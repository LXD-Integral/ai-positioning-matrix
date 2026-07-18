export interface Question {
  id: number
  text: string
  dimension: 'accelerationist' | 'anthropomorphic'
  direction: 'positive' | 'negative'
}

export interface UserPosition {
  name: string
  color: string
  position: { x: number; y: number }
  responses: number[]
  timestamp: string
}

export interface MatrixDot extends Omit<UserPosition, 'name' | 'responses'> {
  id: string
  ttl?: number
  name?: string
  responses?: number[]
}

// Aliases for client storage
export type UserDot = MatrixDot
export type TrendData = UserPosition