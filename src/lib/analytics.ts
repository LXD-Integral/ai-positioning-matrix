import { track } from '@vercel/analytics'

export interface AnalyticsEvent {
  event_type: string
  data?: Record<string, string | number | boolean | null>
}

export function trackEvent(event: AnalyticsEvent): void {
  try {
    track(event.event_type, event.data)
  } catch (error) {
    console.error('Analytics tracking failed:', error)
  }
}

// Common events
export const AnalyticsEvents = {
  LANDING_PAGE_VIEW: 'landing_page_view',
  ASSESSMENT_STARTED: 'assessment_started',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  RESULTS_VIEWED: 'results_viewed',
  PDF_DOWNLOADED: 'pdf_downloaded',
  EMAIL_SIGNUP: 'email_signup',
  INPUT_METHOD_CHANGED: 'input_method_changed',
  QUESTION_ANSWERED: 'question_answered',
  ASSESSMENT_ABANDONED: 'assessment_abandoned'
} as const
