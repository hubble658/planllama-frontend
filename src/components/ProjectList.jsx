import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import api from '../services/api'

function ProjectList({ role, projects = [], onDataChange }) {
  const navigate = useNavigate()
  
  // Modal state for editing only
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  // useEffect KALDIRILDI - artık props'tan geliyor

  const handleNewProject = () => {
    navigate('/pm/new-project')
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleSaveProject = async (project) => {
    try {
      if (editingProject) {
        await api.updateProject(project.project_id, project)
      }
      
      // Parent'ı güncelle
      if (onDataChange) {
        onDataChange()
      }
      
      setShowModal(false)
      setEditingProject(null)
    } catch (err) {
      console.error('Error saving project:', err)
      alert(`Error saving project: ${err.message}`)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted too.')) {
      try {
        await api.deleteProject(projectId)
        
        // Parent'ı güncelle
        if (onDataChange) {
          onDataChange()
        }
      } catch (err) {
        console.error('Error deleting project:', err)
        alert(`Error deleting project: ${err.message}`)
      }
    }
  }

  const handleClick = (project) => {
    const basePath = role === 'pm' ? '/pm' : '/executor'
    const numericId = project.project_id.replace('p', '').replace(/^0+/, '') || '1'
    navigate(`${basePath}/projects/${numericId}`)
  }

  return (
    <div className="projects-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Projects</h5>
        {role === 'pm' && (
          <button className="btn btn-primary btn-sm" onClick={handleNewProject}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="alert alert-info">No projects yet. Click "New Project" to create one!</div>
      ) : (
        <div className="list-group">
          {projects.map(project => (
            <div key={project.project_id} className="list-group-item d-flex justify-content-between align-items-center">
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => handleClick(project)}>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <strong>{project.name}</strong>
                  </div>
                  <div className="text-muted small">
                    {project.description ? project.description.slice(0, 80) + (project.description.length > 80 ? '...' : '') : ''}
                  </div>
                </div>
                <div className="mt-2 small text-muted">
                  <span className={`badge bg-${project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'primary' : 'warning'} me-2`}>{project.status}</span>
                  <span className="me-2">Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</span>
                  <span>Tasks: {project.tasksCount || 0}</span>
                </div>
              </div>

              <div className="ms-3 d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditProject(project)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProject(project.project_id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal - Only for editing */}
      <ProjectModal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingProject(null)
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />
    </div>
  )
}

export default ProjectList