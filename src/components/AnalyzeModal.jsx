import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../services/api'

// Prefer a direct LLM endpoint set in Vite env: VITE_LLM_URL
const LLM_URL = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_LLM_URL : undefined

function AnalyzeModal({ show, onClose, projectId }) {
  const [streamText, setStreamText] = useState('')
  const [running, setRunning] = useState(false)
  const controllerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!show) return

    let aborted = false
    const run = async () => {
      setStreamText('')
      setRunning(true)
      controllerRef.current = new AbortController()
      try {
        // If a direct LLM URL is provided (e.g. VITE_LLM_URL), use it.
        // Otherwise fall back to the backend analyze endpoint.
        const targetUrl = LLM_URL ? LLM_URL : `${API_BASE_URL}/projects/${projectId}/analyze`

        if (!targetUrl) {
          setStreamText('Error: No target analyze endpoint configured. Set VITE_LLM_URL or ensure API_BASE_URL is available.')
          setRunning(false)
          return
        }

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // We send project_id and request streaming; LLM endpoint should accept this or adapt.
          body: JSON.stringify({ project_id: projectId, stream: true }),
          signal: controllerRef.current.signal,
        })

        if (!res.ok) {
          const txt = await res.text()
          setStreamText(`Error: ${txt || res.statusText}`)
          setRunning(false)
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          setStreamText(prev => prev + chunk)
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          setStreamText(prev => prev + '\n[Stream aborted]')
        } else {
          setStreamText(prev => prev + `\n\n[Error] ${e.message}`)
        }
      } finally {
        setRunning(false)
      }
    }

    run()

    return () => {
      aborted = true
      if (controllerRef.current) controllerRef.current.abort()
    }
  }, [show, projectId])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [streamText])

  if (!show) return null

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Analyze with LLaMa</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => { if (controllerRef.current) controllerRef.current.abort(); onClose() }}></button>
          </div>
          <div className="modal-body">
            <div ref={containerRef} style={{ maxHeight: '50vh', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {streamText || (running ? 'Starting analysis...' : 'No output')}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { if (controllerRef.current) controllerRef.current.abort(); onClose() }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyzeModal
