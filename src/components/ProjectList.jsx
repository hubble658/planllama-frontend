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

      <div className="row">
        {projects.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              No projects yet. Click "New Project" to create one!
            </div>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.project_id} className="col-md-6 col-lg-4 mb-3">
              <ProjectCard
                project={project}
                role={role}
                members={[]}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onClick={() => handleClick(project)}
              />
            </div>
          ))
        )}
      </div>

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