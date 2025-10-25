import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TaskList from "../components/TaskList"
import ProjectModal from '../components/ProjectModal'
import api from '../services/api' 
import logo from '../../src/assets/logo.ico'
import AnalyzeModal from '../components/AnalyzeModal'

function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  // State
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([]) // 👈 Yeni state: Görev verisini saklamak için
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState(null)
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false)

  // Load project data on mount
  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      setError(null)

      // Convert URL projectId (e.g., 1) to API format (e.g., p01)
      const apiProjectId = `p${String(projectId).padStart(2, '0')}`

      // 1. Proje detayları ve üyeleri al (Gerekirse include_tasks: true da kullanılabilir,
      //    ama burada tasks için ayrı çağrı yapıyoruz.)
      const [projectData, membersData] = await Promise.all([
        api.getProject(apiProjectId, { include_tasks: false }),
        api.getProjectMembers(apiProjectId)
      ])

      // 2. Görevleri ayrı bir API çağrısı ile al
      // Endpoint: /api/tasks/by-project/<project_id>?enrich=true
      const tasksResponse = await api.getTasksByProject(apiProjectId, { enrich: true })

      setProject(projectData)
      setMembers(membersData)
      setTasks(tasksResponse.tasks || []) // 👈 Görevleri state'e kaydet

    } catch (err) {
      console.error('Error loading project:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress
  // tasksCount ve completedTasks alanları hala projectData'dan geliyor olmalı.
  const progress = project && project.tasksCount > 0
      ? Math.round((project.completedTasks / project.tasksCount) * 100)
      : 0

  // Progress'e göre renk belirle
  const getProgressBarClass = () => {
    if (progress >= 100) return 'bg-success'
    if (progress >= 70) return 'bg-primary'
    if (progress >= 40) return 'bg-warning'
    if (progress > 0) return 'bg-warning'
    return 'bg-secondary'
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success'
      case 'In Progress': return 'primary'
      case 'Planning': return 'warning'
      default: return 'secondary'
    }
  }

  // Edit project handler
  const handleEditProject = () => {
    setShowModal(true)
  }

  const handleSaveProject = async (updatedProject) => {
    try {
      await api.updateProject(project.project_id, updatedProject)
      await loadProject() // Reload project data
      setShowModal(false)
    } catch (err) {
      console.error('Error updating project:', err)
      alert(`Error updating project: ${err.message}`)
    }
  }

  const handleAnalyzeProject = async () => {
  if (!project) return
  // open streaming modal which will call the analyze endpoint
  setShowAnalyzeModal(true)
  }

  if (loading) {
    return (
        <div className="container-fluid py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading project...</p>
          </div>
        </div>
    )
  }

  if (error || !project) {
    return (
        <div className="container-fluid py-4">
          <div className="alert alert-warning">
            <h5>Project not found!</h5>
            <p>{error || 'The requested project could not be found.'}</p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
    )
  }

  return (
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h3 className="mb-0">{project.name}</h3>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title">Project Details</h5>
                    <p className="text-muted mb-0">{project.description}</p>
                  </div>
                  <span className={`badge bg-${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Progress</span>
                    <span className="fw-bold">{progress}%</span>
                  </div>

                  <div className="progress" style={{ height: '12px' }}>
                    <div
                        className={`progress-bar ${getProgressBarClass()}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Created At</h6>
                    <p>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Due Date</h6>
                    <p>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Budget</h6>
                    <p>${project.budget ? project.budget.toLocaleString() : '0'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Priority</h6>
                    <span className={`badge bg-${project.priority === 'critical' ? 'danger' : project.priority === 'high' ? 'warning' : 'info'}`}>
                    {project.priority ? project.priority.toUpperCase() : 'MEDIUM'}
                  </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task listesi */}
            <div className="card shadow-sm">
              <div className="card-body">
                <TaskList
                    role="pm"
                    project={project.name}
                    tasks={tasks} // 👈 Görevleri TaskList'e prop olarak gönder
                    onDataChange={loadProject}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Team Members</h5>
                {members.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {members.map((member) => (
                          <div key={member.employee_id} className="d-flex align-items-center">
                            <div
                                className="text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  fontSize: '14px',
                                  backgroundColor: member.user_role === 'pm' ? '#0d6efd' : '#198754'
                                }}
                                title={member.role}
                            >
                              {member.avatar}
                            </div>
                            <div>
                              <div>{member.name}</div>
                              <small className="text-muted">{member.role}</small>
                            </div>
                          </div>
                      ))}
                    </div>
                ) : (
                    <p className="text-muted">No team members assigned yet.</p>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Actions</h5>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-primary" onClick={handleEditProject}>
                    Edit Project
                  </button>
                  <button className="btn btn-outline-secondary" disabled>
                    Add Member
                  </button>
                  <button
                      className="btn btn-outline-info d-flex align-items-center"
                      onClick={handleAnalyzeProject}
                      disabled={analyzing}
                  >
                    <img src={logo} alt="LLaMa" style={{ width: 18, height: 18, marginRight: 8 }} />
                    {analyzing ? 'Analyzing...' : 'Analyze with LLaMa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Modal */}
        <ProjectModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveProject}
            project={project}
        />
    <AnalyzeModal
      show={showAnalyzeModal}
      onClose={() => setShowAnalyzeModal(false)}
      projectId={project.project_id}
      project={project}
      tasks={tasks}
    />
      </div>
  )
}

export default ProjectPage