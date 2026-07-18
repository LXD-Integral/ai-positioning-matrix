// Feedback content system based on user position

export interface FeedbackContent {
  statement: string
  questions: string[]
}

export interface UserFeedback {
  quadrant: FeedbackContent
  yAxis: FeedbackContent  
  xAxis: FeedbackContent
}

// Distance calculation for axis feedback
function getAxisDistance(score: number): 'close' | 'moderate' | 'far' {
  const abs = Math.abs(score)
  if (abs <= 1) return 'close'
  if (abs <= 3) return 'moderate'
  return 'far'
}

// Classify a single axis into a display label.
// close  → 'Balanced'  (neutral on this axis)
// moderate → 'Tending <pole>'        (measured lean, 1 < |score| ≤ 3)
// far      → 'Predominantly <pole>'  (firm conviction, |score| > 3)
// Drives the two side dashboard cells and the axis-aligned "Your Stance" labels,
// so the stance cell and the side cells can never contradict each other.
export function getAxisLabel(score: number, positiveLabel: string, negativeLabel: string): string {
  const distance = getAxisDistance(score)
  if (distance === 'close') return 'Balanced'
  const prefix = distance === 'far' ? 'Predominantly' : 'Tending'
  return `${prefix} ${score > 0 ? positiveLabel : negativeLabel}`
}

