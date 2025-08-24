import React, { useMemo, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ChatPage } from './ChatPage'
import { UploadPage } from './UploadPage'
import { HomePage } from './HomePage'

export const App: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  // Check screen size on mount and resize with more granular breakpoints
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

  const Nav = useMemo(() => (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '8px 8px' : isTablet ? '10px 16px' : '10px 2px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : isTablet ? 12 : 16
      }}>
        <div style={{
          width: isMobile ? 28 : isTablet ? 32 : 40,
          height: isMobile ? 28 : isTablet ? 32 : 40,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: isMobile ? '8px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '14px' : isTablet ? '16px' : '20px',
          color: 'white',
          fontWeight: 'bold',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          KB
        </div>
        <h1 style={{
          margin: 0,
          color: 'white',
          fontSize: isMobile ? '16px' : isTablet ? '18px' : '24px',
          fontWeight: '700',
          letterSpacing: '-0.5px',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          Karbon Business
        </h1>
      </div>
      
      <div style={{
        display: 'flex',
        gap: 8,
        background: 'rgba(255, 255, 255, 0.1)',
        padding: isMobile ? '6px' : '8px',
        borderRadius: isMobile ? '12px' : '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: isMobile ? '6px 12px' : isTablet ? '8px 16px' : '12px 24px',
            background: location.pathname === '/' 
              ? 'rgba(255, 255, 255, 0.9)' 
              : 'transparent',
            color: location.pathname === '/' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: isMobile ? '8px' : '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: isMobile ? '11px' : isTablet ? '12px' : '14px',
            transition: 'all 0.3s ease',
            boxShadow: location.pathname === '/' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
          }}
        >
          🏠 Home
        </button>
        <button 
          onClick={() => navigate('/chat')}
          style={{
            padding: isMobile ? '6px 12px' : isTablet ? '8px 16px' : '12px 24px',
            background: location.pathname === '/chat' 
              ? 'rgba(255, 255, 255, 0.9)' 
              : 'transparent',
            color: location.pathname === '/chat' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: isMobile ? '8px' : '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: isMobile ? '11px' : isTablet ? '12px' : '14px',
            transition: 'all 0.3s ease',
            boxShadow: location.pathname === '/chat' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
          }}
        >
          💬 Chat
        </button>
      </div>
    </nav>
  ), [location.pathname, isMobile, isTablet, navigate])

  const handleOpenChat = () => {
    navigate('/chat')
  }

  return (
    <div style={{ 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      color: '#1f2937',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite',
        zIndex: 0
      }}></div>

      <style>
        {`
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
          
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
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
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            33% {
              transform: translateY(-20px) rotate(120deg);
            }
            66% {
              transform: translateY(10px) rotate(240deg);
            }
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
          
          .slide-in-left {
            animation: slideInLeft 0.6s ease-out;
          }
          
          .slide-in-right {
            animation: slideInRight 0.6s ease-out;
          }
          
          .scale-in {
            animation: scaleIn 0.6s ease-out;
          }
          
          .pulse {
            animation: pulse 2s infinite;
          }
          
          .float {
            animation: float 6s ease-in-out infinite;
          }
          
          .shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite;
          }
          
          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          }
          
          /* Focus styles */
          *:focus {
            outline: none;
          }
          
          /* Selection styles */
          ::selection {
            background: rgba(102, 126, 234, 0.2);
            color: #1f2937;
          }
          
          /* Button hover effects */
          button:hover {
            transform: translateY(-2px);
            transition: transform 0.3s ease;
          }
          
          /* Input focus effects */
          input:focus, select:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          }
          
          /* Glass morphism effect */
          .glass {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }
          
          /* Gradient text */
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
                     /* Hover lift effect */
           .hover-lift {
             transition: all 0.3s ease;
           }
           
           .hover-lift:hover {
             transform: translateY(-4px);
             box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
           }
           
                       /* Responsive layout fixes */
            @media (max-width: 1365px) {
              .main-content {
                margin-top: 24px !important;
                padding-top: 24px !important;
              }
            }
            
            @media (max-width: 767px) {
              .main-content {
                margin-top: 20px !important;
                padding-top: 20px !important;
              }
            }
            
            /* Ensure content is never hidden behind fixed navbar */
            .content-wrapper {
              position: relative;
              z-index: 10;
            }
            
            /* Fixed navbar height compensation */
            .navbar-compensated {
              margin-top: 76px;
            }
            
            @media (max-width: 1365px) {
              .navbar-compensated {
                margin-top: 68px;
              }
            }
            
            @media (max-width: 767px) {
              .navbar-compensated {
                margin-top: 60px;
              }
            }
         `}
      </style>
      {Nav}
               <div 
           className={`main-content content-wrapper navbar-compensated`}
           style={{ 
             flex: 1,
             padding: location.pathname === '/' ? '0' : (isMobile ? '12px' : isTablet ? '16px' : '24px'),
             maxWidth: location.pathname === '/' ? '100%' : (isMobile ? '100%' : isTablet ? '100%' : '1200px'),
             margin: location.pathname === '/' ? '0' : '0 auto',
             width: '100%',
             position: 'relative',
             zIndex: 10,
             marginTop: location.pathname === '/' ? '0' : (isMobile ? '20px' : isTablet ? '24px' : '32px'),
             paddingTop: location.pathname === '/' ? '0' : (isMobile ? '20px' : isTablet ? '24px' : '32px'),
             boxSizing: 'border-box',
             overflow: 'hidden'
           }}
         >
        <Routes>
          <Route path="/" element={<HomePage onOpenChat={handleOpenChat} />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="*" element={<HomePage onOpenChat={handleOpenChat} />} />
        </Routes>
      </div>
    </div>
  )
}


