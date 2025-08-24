import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

type Role = 'user' | 'assistant' | 'system'

type Message = { role: Role, content: string }

type LeadFields = {
  full_name?: string | null
  business_type?: 'company' | 'freelancer' | null
  website?: string | null
  pan?: string | null
  aadhaar?: string | null
}

type ChatResponse = {
  reply: string
  lead_fields: LeadFields
  completed: Record<string, boolean>
  auto_submitted?: boolean
  submission_id?: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you with lead onboarding or general assistance. What would you like to do today?' }
  ])
  const [lead, setLead] = useState<LeadFields>({})
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  // Streak system state - starting at zero
  const [streaks, setStreaks] = useState({
    total: 0,
    full_name: 0,
    business_type: 0,
    website: 0,
    pan: 0,
    aadhaar: 0
  })
  const [showStreakModal, setShowStreakModal] = useState(false)

  const canSubmit = !!(lead.full_name && lead.business_type && lead.pan && lead.aadhaar)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Function to clear the form
  const clearForm = () => {
    setLead({
      full_name: null,
      business_type: null,
      website: null,
      pan: null,
      aadhaar: null
    })
    setCompleted({})
    
    // Reset streaks to zero when form is cleared
    setStreaks({
      total: 0,
      full_name: 0,
      business_type: 0,
      website: 0,
      pan: 0,
      aadhaar: 0
    })
  }

  // Function to update streaks based on lead field updates
  const updateStreaks = (fieldName: string, value: string | null) => {
    console.log(`Updating streak for ${fieldName} with value: ${value}`)
    
    // Update individual field streak based on completion
    setStreaks(prev => {
      if (fieldName in prev) {
        const newStreaks = {
          ...prev,
          [fieldName]: value && value.trim() ? 20 : 0 // 20 when completed, 0 when empty
        }
        console.log('Updated field streak:', newStreaks)
        return newStreaks
      } else {
        console.error(`Field name ${fieldName} not found in streaks object`)
        return prev
      }
    })
  }

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1366) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const isMobile = screenSize === 'mobile'
  const isTablet = screenSize === 'tablet'
  const isDesktop = screenSize === 'desktop'

  // Function to format AI responses for better readability
  const formatAIResponse = (content: string): string => {
    let formatted = content
      .replace(/###\s*/g, '\n\n📋 ')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/---/g, '\n\n---\n\n')
      .replace(/`(.*?)`/g, '$1')
    
    formatted = formatted.replace(/(\d+\.\s)/g, '\n$1')
    formatted = formatted.replace(/\n{3,}/g, '\n\n')
    formatted = formatted.replace(/\n\n(?!🔹)/g, '\n\n🔹 ')
    
    return formatted.trim()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Debug: Monitor streak changes
  useEffect(() => {
    console.log('Streaks updated:', streaks)
  }, [streaks])

  // Debug: Monitor completed state changes
  useEffect(() => {
    console.log('Completed state updated:', completed)
  }, [completed])

  // Debug: Monitor lead state changes
  useEffect(() => {
    console.log('Lead state updated:', lead)
  }, [lead])

  // Update streak based on progress
  useEffect(() => {
    const completedCount = Object.values(completed).filter(Boolean).length
    console.log(`Progress updated: ${completedCount}/5 fields completed`)
    console.log('Completed object:', completed)
    console.log('Completed values:', Object.values(completed))
    console.log('Filtered completed values:', Object.values(completed).filter(Boolean))
    
    // Calculate new total streak based on progress
    const newTotalStreak = completedCount * 20 // 20 points per completed field
    console.log(`Calculating new streak: ${completedCount} × 20 = ${newTotalStreak}`)
    
    setStreaks(prev => ({
      ...prev,
      total: newTotalStreak
    }))
  }, [completed])

  // Update completed state based on lead fields
  useEffect(() => {
    const newCompleted = {
      full_name: !!(lead.full_name && lead.full_name.trim()),
      business_type: !!(lead.business_type && lead.business_type.trim()),
      website: !!(lead.website && lead.website.trim()),
      pan: !!(lead.pan && lead.pan.trim()),
      aadhaar: !!(lead.aadhaar && lead.aadhaar.trim())
    }
    
    console.log('Lead changed, updating completed state:', newCompleted)
    console.log('Current lead state:', lead)
    setCompleted(newCompleted)
  }, [lead])



  const sendMessage = async () => {
    if (!text.trim() || isLoading) return
    
    const next: Message[] = [...messages, { role: 'user' as Role, content: text }]
    setMessages(next)
    setText('')
    setIsLoading(true)
    
    try {
      const response = await axios.post(`${API_BASE}/api/chat`, {
        session_id: sessionId,
        messages: next
      })
      
      const data: ChatResponse = response.data
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      setLead(data.lead_fields)
      
      // Merge AI's completed state with our manual tracking
      if (data.lead_fields) {
        const aiCompleted = {
          full_name: !!(data.lead_fields.full_name && data.lead_fields.full_name.trim()),
          business_type: !!(data.lead_fields.business_type && data.lead_fields.business_type.trim()),
          website: !!(data.lead_fields.website && data.lead_fields.website.trim()),
          pan: !!(data.lead_fields.pan && data.lead_fields.pan.trim()),
          aadhaar: !!(data.lead_fields.aadhaar && data.lead_fields.aadhaar.trim())
        }
        setCompleted(aiCompleted)
      }
      
      if (data.auto_submitted) {
        setAutoSubmitted(true)
        setSubmissionId(data.submission_id || null)
        
        // Clear the form after 1 second when auto-submitted
        setTimeout(() => {
          clearForm()
          setAutoSubmitted(false)
          setSubmissionId(null)
        }, 1000)
      }
      
      setError(null)
    } catch (err) {
      console.error('Chat error:', err)
      setError('Failed to send message. Please try again.')
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
      // Auto-focus the chat input after message is sent
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    
    setSubmitting(true)
    try {
      const response = await axios.post(`${API_BASE}/api/submit`, {
        session_id: sessionId,
        lead: lead
      })
      
      if (response.data.status === 'ok') {
        setCompleted(prev => ({ ...prev, submitted: true }))
        setError(null)
        
        // Clear the form after successful submission
        clearForm()
        
        // Show success message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `🎉 Thank you! Your lead has been successfully submitted with ID: ${response.data.id}. The form has been cleared for new submissions.` 
        }])
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="chat-page-container">
      {/* Running Ads Banner */}
      <div className="running-ads-banner">
        <div className="ads-content">
          <span>•</span>
          <span>Free e-FIRA</span>
          <span>•</span>
          <span>Faster Payments</span>
          <span>•</span>
          <span>Flat 1% Transaction Fee</span>
          <span>•</span>
          <span>24-Hour Customer Service</span>
          <span>•</span>
          <span>No Hidden Charges</span>
          <span>•</span>
          <span>210 users are signing up now</span>
          <span>•</span>
          <span>20% share a similar profile to you</span>
          <span>•</span>
          <span>Free e-FIRA</span>
          <span>•</span>
          <span>Faster Payments</span>
          <span>•</span>
          <span>Flat 1% Transaction Fee</span>
          <span>•</span>
          <span>24-Hour Customer Service</span>
          <span>•</span>
          <span>No Hidden Charges</span>
          <span>•</span>
          <span>210 users are signing up now</span>
          <span>•</span>
                      <span>20% share a similar profile to you</span>
            <span>•</span>
            <span>Free e-FIRA</span>
            <span>•</span>
            <span>Faster Payments</span>
            <span>•</span>
            <span>Flat 1% Transaction Fee</span>
            <span>•</span>
            <span>24-Hour Customer Service</span>
            <span>•</span>
            <span>No Hidden Charges</span>
            <span>•</span>
            <span>210 users are signing up now</span>
            <span>•</span>
            <span>20% share a similar profile to you</span>
            <span>•</span>
          </div>
      </div>

      {/* Main Chat Layout */}
      <div className="chat-layout">
        {/* Chat Area */}
        <div className="chat-area">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-logo">
              <span>KB</span>
            </div>
            <div className="chat-title">
              <h2>Karbon FX AI Assistant</h2>
              <p>Ask me about Forex, cross-border payments, or let me help with onboarding</p>
            </div>
            {/* Streak Button */}
            <div 
              className="streak-button" 
              title="View your streak progress"
              onClick={() => setShowStreakModal(true)}
            >
              🔥 {streaks.total}
            </div>
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                <div className="message-content">
                  {m.role === 'assistant' ? formatAIResponse(m.content) : m.content}
                  <div className="message-timestamp">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <input 
              ref={chatInputRef}
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder="Type your message here..." 
              className="chat-input"
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !text.trim()}
              className="send-button"
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>
        </div>

        {/* Form Area */}
        <div className="form-area">
          {/* Form Header */}
          <div className="form-header">
            <div className="form-logo">
              <span>💱</span>
            </div>
            <div className="form-title">
              <h3>FX Onboarding</h3>
              <p>Complete your Karbon FX profile details</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="progress-container">
            <div className="progress-header">
              <div className="progress-circle">
                {Object.values(completed).filter(Boolean).length}
              </div>
              <span className="progress-text">
                Progress: {Object.values(completed).filter(Boolean).length}/5 fields completed
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(Object.values(completed).filter(Boolean).length / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <label className="form-field">
              <span className="field-label">
                <span className="required">•</span>
                Full name (first, middle, last)
              </span>
              <input 
                value={lead.full_name ?? ''} 
                onChange={e => {
                  setLead((l: LeadFields) => ({ ...l, full_name: e.target.value }))
                  updateStreaks('full_name', e.target.value)
                }} 
                className="form-input"
                placeholder="Enter your complete name (e.g., John Michael Smith)"
              />
            </label>
            
            <label className="form-field">
              <span className="field-label">
                <span className="required">•</span>
                Business type
              </span>
              <select 
                value={lead.business_type ?? ''} 
                onChange={e => {
                  setLead((l: LeadFields) => ({ ...l, business_type: e.target.value as 'company' | 'freelancer' }))
                  updateStreaks('business_type', e.target.value)
                }} 
                className="form-select"
              >
                <option value="">Select business type</option>
                <option value="company">Company</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </label>
            
            <label className="form-field">
              <span className="field-label">Website (optional)</span>
              <input 
                value={lead.website ?? ''} 
                onChange={e => {
                  setLead((l: LeadFields) => ({ ...l, website: e.target.value }))
                  updateStreaks('website', e.target.value)
                }} 
                className="form-input"
                placeholder="https://example.com"
              />
            </label>
            
            <label className="form-field">
              <span className="field-label">
                <span className="required">•</span>
                PAN
              </span>
              <input 
                value={lead.pan ?? ''} 
                onChange={e => {
                  setLead((l: LeadFields) => ({ ...l, pan: e.target.value }))
                  updateStreaks('pan', e.target.value)
                }} 
                className="form-input"
                placeholder="ABCDE1234F"
              />
            </label>
            
            <label className="form-field">
              <span className="field-label">
                <span className="required">•</span>
                Aadhaar
              </span>
              <input 
                value={lead.aadhaar ?? ''} 
                onChange={e => {
                  setLead((l: LeadFields) => ({ ...l, aadhaar: e.target.value }))
                  updateStreaks('aadhaar', e.target.value)
                }} 
                className="form-input"
                placeholder="1234-5678-9012"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="submit-button"
          >
            {submitting ? 'Submitting...' : 'Submit Lead'}
          </button>

          {/* Required Fields Info */}
          {/* <div className="required-info">
            <span>Required fields: name, type, PAN, Aadhaar</span>
            <span>•</span>
            <span>Progress: {Object.values(completed).filter(Boolean).length}/5</span>
          </div> */}

          {/* Auto-submit Success */}
          {autoSubmitted && submissionId && (
            <div className="success-message">
              <span>🎉</span>
              <div>
                <div>Automatically submitted!</div>
                <div>ID: {submissionId}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Home Icon */}
      <div
        onClick={() => navigate('/')}
        className="floating-home-button"
        title="Click to go to Home page"
      >
        🏠
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          .chat-page-container {
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }

          .running-ads-banner {
            background: #f5f5f5;
            color: #333;
            padding: ${isMobile ? '8px 12px' : isTablet ? '10px 16px' : '12px 20px'};
            overflow: hidden;
            position: relative;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid #e0e0e0;
            margin-top: 0;
          }

          .ads-content {
            display: flex;
            align-items: center;
            gap: ${isMobile ? '12px' : isTablet ? '16px' : '20px'};
            white-space: nowrap;
            animation: scroll-ads 12s linear infinite;
            font-size: ${isMobile ? '12px' : isTablet ? '14px' : '16px'};
            font-weight: 500;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            perspective: 1000px;
          }

          .ads-content span {
            flex-shrink: 0;
            user-select: none;
          }

          @keyframes scroll-ads {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-100%, 0, 0);
            }
          }

          .chat-layout {
            display: grid;
            grid-template-columns: ${isMobile ? '1fr' : isTablet ? '1fr 320px' : '1fr 380px'};
            gap: ${isMobile ? '16px' : isTablet ? '20px' : '28px'};
            height: ${isMobile ? 'calc(100vh - 200px)' : isTablet ? 'calc(100vh - 220px)' : 'calc(100vh - 260px)'};
            max-width: 100%;
            overflow: hidden;
            padding: 0;
            margin-top: ${isMobile ? '16px' : isTablet ? '20px' : '24px'};
            box-sizing: border-box;
          }

          .chat-area {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
            border-radius: ${isMobile ? '12px' : isTablet ? '16px' : '20px'};
            padding: ${isMobile ? '16px' : isTablet ? '20px' : '28px'};
            display: flex;
            flex-direction: column;
            min-height: ${isMobile ? '350px' : isTablet ? '450px' : '550px'};
            max-height: ${isMobile ? 'calc(100vh - 200px)' : isTablet ? 'calc(100vh - 220px)' : 'calc(100vh - 260px)'};
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(20px);
            position: relative;
            overflow: hidden;
            width: 100%;
            box-sizing: border-box;
          }

          .form-area {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
            border-radius: ${isMobile ? '12px' : isTablet ? '16px' : '20px'};
            padding: ${isMobile ? '16px' : isTablet ? '20px' : '28px'};
            height: fit-content;
            max-height: ${isMobile ? 'calc(100vh - 200px)' : isTablet ? 'calc(100vh - 220px)' : 'calc(100vh - 260px)'};
            overflow: auto;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(20px);
            position: relative;
            align-self: start;
            width: 100%;
            min-width: ${isMobile ? '100%' : isTablet ? '300px' : '360px'};
            box-sizing: border-box;
          }

          .chat-header, .form-header {
            display: flex;
            align-items: center;
            gap: ${isMobile ? '12px' : isTablet ? '16px' : '20px'};
            margin-bottom: ${isMobile ? '20px' : isTablet ? '24px' : '28px'};
            padding-bottom: ${isMobile ? '16px' : isTablet ? '20px' : '24px'};
            border-bottom: 2px solid rgba(243, 244, 246, 0.8);
            position: relative;
            z-index: 1;
          }

          .chat-logo, .form-logo {
            width: ${isMobile ? '48px' : isTablet ? '56px' : '60px'};
            height: ${isMobile ? '48px' : isTablet ? '56px' : '60px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isMobile ? '20px' : isTablet ? '24px' : '26px'};
            color: white;
            font-weight: bold;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }

          .chat-logo {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .form-logo {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
          }

          .chat-title h2, .form-title h3 {
            margin: 0;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .chat-title h2 {
            font-size: ${isMobile ? '18px' : isTablet ? '20px' : '24px'};
          }

          .form-title h3 {
            font-size: ${isMobile ? '18px' : isTablet ? '20px' : '22px'};
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .chat-title p, .form-title p {
            margin: ${isMobile ? '4px 0 0 0' : isTablet ? '5px 0 0 0' : '6px 0 0 0'};
            font-size: ${isMobile ? '13px' : isTablet ? '14px' : '15px'};
            color: #6b7280;
            font-weight: 500;
          }

          .messages-container {
            flex: 1;
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: ${isMobile ? '12px' : isTablet ? '16px' : '20px'};
            padding-bottom: ${isMobile ? '16px' : isTablet ? '18px' : '20px'};
            position: relative;
            z-index: 1;
          }

          .message {
            align-self: flex-start;
            max-width: ${isMobile ? '85%' : isTablet ? '80%' : '75%'};
            animation: fadeInUp 0.5s ease-out both;
          }

          .user-message {
            align-self: flex-end;
          }

          .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: ${isMobile ? '14px 18px' : isTablet ? '16px 20px' : '18px 24px'};
            border-radius: ${isMobile ? '18px 18px 4px 18px' : isTablet ? '20px 20px 4px 20px' : '24px 24px 4px 24px'};
            word-break: break-word;
            white-space: pre-wrap;
            line-height: 1.7;
            font-size: ${isMobile ? '13px' : isTablet ? '14px' : '15px'};
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.25);
            border: none;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            position: relative;
          }

          .assistant-message .message-content {
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
            color: #1f2937;
            border-radius: ${isMobile ? '18px 18px 18px 4px' : isTablet ? '20px 20px 20px 4px' : '24px 24px 24px 4px'};
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(229, 231, 235, 0.8);
          }

          .message-timestamp {
            font-size: ${isMobile ? '10px' : '11px'};
            opacity: 0.7;
            margin-top: ${isMobile ? '6px' : '8px'};
            text-align: right;
            font-style: italic;
          }

          .assistant-message .message-timestamp {
            text-align: left;
          }

          .chat-input-container {
            display: flex;
            gap: ${isMobile ? '8px' : isTablet ? '12px' : '16px'};
            margin-top: ${isMobile ? '16px' : isTablet ? '18px' : '20px'};
            padding: ${isMobile ? '12px' : isTablet ? '16px' : '24px'};
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
            border-radius: ${isMobile ? '12px' : isTablet ? '16px' : '20px'};
            border: 1px solid rgba(229, 231, 235, 0.6);
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 1;
            width: 100%;
            box-sizing: border-box;
            flex-direction: ${isMobile ? 'column' : 'row'};
          }

          .chat-input {
            flex: 1;
            padding: ${isMobile ? '12px 14px' : isTablet ? '14px 16px' : '18px 24px'};
            border-radius: ${isMobile ? '10px' : isTablet ? '12px' : '16px'};
            border: 2px solid rgba(229, 231, 235, 0.8);
            font-size: ${isMobile ? '13px' : isTablet ? '14px' : '16px'};
            outline: none;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            font-weight: 500;
          }

          .send-button {
            padding: ${isMobile ? '12px 16px' : isTablet ? '14px 20px' : '18px 28px'};
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: ${isMobile ? '10px' : isTablet ? '12px' : '16px'};
            cursor: pointer;
            font-weight: 700;
            font-size: ${isMobile ? '13px' : isTablet ? '14px' : '16px'};
            transition: all 0.3s ease;
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
            min-width: ${isMobile ? '100%' : isTablet ? '100px' : '120px'};
            position: relative;
            overflow: hidden;
          }

          .send-button:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            box-shadow: none;
          }

          .progress-container {
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
            padding: ${isMobile ? '16px' : isTablet ? '18px' : '20px'};
            border-radius: ${isMobile ? '12px' : isTablet ? '14px' : '16px'};
            border: 1px solid rgba(229, 231, 235, 0.6);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
            margin-bottom: ${isMobile ? '16px' : isTablet ? '20px' : '24px'};
          }

          .progress-header {
            display: flex;
            align-items: center;
            gap: ${isMobile ? '8px' : isTablet ? '10px' : '12px'};
            margin-bottom: ${isMobile ? '12px' : isTablet ? '14px' : '16px'};
          }

          .progress-circle {
            width: ${isMobile ? '20px' : isTablet ? '22px' : '24px'};
            height: ${isMobile ? '20px' : isTablet ? '22px' : '24px'};
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isMobile ? '10px' : isTablet ? '11px' : '12px'};
            color: white;
            font-weight: bold;
          }

          .progress-text {
            font-size: ${isMobile ? '13px' : isTablet ? '14px' : '15px'};
            font-weight: 600;
            color: #374151;
          }

          .progress-bar {
            width: 100%;
            height: 10px;
            background: rgba(229, 231, 235, 0.6);
            border-radius: 5px;
            overflow: hidden;
            position: relative;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            transition: width 0.6s ease;
            border-radius: 5px;
            position: relative;
          }

          .form-fields {
            display: flex;
            flex-direction: column;
            gap: ${isMobile ? '16px' : isTablet ? '20px' : '24px'};
            margin-bottom: ${isMobile ? '20px' : isTablet ? '24px' : '28px'};
          }

          .form-field {
            display: flex;
            flex-direction: column;
            gap: ${isMobile ? '8px' : isTablet ? '9px' : '10px'};
          }

          .field-label {
            font-size: ${isMobile ? '13px' : isTablet ? '14px' : '15px'};
            font-weight: 600;
            color: #374151;
            display: flex;
            align-items: center;
            gap: ${isMobile ? '6px' : isTablet ? '7px' : '8px'};
          }

          .required {
            color: #ef4444;
            font-size: ${isMobile ? '16px' : isTablet ? '17px' : '18px'};
          }

          .form-input, .form-select {
            padding: ${isMobile ? '14px 16px' : isTablet ? '15px 18px' : '16px 20px'};
            border-radius: ${isMobile ? '12px' : isTablet ? '14px' : '16px'};
            border: 2px solid rgba(229, 231, 235, 0.8);
            font-size: ${isMobile ? '13px' : isTablet ? '14px' : '15px'};
            outline: none;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            font-weight: 500;
          }

          .form-input:focus, .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
            transform: scale(1.02);
          }

          .submit-button {
            width: 100%;
            padding: ${isMobile ? '14px 20px' : isTablet ? '16px 24px' : '18px 28px'};
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: ${isMobile ? '12px' : isTablet ? '14px' : '16px'};
            cursor: pointer;
            font-weight: 700;
            font-size: ${isMobile ? '14px' : isTablet ? '15px' : '16px'};
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
            margin-bottom: ${isMobile ? '16px' : isTablet ? '20px' : '24px'};
          }

          .submit-button:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            box-shadow: none;
          }

          .required-info {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            font-size: 13px;
            color: #6b7280;
            justify-content: center;
            padding: 16px;
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
            border-radius: 12px;
            border: 1px solid rgba(229, 231, 235, 0.6);
            backdrop-filter: blur(10px);
            margin-bottom: 16px;
          }

          .success-message {
            padding: 20px;
            background: linear-gradient(135deg, rgba(209, 250, 229, 0.9) 0%, rgba(167, 243, 208, 0.9) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 16px;
            font-size: 14px;
            color: #059669;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
          }

          .success-message span:first-child {
            font-size: 24px;
          }

          .success-message div div:first-child {
            font-weight: 700;
            margin-bottom: 6px;
          }

          .success-message div div:last-child {
            font-size: 12px;
            opacity: 0.8;
          }

          .floating-home-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
            transition: all 0.3s ease;
            z-index: 1000;
            animation: pulse 2s infinite;
          }

          .floating-home-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

                    /* Responsive adjustments */
          @media (max-width: 1365px) {
            .chat-layout {
              gap: 20px !important;
              height: calc(100vh - 200px) !important;
            }
          }
          
          @media (max-width: 767px) {
            .chat-layout {
              gap: 16px !important;
              height: calc(100vh - 180px) !important;
            }
          }
        `}
      </style>
    </div>
  )
}


