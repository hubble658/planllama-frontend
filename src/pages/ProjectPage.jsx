import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TaskList from "../components/TaskList"
import ProjectModal from '../components/ProjectModal'
import AddMemberModal from '../components/AddMemberModal'
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
  const [selectedMetric, setSelectedMetric] = useState('progress') // Metrik seçimi
  const [showMetricDropdown, setShowMetricDropdown] = useState(false) // Dropdown açık/kapalı
  const [showAddMemberModal, setShowAddMemberModal] = useState(false) // Add Member modal
  const [activeDetailsTab, setActiveDetailsTab] = useState('overview') // Details tab: overview, team, description

  // Load project data on mount
  useEffect(() => {
    loadProject()
  }, [projectId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMetricDropdown && !event.target.closest('.position-relative')) {
        setShowMetricDropdown(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMetricDropdown])

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

  // Calculate metrics
  const metrics = {
    progress: {
      label: 'Progress',
      value: progress,
      displayValue: `${progress}%`,
      subtitle: `${project?.completedTasks || 0} of ${project?.tasksCount || 0} tasks completed`,
      color: getProgressBarClass()
    },
    teamWorkload: {
      label: 'Team Workload',
      value: members.length > 0 ? Math.round((members.reduce((sum, m) => sum + (m.current_load_hours || 0), 0) / members.reduce((sum, m) => sum + (m.capacity_hours_per_week || 40), 0)) * 100) : 0,
      displayValue: members.length > 0 ? `${Math.round((members.reduce((sum, m) => sum + (m.current_load_hours || 0), 0) / members.reduce((sum, m) => sum + (m.capacity_hours_per_week || 40), 0)) * 100)}%` : '0%',
      subtitle: `${members.length} team members`,
      color: members.length > 0 && (members.reduce((sum, m) => sum + (m.current_load_hours || 0), 0) / members.reduce((sum, m) => sum + (m.capacity_hours_per_week || 40), 0)) * 100 > 85 ? 'bg-danger' : 'bg-success'
    },
    taskCompletion: {
      label: 'Task Completion Rate',
      value: project?.tasksCount > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / project.tasksCount) * 100) : 0,
      displayValue: project?.tasksCount > 0 ? `${Math.round((tasks.filter(t => t.status === 'Completed').length / project.tasksCount) * 100)}%` : '0%',
      subtitle: `${tasks.filter(t => t.status === 'Completed').length} completed, ${tasks.filter(t => t.status === 'In Progress').length} in progress`,
      color: 'bg-info'
    },
    timeRemaining: {
      label: 'Time Remaining',
      value: project?.dueDate ? Math.max(0, Math.round((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0,
      displayValue: project?.dueDate ? `${Math.max(0, Math.round((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24)))} days` : 'No due date',
      subtitle: project?.dueDate 
        ? `Created: ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'} • Due: ${new Date(project.dueDate).toLocaleDateString()}` 
        : project?.createdAt 
          ? `Created: ${new Date(project.createdAt).toLocaleDateString()} • No due date set`
          : 'Set a due date',
      color: project?.dueDate && (new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24) < 7 ? 'bg-danger' : 'bg-primary',
      isTime: true
    }
  }

  const currentMetric = metrics[selectedMetric] || metrics.progress

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

  const handleAddMember = () => {
    setShowAddMemberModal(true)
  }

  const handleMemberAdded = async (employee) => {
    // Reload project to get updated member list
    await loadProject()
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
                  <h5 className="card-title">Project Details</h5>
                  <span className={`badge bg-${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeDetailsTab === 'overview' ? 'active' : ''}`}
                      onClick={() => setActiveDetailsTab('overview')}
                    >
                      📊 Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeDetailsTab === 'team' ? 'active' : ''}`}
                      onClick={() => setActiveDetailsTab('team')}
                    >
                      👥 Team ({members.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeDetailsTab === 'description' ? 'active' : ''}`}
                      onClick={() => setActiveDetailsTab('description')}
                    >
                      📝 Description
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Overview Tab */}
                  {activeDetailsTab === 'overview' && (
                    <div>
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span>{currentMetric.label}</span>
                            <div className="position-relative">
                              <button 
                                className="btn btn-sm btn-outline-secondary py-0 px-2" 
                                type="button" 
                                onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                                style={{ fontSize: '0.75rem' }}
                              >
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                </svg>
                              </button>
                              {showMetricDropdown && (
                                <div 
                                  className="position-absolute bg-white border rounded shadow-sm" 
                                  style={{ 
                                    top: '100%', 
                                    left: 0, 
                                    zIndex: 1000, 
                                    minWidth: '200px',
                                    marginTop: '4px'
                                  }}
                                >
                                  <button 
                                    className={`btn btn-sm w-100 text-start ${selectedMetric === 'progress' ? 'btn-primary text-white' : 'btn-light'}`}
                                    onClick={() => {
                                      setSelectedMetric('progress')
                                      setShowMetricDropdown(false)
                                    }}
                                  >
                                    📊 Progress
                                  </button>
                                  <button 
                                    className={`btn btn-sm w-100 text-start ${selectedMetric === 'teamWorkload' ? 'btn-primary text-white' : 'btn-light'}`}
                                    onClick={() => {
                                      setSelectedMetric('teamWorkload')
                                      setShowMetricDropdown(false)
                                    }}
                                  >
                                    👥 Team Workload
                                  </button>
                                  <button 
                                    className={`btn btn-sm w-100 text-start ${selectedMetric === 'taskCompletion' ? 'btn-primary text-white' : 'btn-light'}`}
                                    onClick={() => {
                                      setSelectedMetric('taskCompletion')
                                      setShowMetricDropdown(false)
                                    }}
                                  >
                                    ✅ Task Completion
                                  </button>
                                  <button 
                                    className={`btn btn-sm w-100 text-start ${selectedMetric === 'timeRemaining' ? 'btn-primary text-white' : 'btn-light'}`}
                                    onClick={() => {
                                      setSelectedMetric('timeRemaining')
                                      setShowMetricDropdown(false)
                                    }}
                                  >
                                    ⏰ Time Remaining
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="fw-bold">{currentMetric.displayValue}</span>
                        </div>

                        {!currentMetric.isTime && (
                          <div className="progress" style={{ height: '12px' }}>
                            <div
                                className={`progress-bar ${currentMetric.color}`}
                                style={{ width: `${currentMetric.value}%` }}
                            ></div>
                          </div>
                        )}
                        
                        {currentMetric.isTime && (
                          <div className="alert alert-light py-2 mb-0 mt-2" style={{ fontSize: '0.9rem' }}>
                            {currentMetric.subtitle}
                          </div>
                        )}
                        
                        {!currentMetric.isTime && (
                          <small className="text-muted mt-1 d-block">{currentMetric.subtitle}</small>
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <h6 className="text-muted">Budget</h6>
                          <p className="mb-0">${project.budget ? project.budget.toLocaleString() : '0'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <h6 className="text-muted">Priority</h6>
                          <span className={`badge bg-${project.priority === 'critical' ? 'danger' : project.priority === 'high' ? 'warning' : 'info'}`}>
                            {project.priority ? project.priority.toUpperCase() : 'MEDIUM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Tab */}
                  {activeDetailsTab === 'team' && (
                    <div>
                      {members.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                          {members.map((member) => (
                            <div key={member.employee_id} className="d-flex align-items-center p-3 border rounded">
                              <div
                                className="text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  backgroundColor: member.user_role === 'pm' ? '#0d6efd' : '#198754',
                                  flexShrink: 0
                                }}
                              >
                                {member.avatar}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h6 className="mb-0">{member.name}</h6>
                                    <small className="text-muted">{member.role}</small>
                                  </div>
                                  <span className={`badge ${member.user_role === 'pm' ? 'bg-primary' : 'bg-success'}`}>
                                    {member.user_role === 'pm' ? 'PM' : 'Executor'}
                                  </span>
                                </div>
                                {member.current_load_hours !== undefined && (
                                  <div className="mt-2">
                                    <div className="d-flex justify-content-between small mb-1">
                                      <span className="text-muted">Workload</span>
                                      <span>{((member.current_load_hours / member.capacity_hours_per_week) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                      <div 
                                        className={`progress-bar ${
                                          (member.current_load_hours / member.capacity_hours_per_week * 100) > 85 ? 'bg-danger' : 
                                          (member.current_load_hours / member.capacity_hours_per_week * 100) > 70 ? 'bg-warning' : 
                                          'bg-success'
                                        }`}
                                        style={{ width: `${(member.current_load_hours / member.capacity_hours_per_week * 100).toFixed(0)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          No team members assigned yet. Click "Add Member" to add team members.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description Tab */}
                  {activeDetailsTab === 'description' && (
                    <div>
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">Project Description</h6>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                          {project.description || 'No description provided.'}
                        </p>
                      </div>
                      {project.notes && (
                        <div className="mt-4">
                          <h6 className="text-muted mb-2">Notes</h6>
                          <div className="alert alert-light">
                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                              {project.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Quick Actions</h5>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-primary" onClick={handleEditProject}>
                    Edit Project
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleAddMember}>
                    Add Member
                  </button>
                  <button
                      className="btn btn-outline-info d-flex align-items-center"
                      onClick={handleAnalyzeProject}
                      disabled={analyzing}
                  >
                    <img src={logo} alt="LLaMA" style={{ width: 36, height: 36, marginRight: 8 }} />
                    {analyzing ? 'Analyzing...' : 'Analyze with LLaMA'}
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

        {/* Add Member Modal */}
        <AddMemberModal
          show={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          projectId={project.project_id}
          currentMembers={members}
          onMemberAdded={handleMemberAdded}
        />

        {/* Analyze Modal */}
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