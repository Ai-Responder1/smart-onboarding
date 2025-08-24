import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const UploadPage: React.FC = () => {
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileList | null>(null)
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(e.dataTransfer.files)
    }
  }

  const validateFiles = (fileList: FileList | null): string[] => {
    if (!fileList) return []
    
    const errors: string[] = []
    Array.from(fileList).forEach((file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        errors.push(`${file.name}: Only PDF files are allowed`)
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File exceeds 10MB limit`)
      }
    })
    return errors
  }

  const submit = async () => {
    if (!files || files.length === 0) return
    
    const validationErrors = validateFiles(files)
    if (validationErrors.length > 0) {
      setResult(validationErrors.join('\n'))
      return
    }
    
    setLoading(true)
    setResult('')
    
    try {
      const form = new FormData()
      Array.from(files).forEach((f: File) => form.append('files', f))
      
      const res = await axios.post(`${API_BASE}/api/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (res.data.success) {
        setResult(`✅ Successfully indexed ${res.data.files_indexed} files!\n\n${JSON.stringify(res.data, null, 2)}`)
      } else {
        setResult(`❌ Upload failed: ${res.data.message}\n\n${JSON.stringify(res.data, null, 2)}`)
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || 'Upload failed - network error'
      setResult(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const clearFiles = () => {
    setFiles(null)
    setResult('')
  }

  return (
    <div style={{ 
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white',
          fontWeight: 'bold',
          margin: '0 auto 24px auto',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
        }}>
          KB
        </div>
        <h1 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '32px',
          fontWeight: '800',
          color: '#1f2937',
          letterSpacing: '-0.5px'
        }}>
          Karbon Business Document Center
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: '18px',
          color: '#6b7280',
          lineHeight: '1.6',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Upload PDF documents to enhance the AI chatbot's knowledge base. 
          Your documents will be securely processed and indexed for intelligent conversations.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `3px dashed ${dragActive ? '#667eea' : '#d1d5db'}`,
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          background: dragActive 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' 
            : 'white',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: dragActive 
            ? '0 20px 40px rgba(102, 126, 234, 0.15)' 
            : '0 20px 40px rgba(0, 0, 0, 0.08)',
          borderColor: dragActive ? '#667eea' : '#d1d5db',
          transform: dragActive ? 'scale(1.02)' : 'scale(1)'
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div style={{ 
          fontSize: '64px', 
          marginBottom: '24px',
          filter: dragActive ? 'drop-shadow(0 8px 16px rgba(102, 126, 234, 0.3))' : 'none',
          transition: 'all 0.3s ease'
        }}>
          {dragActive ? '📤' : '📄'}
        </div>
        <h2 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '24px', 
          fontWeight: '700',
          color: dragActive ? '#667eea' : '#374151',
          transition: 'color 0.3s ease'
        }}>
          {dragActive ? 'Drop your files here!' : 'Drag & drop PDF files here'}
        </h2>
        <p style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px', 
          color: '#6b7280',
          transition: 'color 0.3s ease'
        }}>
          or click to browse files
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#9ca3af',
          fontWeight: '500'
        }}>
          Maximum file size: 10MB per file
        </p>
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          multiple
          onChange={e => setFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* File List */}
      {files && (
        <div style={{ 
          background: 'white',
          padding: '32px', 
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          marginTop: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f3f4f6'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white'
            }}>
              📋
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                Selected Files
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {Array.from(files).length} file{Array.from(files).length !== 1 ? 's' : ''} ready for upload
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from(files).map((file: File, index: number) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: file.name.toLowerCase().endsWith('.pdf') 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    {file.name.toLowerCase().endsWith('.pdf') ? '📄' : '❌'}
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '16px',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {file.name}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280'
                    }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    color: file.name.toLowerCase().endsWith('.pdf') ? '#059669' : '#dc2626',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '6px 12px',
                    background: file.name.toLowerCase().endsWith('.pdf') 
                      ? '#d1fae5' 
                      : '#fef2f2',
                    borderRadius: '20px',
                    border: `1px solid ${file.name.toLowerCase().endsWith('.pdf') ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {file.name.toLowerCase().endsWith('.pdf') ? '✓ Valid PDF' : '✗ Invalid File'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {validateFiles(files).length > 0 && (
            <div style={{ 
              marginTop: '24px', 
              padding: '20px', 
              background: '#fef2f2', 
              color: '#dc2626',
              borderRadius: '16px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <strong style={{ fontSize: '16px' }}>Validation Errors</strong>
              </div>
              <ul style={{ 
                margin: '0 0 0 0', 
                paddingLeft: '32px',
                lineHeight: '1.6'
              }}>
                {validateFiles(files).map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'center',
        marginTop: '32px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={submit} 
          disabled={loading || !files || files.length === 0 || validateFiles(files).length > 0}
          style={{
            padding: '18px 36px',
            background: loading || !files || files.length === 0 || validateFiles(files).length > 0 
              ? '#d1d5db' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: loading || !files || files.length === 0 || validateFiles(files).length > 0 
              ? 'not-allowed' 
              : 'pointer',
            fontSize: '18px',
            fontWeight: '700',
            transition: 'all 0.3s ease',
            boxShadow: loading || !files || files.length === 0 || validateFiles(files).length > 0 
              ? 'none' 
              : '0 20px 40px rgba(102, 126, 234, 0.3)',
            minWidth: '200px'
          }}
          onMouseEnter={(e) => {
            if (!loading && files && files.length > 0 && validateFiles(files).length === 0) {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && files && files.length > 0 && validateFiles(files).length === 0) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)'
            }
          }}
        >
          {loading ? '⏳ Processing...' : '🚀 Upload & Index'}
        </button>
        
        {files && (
          <button 
            onClick={clearFiles}
            style={{
              padding: '18px 36px',
              background: 'white',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              minWidth: '160px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            🗑️ Clear Files
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div style={{ 
          background: result.includes('✅') 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)' 
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)', 
          padding: '32px', 
          borderRadius: '20px',
          border: `2px solid ${result.includes('✅') ? '#10b981' : '#ef4444'}`,
          whiteSpace: 'pre-wrap',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          marginTop: '32px',
          boxShadow: `0 20px 40px ${result.includes('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            fontSize: '24px'
          }}>
            {result.includes('✅') ? '🎉' : '❌'}
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
            color: result.includes('✅') ? '#059669' : '#dc2626'
          }}>
            {result.includes('✅') ? 'Upload Successful!' : 'Upload Failed'}
          </div>
          <div style={{
            color: result.includes('✅') ? '#047857' : '#b91c1c',
            fontSize: '13px',
            lineHeight: '1.8'
          }}>
            {result}
          </div>
        </div>
      )}
      
      {/* Floating Home Icon */}
      <div
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          animation: 'pulse 2s infinite'
        }}
        className="hover-lift"
        title="Click to go to Home page"
      >
        🏠
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          
          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>
    </div>
  )
}


