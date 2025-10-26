import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import MarkdownEditor from '../components/MarkdownEditor'
import EmployeeSelector from '../components/EmployeeSelector'
import apiService from '../services/api'
import logo from "../assets/logo.ico"; // api.js'den import edilen APIService instance'ı

const NGROK_URL = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_NGROK_URL_2 : undefined
// AI Enhancement Constants
const MODEL = 'ytu-ce-cosmos/Turkish-Llama-8b-DPO-v0.1'
const NUMBER_OF_SHOTS = 3
const TEMPERATURE = 0.7

const USR_PROMPT = `I need you to generate a detailed project description for professional project planning. Analyze the examples below to understand the expected level of detail.
Give only one comprehensive description.

{examples}

─────────────────────────────────────────────────────────────────────────

Now create a comprehensive project description for:

KISA AÇIKLAMA:
{user_input}

DETAYLI AÇIKLAMA:
`

function NewProject() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    project_title: '',
    estimated_time: '',
    metadata: {
      description: '',
      company: '',
      department: '',
      year: new Date().getFullYear(),
      languages: []
    },
    project_description: '',
    possible_solution: ''
  })

  // State'ler burada olmalı: isSubmitting'i ekledik
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [languageInput, setLanguageInput] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceData, setEnhanceData] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAddLanguage = () => {
    if (languageInput.trim() && !formData.metadata.languages.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          languages: [...prev.metadata.languages, languageInput.trim().toLowerCase()]
        }
      }))
      setLanguageInput('')
    }
  }

  const handleRemoveLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        languages: prev.metadata.languages.filter(l => l !== lang)
      }
    }))
  }

  // CSV verilerini yükle
  useEffect(() => {
    loadCSVData()
  }, [])

  const loadCSVData = async () => {
    try {
      const response = await fetch('/project_plan_final_data_turkish_sum.csv')
      const text = await response.text()
      
      const rows = text.split('\n').slice(1)
      const parsed = rows
        .filter(row => row.trim())
        .map(row => {
          const columns = row.split(',')
          return {
            Project_explanation_TR: columns[0] || ''
          }
        })
      
      setEnhanceData(parsed)
    } catch (error) {
      console.error('CSV yükleme hatası:', error)
    }
  }

  // Rastgele örnekler seç
  const getExamples = (n = NUMBER_OF_SHOTS) => {
    if (enhanceData.length === 0) return []
    const k = Math.min(n, enhanceData.length)
    const shuffled = [...enhanceData].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, k)
  }

  // Animasyonlu silme fonksiyonu
  const animateDelete = async (text, speed = 10) => {
    return new Promise((resolve) => {
      let currentLength = text.length
      const interval = setInterval(() => {
        if (currentLength > 0) {
          currentLength -= 1
          setFormData(prev => ({
            ...prev,
            project_description: text.substring(0, currentLength)
          }))
        } else {
          clearInterval(interval)
          resolve()
        }
      }, speed)
    })
  }

  // Animasyonlu yazma fonksiyonu
  const animateType = async (text, speed = 10) => {
    return new Promise((resolve) => {
      let currentLength = 0
      const interval = setInterval(() => {
        if (currentLength < text.length) {
          currentLength += 1
          setFormData(prev => ({
            ...prev,
            project_description: text.substring(0, currentLength)
          }))
        } else {
          clearInterval(interval)
          resolve()
        }
      }, speed)
    })
  }

  // Enhance with AI - Direkt çalışır, modal yok
  const handleEnhanceClick = async () => {
    const currentDescription = formData.project_description.trim()
    
    if (!currentDescription) {
      alert('Lütfen önce bir proje açıklaması girin!')
      return
    }

    if (enhanceData.length === 0) {
      alert('AI örnekleri henüz yüklenmedi, lütfen bekleyin...')
      return
    }

    setIsEnhancing(true)

    try {
      // 1. Mevcut metni animasyonlu olarak sil
      await animateDelete(currentDescription, 5)

      // 2. AI isteği hazırla
      const examples = getExamples(NUMBER_OF_SHOTS)
      let prompt = USR_PROMPT.trim()
      
      examples.forEach((row, idx) => {
        const firstSentence = row.Project_explanation_TR.split('.')[0]
        prompt += `### Example ${idx + 1}\n`
        prompt += `Input: ${firstSentence}\n\n`
        prompt += `Output: ${row.Project_explanation_TR}\n\n---\n\n`
      })

      prompt += `### Now generate for:\nInput: ${currentDescription}\n\nOutput:`

      console.log(`🔄 Enhancing with ${MODEL}...`)

      const targetUrl = `${NGROK_URL}/v1/chat/completions`

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-local-not-needed'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: TEMPERATURE,
          max_tokens: 4000,
          stream: false
        })
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || res.statusText)
      }

      const result = await res.json()
      const enhanced = result.choices?.[0]?.message?.content || ''

      console.log(`✅ Enhanced! Length: ${enhanced.length} chars`)

      // 3. Yeni metni animasyonlu olarak yaz
      await animateType(enhanced, 5)

    } catch (error) {
      console.error('Enhance error:', error)
      alert(`AI zenginleştirme hatası: ${error.message}`)
      // Hata durumunda orijinal metni geri yaz
      await animateType(currentDescription, 5)
    } finally {
      setIsEnhancing(false)
    }
  }

  const generateJSON = () => {
    const projectData = {
      project_title: formData.project_title,
      // index: 1 (Backend ID üretmeli)
      estimated_time: formData.estimated_time,
      metadata: {
        description: formData.metadata.description,
        company: formData.metadata.company,
        department: formData.metadata.department,
        year: parseInt(formData.metadata.year),
        languages: formData.metadata.languages
      },
      project_description: formData.project_description,
      possible_solution: formData.possible_solution,
      team: selectedEmployees, // employee_id dizisi beklenir
      tasks: [] // AI tarafından üretileceği için boş bırakıldı
    }

    return projectData
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Zorunlu alan kontrolü
    if (!formData.project_title || !formData.estimated_time || selectedEmployees.length === 0) {
      alert("Lütfen Proje Başlığı, Tahmini Süre alanlarını doldurun ve en az bir Ekip Üyesi seçin.");
      return;
    }

    const projectJSON = generateJSON();

    setIsSubmitting(true);

    try {
      console.log('Project JSON being sent for AI task generation:', JSON.stringify(projectJSON, null, 2));

      // API'ye göndermek için apiService.createProjectAndTasks metodunu kullan
      const response = await apiService.createProjectAndTasks(projectJSON);

      console.log('Tasks generated and project created successfully:', response);

      if (response.project_id) {
        const projectIndex = response.project_id.replace('p', '');
        alert(`Proje "${response.project.name}" başarıyla oluşturuldu ve ${response.generated_tasks.length} görev üretildi.`);
        // Navigate to the new project's page (absolute path)
        navigate(`/pm/projects/${projectIndex}`, { replace: true });
      } else {
        // API başarılı kod (201) döndürse bile beklenmeyen bir yanıt gelirse
        throw new Error('Proje oluşturulurken beklenmeyen bir yanıt alındı.');
      }

    } catch (error) {
      // APIService'den fırlatılan hatayı (400, 500 vb.) yakala
      console.error('Project Creation Error:', error);
      const errorMessage = error.response?.error || error.message || 'Görevler oluşturulurken bilinmeyen bir hata oluştu.';
      alert(`Hata: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewJSON = () => {
    const projectJSON = generateJSON()
    const jsonString = JSON.stringify(projectJSON, null, 2)

    // Create a modal or new window to show JSON
    const newWindow = window.open('', 'Project JSON', 'width=600,height=800')
    newWindow.document.write(`
      <html>
        <head>
          <title>Project JSON Preview</title>
          <style>
            body { 
              font-family: monospace; 
              padding: 20px; 
              background: #1e1e1e; 
              color: #d4d4d4;
            }
            pre { 
              background: #252526; 
              padding: 20px; 
              border-radius: 5px; 
              overflow: auto;
            }
            button {
              background: #0d6efd;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin-bottom: 10px;
            }
            button:hover {
              background: #0b5ed7;
            }
          </style>
        </head>
        <body>
          <button onclick="navigator.clipboard.writeText(document.querySelector('pre').textContent)">
            Copy to Clipboard
          </button>
          <pre>${jsonString}</pre>
        </body>
      </html>
    `)
  }

  return (
      <div>
        <Header
            title="Create New Project"
            onChangeRole={() => navigate('/')}
        />

        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="card">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <h5 className="mb-3">Basic Information</h5>

                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label">Project Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            name="project_title"
                            value={formData.project_title}
                            onChange={handleChange}
                            placeholder="e.g., PlanLLaMA"
                            required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Estimated Time *</label>
                        <input
                            type="text"
                            className="form-control"
                            name="estimated_time"
                            value={formData.estimated_time}
                            onChange={handleChange}
                            placeholder="e.g., P2D (ISO 8601)"
                            required
                        />
                        <small className="text-muted">ISO 8601 Duration (P2D = 2 days, P1M = 1 month)</small>
                      </div>
                    </div>

                    {/* Metadata */}
                    <h5 className="mb-3 mt-4">Metadata</h5>

                    <div className="mb-3">
                      <label className="form-label">Short Description</label>
                      <input
                          type="text"
                          className="form-control"
                          name="metadata.description"
                          value={formData.metadata.description}
                          onChange={handleChange}
                          placeholder="e.g., Project Management Uygulaması"
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">Company</label>
                        <input
                            type="text"
                            className="form-control"
                            name="metadata.company"
                            value={formData.metadata.company}
                            onChange={handleChange}
                            placeholder="e.g., CodeLLaMA"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Department</label>
                        <input
                            type="text"
                            className="form-control"
                            name="metadata.department"
                            value={formData.metadata.department}
                            onChange={handleChange}
                            placeholder="e.g., AI Software R&D"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Year</label>
                        <input
                            type="number"
                            className="form-control"
                            name="metadata.year"
                            value={formData.metadata.year}
                            onChange={handleChange}
                            min="2020"
                            max="2030"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Languages</label>
                      <div className="input-group mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add language code (e.g., tr, en)"
                            value={languageInput}
                            onChange={(e) => setLanguageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleAddLanguage}
                        >
                          Add
                        </button>
                      </div>
                      <div>
                        {formData.metadata.languages.map(lang => (
                            <span key={lang} className="badge bg-primary me-2 mb-2">
                          {lang}
                              <button
                                  type="button"
                                  className="btn-close btn-close-white ms-2"
                                  style={{ fontSize: '0.6rem' }}
                                  onClick={() => handleRemoveLanguage(lang)}
                              ></button>
                        </span>
                        ))}
                      </div>
                    </div>

                    {/* Project Description */}
                    <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                      <h5 className="mb-0">Project Description *</h5>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleEnhanceClick}
                        disabled={isSubmitting || isEnhancing}
                      >
                        {isEnhancing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <img src={logo} alt="LLaMa" style={{ width: 36, height: 36, marginRight: 8 }} />
                            Enhance with LLaMA
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-muted small">
                      Describe your project in detail. This will be sent to AI to generate tasks.
                      You can also upload a PDF in the future.
                    </p>
                    <div className="mb-4">
                      <MarkdownEditor
                          value={formData.project_description}
                          onChange={(value) => setFormData(prev => ({ ...prev, project_description: value }))}
                          placeholder="Describe the project goals, requirements, and scope..."
                          disabled={isEnhancing}
                      />
                    </div>

                    {/* Possible Solution */}
                    <h5 className="mb-3 mt-4">Possible Solution (Optional)</h5>
                    <p className="text-muted small">
                      Describe potential technical solutions, architecture, or approaches.
                    </p>
                    <div className="mb-4">
                      <MarkdownEditor
                          value={formData.possible_solution}
                          onChange={(value) => setFormData(prev => ({ ...prev, possible_solution: value }))}
                          placeholder="Describe technical approach, architecture, tools to be used..."
                      />
                    </div>

                    {/* Team Members */}
                    <h5 className="mb-3 mt-4">Project Team</h5>
                    <div className="mb-4">
                      <EmployeeSelector
                          selectedEmployees={selectedEmployees}
                          onEmployeesChange={setSelectedEmployees}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-4">
                      <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting} // isSubmitting state'ini kullanarak butonu devre dışı bırak
                      >
                        {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Generating Tasks (AI)...
                            </>
                        ) : 'Create Project & Generate Tasks (AI)'}
                      </button>
                      <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handlePreviewJSON}
                          disabled={isSubmitting}
                      >
                        Preview JSON
                      </button>
                      <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => navigate('/pm')}
                          disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default NewProject