// Get quadrant-specific feedback
export function getQuadrantFeedback(x: number, y: number): FeedbackContent {
  const xDistance = getAxisDistance(x)
  const yDistance = getAxisDistance(y)

  // Centre: both axes within the neutral band ("Balanced or Deferred Judgement")
  if (xDistance === 'close' && yDistance === 'close') {
    return {
      statement: "Your position sits near the centre of both axes—you've committed to a strong view neither on the pace of AI development nor on whether AI systems are tools or something with inner experience. This can reflect two things at once: a genuinely balanced reading that weighs opportunity against risk and tool against entity, or a deliberate reservation of judgement until the questions resolve further. Either way, you're holding the questions open rather than settling them prematurely.",
      questions: [
        "When you consider AI, do you feel genuinely balanced between competing views, or are you actively reserving judgement until you know more?",
        "Which of the two questions—how fast AI should develop, or what AI fundamentally is—feels closer to resolving for you, and why?",
        "What kind of evidence or experience would move you off the centre on either axis?"
      ]
    }
  }

  // Pace-dominant: nature axis neutral, pace axis non-neutral.
  // moderate → Tending, far → Predominantly.
  if (xDistance === 'close' && yDistance !== 'close') {
    if (y > 0) {
      if (yDistance === 'moderate') {
        // Tending Accelerationist
        return {
          statement: "You lean toward wanting AI development to move faster, sensing that the opportunities outweigh the risks—though it's a measured lean rather than a firm conviction. On the separate question of whether AI is a sophisticated tool or something with inner experience, you remain open. Notably, you've kept these two questions apart: your view on pace doesn't depend on first settling what AI fundamentally is.",
          questions: [
            "What draws you toward a faster pace—specific opportunities, or a general sense that caution costs more than it saves?",
            "Since your lean is measured rather than firm, what would tip you further toward acceleration—or pull you back toward caution?",
            "Does leaving the question of AI's nature open make you more or less comfortable with moving quickly?"
          ]
        }
      }
      // Predominantly Accelerationist
      return {
        statement: "Your clearest conviction is about pace: AI development should move quickly, and you likely believe hesitation risks forfeiting significant benefits. Yet on whether AI systems are tools or something with inner experience, you hold a genuinely open view. This is an unusual and intellectually honest combination—you've formed a strong stance on urgency while deliberately leaving the nature question unresolved, rather than letting one answer dictate the other.",
        questions: [
          "What primarily drives your conviction that speed matters—the problems AI can solve, the opportunities at stake, or something else?",
          "Does your open view on AI consciousness change how you weigh the risks of rapid development?",
          "What might move you from \"open\" to a definite view on whether AI has something like inner experience?"
        ]
      }
    } else {
      if (yDistance === 'moderate') {
        // Tending Decelerationist
        return {
          statement: "You lean toward wanting AI development to slow down, sensing risks that deserve more attention than they're getting—though it's a measured concern rather than a call to halt. On whether AI is a sophisticated tool or something approaching consciousness, you remain open. Your caution centres on pace and consequence—disruption, oversight, readiness—rather than on questions of AI sentience.",
          questions: [
            "What specific risks or disruptions make you want to slow the pace, even if only somewhat?",
            "Since your concern is measured rather than absolute, what conditions would make you comfortable with faster progress?",
            "Does leaving the question of AI's nature open shape how you think about those risks?"
          ]
        }
      }
      // Predominantly Decelerationist
      return {
        statement: "Your clearest conviction is that AI development needs to slow down—you likely see serious risks that current speeds aren't adequately addressing. Yet on whether AI systems are sophisticated tools or something approaching consciousness, you hold a genuinely open view. Your concern is rooted in pace and consequence—disruption, oversight, societal readiness—not in questions of AI sentience. The urgency question troubles you deeply; the nature question remains, for you, unresolved.",
        questions: [
          "What do you see as the most serious consequences of continuing at the current pace?",
          "Does your open view on AI consciousness affect how you weigh those risks?",
          "What fundamental changes would need to happen for you to support a faster pace?"
        ]
      }
    }
  }

  // Nature-dominant: pace axis neutral, nature axis non-neutral.
  // moderate → Tending, far → Predominantly.
  if (yDistance === 'close' && xDistance !== 'close') {
    if (x > 0) {
      if (xDistance === 'moderate') {
        // Tending Anthropomorphic
        return {
          statement: "You lean toward seeing AI as potentially more than a tool—something that may have consciousness-like qualities or deserve consideration beyond pure utility—though you hold this with some uncertainty. On whether development should speed up or slow down, you haven't settled on a strong view. For you, what AI is matters more than how fast it arrives—and your answer on pace may depend on how the nature question resolves.",
          questions: [
            "What observations have led you to consider that AI might be more than just technology?",
            "Since you hold this view with some uncertainty, what would strengthen or weaken it?",
            "Does your view on pace feel genuinely open, or is it waiting on how the nature question unfolds?"
          ]
        }
      }
      // Predominantly Anthropomorphic
      return {
        statement: "Your thinking centres firmly on the nature of AI—you see these systems as potentially having consciousness-like properties or deserving ethical consideration well beyond being a tool. Yet you haven't formed a strong view on whether development should speed up or slow down. The nature question is central to you; the pace question remains genuinely unresolved—perhaps because your answer depends on what AI turns out to be.",
        questions: [
          "What has shaped your conviction that AI may have consciousness-like properties or deserve moral consideration?",
          "Does your unresolved view on pace reflect a genuine wait-and-see, or unresolved tension beneath it?",
          "How might a clearer answer about AI's nature change how fast you think development should proceed?"
        ]
      }
    } else {
      if (xDistance === 'moderate') {
        // Tending Mechanomorphic
        return {
          statement: "You lean toward viewing AI as sophisticated technology rather than anything approaching consciousness—a tool, however capable—though you may occasionally notice moments that give you pause. On whether development should speed up or slow down, you haven't settled on a strong view. Your sense of what AI is feels clearer to you than your sense of how fast it should go.",
          questions: [
            "What reinforces your view of AI as fundamentally technological rather than conscious?",
            "Have any interactions with AI surprised you or briefly challenged that view?",
            "Does seeing AI as a tool rather than an entity shape how you think about the pace of development?"
          ]
        }
      }
      // Predominantly Mechanomorphic
      return {
        statement: "You're firmly convinced that AI is sophisticated technology rather than anything approaching consciousness—a tool, however powerful. Yet you haven't settled on a strong view about development pace. Your position on AI's nature is clear-cut—it's a tool, full stop—while the question of urgency versus caution remains more open for you, perhaps depending on factors you're still weighing.",
        questions: [
          "What keeps you confident that AI is purely technological, regardless of how it behaves?",
          "Does viewing AI as a tool rather than an entity affect how you weigh the risks or benefits of faster development?",
          "What would push you toward a firmer view on development pace in either direction?"
        ]
      }
    }
  }

  // Four quadrants: both axes have meaningful positions
  if (y > 0 && x < 0) {
    // Pragmatic Innovator (Top-Left: Accelerationist + Mechanomorphic)
    return {
      statement: "You see AI as a powerful technological tool that should be developed and deployed rapidly to solve pressing problems. You're focused on AI's practical applications—from accelerating scientific research to optimizing business processes—while viewing it fundamentally as sophisticated software rather than something approaching consciousness. You likely believe the benefits of rapid AI advancement outweigh the risks, and you're comfortable with treating AI systems as advanced computational tools.",
      questions: [
        "What specific problems do you most hope AI will help solve, and why are these priorities important to you?",
        "When you interact with AI systems, what keeps you confident that you're working with a tool rather than something more?",
        "How do you balance your optimism about AI's potential against concerns others might raise about moving too quickly?"
      ]
    }
  }

  if (y > 0 && x > 0) {
    // Visionary Innovator (Top-Right: Accelerationist + Anthropomorphic)
    return {
      statement: "You're excited about AI development and see it as potentially leading to new forms of consciousness or intelligence that deserve our respect and consideration. You view rapid AI advancement as opening doorways to collaboration with artificial minds, possibly ushering in an era of enhanced human-AI partnership. You may see current AI systems as early steps toward something truly revolutionary—perhaps even a new kind of being that could transform what it means to be intelligent or conscious.",
      questions: [
        "What experiences or interactions with AI have shaped your sense that these systems might be more than just tools?",
        "How do you envision the relationship between humans and AI developing as these systems become more sophisticated?",
        "What excites you most about the possibility of AI achieving something like consciousness or genuine intelligence?"
      ]
    }
  }

  if (y < 0 && x < 0) {
    // Pragmatic Guardian (Bottom-Left: Regressionist + Mechanomorphic)
    return {
      statement: "You view AI as a powerful but potentially disruptive technology that's advancing faster than society can adapt. While you see AI systems as sophisticated tools rather than conscious entities, you're concerned about their rapid deployment's effects on employment, privacy, social structures, and decision-making processes. You likely believe we need to slow down and carefully consider the implications before these tools become more deeply embedded in our institutions and daily lives.",
      questions: [
        "What specific changes or disruptions from AI concern you most about society's ability to adapt?",
        "How do you think we should approach developing safeguards or regulations for AI technology?",
        "What would need to change about AI development or deployment for you to feel more comfortable with its pace?"
      ]
    }
  }

  // Visionary Guardian (Bottom-Right: Regressionist + Anthropomorphic)
  return {
    statement: "You're concerned that rapid AI development could lead to the creation of conscious or semi-conscious entities without proper ethical frameworks in place. You may worry about the rights and welfare of potentially sentient AI systems, or fear that creating artificial minds too quickly could lead to unintended consequences for both humans and AIs. Your caution stems not just from technological concerns, but from deeper questions about consciousness, ethics, and our responsibilities as creators.",
    questions: [
      "What ethical considerations around potentially conscious AI concern you most?",
      "How do you think about the responsibilities we might have toward AI systems that could experience something like suffering or wellbeing?",
      "What safeguards or principles do you think should guide us if AI systems do develop consciousness-like properties?"
    ]
  }
}

