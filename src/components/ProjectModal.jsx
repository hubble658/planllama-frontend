import { useState, useEffect } from 'react'

function ProjectModal({ show, onClose, onSave, project = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    dueDate: ''
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        dueDate: project.dueDate
      })
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Planning',
        dueDate: ''
      })
    }
  }, [project, show])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newProject = {
      project_id: project ? project.project_id : `p${Date.now()}`,
      ...formData,
      tasksCount: project ? project.tasksCount : 0,
      completedTasks: project ? project.completedTasks : 0,
      budget: project ? project.budget : 0,
      priority: project ? project.priority : 'medium',
      createdAt: project ? project.createdAt : new Date().toISOString().split('T')[0]
    }
    
    onSave(newProject)
    onClose()
  }

  if (!show) return null

  return (
    <>
      {/* Bootstrap Modal Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      
      {/* Bootstrap Modal */}
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {project ? 'Edit Project' : 'Create New Project'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter project name"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter project description"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status *</label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="dueDate" className="form-label">Due Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {project ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectModal
