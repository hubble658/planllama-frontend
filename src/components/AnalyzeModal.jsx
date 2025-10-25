import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../services/api'

// Prefer a direct LLM endpoint set in Vite env: VITE_LLM_URL
const LLM_URL = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_LLM_URL : undefined
const IS_DEV = typeof import.meta !== 'undefined' ? import.meta.env?.MODE === 'development' : false

function AnalyzeModal({ show, onClose, projectId, project = null, tasks = [] }) {
  const [streamText, setStreamText] = useState('')
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [streamError, setStreamError] = useState(null)
  const controllerRef = useRef(null)
  const containerRef = useRef(null)
  const runRef = useRef(null)
  const lastTargetRef = useRef(null)
  const startTimeRef = useRef(null)
  const charCountRef = useRef(0)
  const lineCountRef = useRef(0)
  const fullTextRef = useRef('')

  useEffect(() => {
    if (!show) return

    let aborted = false
    const run = async () => {
      // allow external retry
      runRef.current = run
  setStreamText('')
      setRunning(true)
      setFinished(false)
      setStreamError(null)
  startTimeRef.current = Date.now()
  charCountRef.current = 0
  lineCountRef.current = 0
  fullTextRef.current = ''
      lastTargetRef.current = null
      controllerRef.current = new AbortController()
      try {
        // If running in dev and an LLM URL is configured, prefer proxy path (/vllm) to avoid CORS.
        // Otherwise use the LLM_URL directly or fallback to backend analyze endpoint.
        let targetUrl
        if (IS_DEV && LLM_URL) {
          // Vite proxy configured at /vllm -> VITE_LLM_URL
          targetUrl = `/vllm`
        } else if (LLM_URL) {
          targetUrl = LLM_URL
        } else {
          targetUrl = `${API_BASE_URL}/projects/${projectId}/analyze`
        }

        if (!targetUrl) {
          setStreamText('Error: No target analyze endpoint configured. Set VITE_LLM_URL or ensure API_BASE_URL is available.')
          setRunning(false)
          return
        }

        // Build payload similar to the working Python test_data
        const payload = {
          json_input: {
            project_description: project?.description || project?.name || '',
            team: (project && project.team) || {},
            notes: project?.notes || '',
            tasks: tasks.map(t => ({ assignee: t.assignee || t.assignee_name, task: t.title || t.task, status: t.status }))
          },
          project_key: projectId
        }

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controllerRef.current.signal,
        })

        // append a small debug header block to the stream text
        setStreamText(prev => prev + `\n[HTTP ${res.status} - ${res.headers.get('content-type') || 'unknown content-type'}]\n`)

        // remember the target for retry/open
        lastTargetRef.current = targetUrl

        const contentType = res.headers.get('content-type') || ''
        // If the response is HTML (ngrok error page) show a friendly message
        if (contentType.includes('text/html')) {
          const txt = await res.text()
          const snippet = txt.slice(0, 4000)
          setStreamText(`Error: endpoint returned HTML (likely ngrok/error page or offline)\n\n${snippet}`)
          setStreamError('endpoint_returned_html')
          setRunning(false)
          return
        }

        if (!res.ok) {
          const txt = await res.text()
          setStreamText(`Error: ${txt || res.statusText}`)
          setStreamError(txt || res.statusText)
          setRunning(false)
          return
        }

  const reader = res.body && res.body.getReader()
        if (!reader) {
          setStreamText(prev => prev + '\n[No readable stream in response]')
          setRunning(false)
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false

        while (!finished) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Split into lines, keep incomplete last line in buffer
          const parts = buffer.split('\n')
          buffer = parts.pop() || ''

          for (const rawLine of parts) {
            const line = rawLine.trim()
            if (!line) continue

            // SSE-style lines often start with "data: "
            if (line.startsWith('data:')) {
              const jsonStr = line.slice(5).trim()
              lineCountRef.current += 1
              // Some servers send [DONE] as sentinel
              if (jsonStr === '[DONE]') {
                finished = true
                setFinished(true)
                break
              }

              try {
                const data = JSON.parse(jsonStr)
                if (data.text) {
                  // streaming text piece
                  setStreamText(prev => prev + data.text)
                  charCountRef.current += data.text.length
                  fullTextRef.current += data.text
                }
                if (data.done) {
                  finished = true
                  setFinished(true)
                  // compute stats and append summary
                  const elapsed = (Date.now() - startTimeRef.current) / 1000
                  const charCount = charCountRef.current
                  const totalWords = fullTextRef.current.trim() ? fullTextRef.current.trim().split(/\s+/).length : 0
                  const lineCount = lineCountRef.current
                  const speed = elapsed > 0 ? (charCount / elapsed).toFixed(1) : '0'
                  setStreamText(prev => prev + `\n\n----------------------------------------\n✅ Tamamlandı!\n📊 İstatistikler:\n   - Toplam karakter: ${charCount}\n   - Toplam kelime: ${totalWords}\n   - Toplam satır (SSE): ${lineCount}\n   - Süre: ${elapsed.toFixed(2)} saniye\n   - Hız: ${speed} karakter/saniye\n----------------------------------------\n`)
                  break
                }
                if (data.error) {
                  setStreamText(prev => prev + `\n\n[Model error] ${data.error}`)
                  setStreamError(data.error)
                  finished = true
                  break
                }
              } catch (err) {
                // Not JSON — just append raw
                setStreamText(prev => prev + '\n' + jsonStr)
              }
            } else {
              // Fallback: append raw line
              setStreamText(prev => prev + '\n' + line)
              // count fallback as a line
              lineCountRef.current += 1
            }
          }
        }

        // Process any remaining buffer
  if (buffer) {
          const rem = buffer.trim()
          if (rem) {
            if (rem.startsWith('data:')) {
              const jsonStr = rem.slice(5).trim()
              try {
                const data = JSON.parse(jsonStr)
                if (data.text) {
                  setStreamText(prev => prev + data.text)
                  charCountRef.current += data.text.length
                  fullTextRef.current += data.text
                }
                if (data.done) {
                  setFinished(true)
                  const elapsed = (Date.now() - startTimeRef.current) / 1000
                  const charCount = charCountRef.current
                  const totalWords = fullTextRef.current.trim() ? fullTextRef.current.trim().split(/\s+/).length : 0
                  const lineCount = lineCountRef.current
                  const speed = elapsed > 0 ? (charCount / elapsed).toFixed(1) : '0'
                  setStreamText(prev => prev + `\n\n----------------------------------------\n✅ Tamamlandı!\n📊 İstatistikler:\n   - Toplam karakter: ${charCount}\n   - Toplam kelime: ${totalWords}\n   - Toplam satır (SSE): ${lineCount}\n   - Süre: ${elapsed.toFixed(2)} saniye\n   - Hız: ${speed} karakter/saniye\n----------------------------------------\n`)
                }
                if (data.error) setStreamError(data.error)
              } catch (err) {
                setStreamText(prev => prev + '\n' + jsonStr)
              }
            } else {
              setStreamText(prev => prev + '\n' + rem)
            }
          }
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          setStreamText(prev => prev + '\n[Stream aborted]')
          setStreamError('aborted')
        } else {
          setStreamText(prev => prev + `\n\n[Error] ${e.message}`)
          setStreamError(e.message)
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
            <div className="me-auto text-muted small" style={{alignSelf: 'center'}}>
              {running ? 'Streaming...' : finished ? (streamError ? `Finished with error` : 'Finished') : (streamError ? `Error: ${streamError}` : '')}
            </div>
            {streamError && lastTargetRef.current && (
              <div className="me-2">
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {
                  // Open endpoint in new tab
                  const url = lastTargetRef.current.startsWith('/') ? window.location.origin + lastTargetRef.current : lastTargetRef.current
                  window.open(url, '_blank')
                }}>Open Endpoint</button>
                <button className="btn btn-sm btn-primary me-2" onClick={() => {
                  // Retry by re-running the fetch
                  if (runRef.current) runRef.current()
                }}>Retry</button>
              </div>
            )}
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