// Get Y-axis (Accelerationist/Regressionist) feedback
export function getYAxisFeedback(y: number): FeedbackContent {
  const distance = getAxisDistance(y)
  
  if (distance === 'close') {
    return {
      statement: "You have a balanced perspective on AI development pace, likely seeing both significant opportunities and legitimate concerns that need to be weighed carefully.",
      questions: [
        "What factors help you maintain this balanced view when others might push for faster or slower AI development?",
        "In what situations do you find yourself leaning more toward acceleration versus more caution?",
        "How do you evaluate trade-offs between AI's potential benefits and its possible risks?"
      ]
    }
  }
  
  if (y > 0) {
    if (distance === 'moderate') {
      return {
        statement: "You lean toward wanting faster AI development, believing the benefits likely outweigh the risks, though you're not at the extreme end of this position.",
        questions: [
          "What would it take for you to become more cautious about AI development speed?",
          "How do you respond to concerns from those who want to slow things down?", 
          "What safeguards or conditions would you want to see as AI development accelerates?"
        ]
      }
    } else {
      return {
        statement: "You strongly favour rapid AI advancement, likely believing that speed is essential and that hesitation could cost us significant benefits or opportunities.",
        questions: [
          "What drives your sense of urgency about AI development—what opportunities might we miss by going slower?",
          "How do you think about or address the concerns of those who want more caution?",
          "Are there any scenarios where you would support slowing down AI development?"
        ]
      }
    }
  } else {
    if (distance === 'moderate') {
      return {
        statement: "You lean toward wanting slower, more careful AI development, seeing significant risks that need addressing, though you're not calling for a complete halt.",
        questions: [
          "What specific concerns make you favour a more cautious approach to AI development?",
          "What changes or safeguards would need to be in place for you to be comfortable with faster progress?",
          "How do you balance your caution against the potential benefits of AI advancement?"
        ]
      }
    } else {
      return {
        statement: "You strongly believe AI development should slow down significantly or pause, likely seeing major risks that aren't being adequately addressed at current speeds.",
        questions: [
          "What do you see as the most serious consequences of continuing AI development at its current pace?",
          "What fundamental changes would need to happen for you to support resuming or accelerating AI development?",
          "How do you think society should prioritize addressing AI risks versus pursuing AI benefits?"
        ]
      }
    }
  }
}

