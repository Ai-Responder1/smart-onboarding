import React, { useState, useEffect } from 'react'

interface HomePageProps {
  onOpenChat: () => void
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenChat }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize('mobile')
      } else if (width < 1024) {
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

  const excitingMessages = [
    "🚀 Ready to explore the world of Forex? Your Karbon FX assistant is waiting!",
    "💱 Got questions about currency exchange? Our FX expert has all the answers!",
    "🌍 Discover global markets, get help with cross-border payments, and explore FX possibilities!",
    "💹 Need assistance with Forex transactions? Click the chat icon and let's start trading together!",
    "✨ Your FX journey begins with a simple click - let's unlock global financial opportunities!",
    "🔮 The future of cross-border payments is here - ready to transform your FX experience!",
    "🎉 Welcome to Karbon FX! Your currency exchange companion is ready to help!",
    "🚀 Breakthrough FX technology at your fingertips - let's explore global markets together!"
  ]

  useEffect(() => {
    // Rotate through messages every 4 seconds
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % excitingMessages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [excitingMessages.length])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px 12px' : isTablet ? '24px 20px' : '40px 24px',
      textAlign: 'center',
      position: 'relative',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo and title */}
        <div style={{
          marginBottom: '40px'
        }}>
          <div style={{
            width: isMobile ? '60px' : isTablet ? '80px' : '120px',
            height: isMobile ? '60px' : isTablet ? '80px' : '120px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '24px' : isTablet ? '32px' : '48px',
            color: 'white',
            fontWeight: 'bold',
            margin: '0 auto 24px',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
          }}>
            KB
          </div>
          
          <h1 style={{
            fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3.5rem',
            fontWeight: '800',
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em'
          }}>
            Karbon Business
          </h1>
          
          <p style={{
            fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.25rem',
            color: '#6b7280',
            margin: '0 0 32px',
            maxWidth: isMobile ? '100%' : isTablet ? '90%' : '600px',
            lineHeight: '1.6'
          }}>
            Your gateway to intelligent conversations, document insights, and AI-powered assistance
          </p>
        </div>

        {/* Feature highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: isMobile ? '12px' : isTablet ? '16px' : '24px',
          maxWidth: isMobile ? '100%' : isTablet ? '100%' : '800px',
          width: '100%',
          marginBottom: isMobile ? '20px' : isTablet ? '32px' : '40px'
        }}>
          {[
            { icon: '💬', title: 'Smart Chat', desc: 'Intelligent conversations with AI' },
            { icon: '📄', title: 'Document Analysis', desc: 'Upload and analyze PDFs instantly' },
            { icon: '🚀', title: 'Lead Onboarding', desc: 'Automated lead qualification process' },
            { icon: '🔍', title: 'Deep Insights', desc: 'Get answers from your documents' }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              padding: isMobile ? '12px' : isTablet ? '16px' : '24px',
              borderRadius: isMobile ? '8px' : isTablet ? '12px' : '16px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem',
                marginBottom: isMobile ? '12px' : '16px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.25rem',
                fontWeight: '600',
                margin: '0 0 8px',
                color: '#1f2937'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: isMobile ? '0.7rem' : isTablet ? '0.8rem' : '0.9rem',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Get started button */}
        <button
          onClick={onOpenChat}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: isMobile ? '12px 20px' : isTablet ? '14px 24px' : '16px 32px',
            borderRadius: isMobile ? '25px' : '50px',
            fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            width: isMobile ? '100%' : isTablet ? 'auto' : 'auto',
            minWidth: isMobile ? 'auto' : isTablet ? '200px' : 'auto'
          }}
        >
          🚀 Get Started with AI Chat
        </button>
      </div>

      {/* Popup Message above Chatbot Icon */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? '80px' : isTablet ? '100px' : '120px',
        right: isMobile ? '12px' : isTablet ? '20px' : '30px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '10px 12px' : isTablet ? '12px 16px' : '16px 20px',
        borderRadius: isMobile ? '8px' : isTablet ? '12px' : '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: isMobile ? '200px' : isTablet ? '250px' : '300px',
        zIndex: 1001,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            FX Update
          </span>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#374151',
          margin: 0,
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          {excitingMessages[currentMessageIndex]}
        </p>
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          right: '30px',
          width: '0',
          height: '0',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(255, 255, 255, 0.95)'
        }}></div>
      </div>

      {/* Floating Chatbot Icon */}
      <div
        onClick={onOpenChat}
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : isTablet ? '20px' : '30px',
          right: isMobile ? '12px' : isTablet ? '20px' : '30px',
          width: isMobile ? '50px' : isTablet ? '60px' : '70px',
          height: isMobile ? '50px' : isTablet ? '60px' : '70px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        title="Click to open AI Chat Assistant"
      >
        💬
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
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
        `}
      </style>
    </div>
  )
}