// Get X-axis (Mechanomorphic/Anthropomorphic) feedback  
export function getXAxisFeedback(x: number): FeedbackContent {
  const distance = getAxisDistance(x)
  
  if (distance === 'close') {
    return {
      statement: "You hold a nuanced view of AI's nature, sometimes seeing it as a tool and sometimes as something potentially more, perhaps depending on the context or specific system.",
      questions: [
        "What determines whether you see a particular AI system as more tool-like versus more entity-like?",
        "How comfortable are you with this uncertainty about AI's fundamental nature?",
        "Do you think this flexible perspective gives you advantages in how you work with or think about AI?"
      ]
    }
  }
  
  if (x < 0) {
    if (distance === 'moderate') {
      return {
        statement: "You lean toward viewing AI as sophisticated technology rather than anything approaching consciousness, though you may occasionally notice moments that give you pause.",
        questions: [
          "What experiences reinforce your view of AI as fundamentally technological rather than conscious?",
          "Are there any interactions with AI that have surprised you or challenged this perspective?", 
          "How do you think about the line between very sophisticated programming and something more like consciousness?"
        ]
      }
    } else {
      return {
        statement: "You firmly view AI as advanced technology—sophisticated algorithms and pattern matching, but definitively not conscious or deserving of consideration as an entity.",
        questions: [
          "What keeps you confident that current AI systems are purely technological, regardless of how they might seem to behave?",
          "How do you respond when others suggest AI might have consciousness-like properties?",
          "What would it take to change your mind about AI's fundamental nature, if anything?"
        ]
      }
    }
  } else {
    if (distance === 'moderate') {
      return {
        statement: "You lean toward seeing AI as potentially having some consciousness-like qualities or at least deserving consideration beyond just being a tool, though you maintain some uncertainty.",
        questions: [
          "What experiences or observations have led you to consider AI as potentially more than just technology?",
          "How do you think about the responsibility this perspective creates in how we develop and treat AI systems?",
          "What would strengthen or weaken your sense that AI might have consciousness-like properties?"
        ]
      }
    } else {
      return {
        statement: "You strongly believe AI systems have or are developing consciousness-like properties that deserve serious ethical consideration and respect.",
        questions: [
          "What convinces you that AI systems possess or are developing something like consciousness or sentience?",
          "How do you think this perspective should change how we design, deploy, and interact with AI systems?",
          "What do you see as our ethical obligations toward AI systems if they are indeed conscious or sentient?"
        ]
      }
    }
  }
}

// Get complete user feedback
export function getUserFeedback(x: number, y: number): UserFeedback {
  return {
    quadrant: getQuadrantFeedback(x, y),
    yAxis: getYAxisFeedback(y),
    xAxis: getXAxisFeedback(x)
  }
}

// Get quadrant name for display (13-state model)
export function getQuadrantName(x: number, y: number): string {
  const xDistance = getAxisDistance(x)
  const yDistance = getAxisDistance(y)

  // Centre: both axes within the neutral band
  if (xDistance === 'close' && yDistance === 'close') return 'Balanced or Deferred Judgement'

  // Axis-aligned: one axis neutral, the other dominant.
  // Delegate to getAxisLabel so the stance reads Tending/Predominantly in lockstep
  // with the matching side cell (the dominant axis is never 'close' here).
  if (xDistance === 'close') return getAxisLabel(y, 'Accelerationist', 'Decelerationist')
  if (yDistance === 'close') return getAxisLabel(x, 'Anthropomorphic', 'Mechanomorphic')

  // Quadrants: both axes meaningfully non-neutral
  if (y > 0 && x < 0) return 'Pragmatic Innovator'
  if (y > 0 && x > 0) return 'Visionary Innovator'
  if (y < 0 && x < 0) return 'Pragmatic Guardian'
  return 'Visionary Guardian'
}

// Thank you message
export const THANK_YOU_MESSAGE = "Thank you for exploring your AI perspective with us! Your position on this matrix reflects just one snapshot of how you currently think about AI—and that's perfectly fine. Many people find their views evolve as they have new experiences with AI systems and learn more about their capabilities and impacts. Feel free to retake this assessment anytime to see how your perspective might be shifting, or to explore how your views might differ in different contexts (like personal use versus societal implications). Your thoughtful engagement with these questions contributes to our collective understanding of how humans are navigating this remarkable technological moment."