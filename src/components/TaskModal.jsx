import { useState, useEffect } from 'react'
import MarkdownEditor from './MarkdownEditor'
import { useEmployee } from '../context/EmployeeContext'
import api from '../services/api'

function TaskModal({ show, onClose, onSave, task = null, projectName = null, role = 'pm' }) {
    const { currentEmployee } = useEmployee()
    const isExecutor = role === 'executor'
    
    // State for dropdowns
    const [executors, setExecutors] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'medium',
        project: projectName || '',
        assignee: '',
        dueDate: '',
        estimatedHours: ''
    })

    // Load dropdown data
    useEffect(() => {
        if (show) {
            loadDropdownData()
        }
    }, [show])

    const loadDropdownData = async () => {
        try {
            setLoading(true)
            const [executorsData, projectsData] = await Promise.all([
                api.getEmployees('executor'),
                api.getProjects()
            ])
            setExecutors(executorsData)
            setProjects(projectsData)
        } catch (err) {
            console.error('Error loading dropdown data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: task.project,
                assignee: task.assignee,
                dueDate: task.dueDate,
                estimatedHours: task.estimatedHours
            })
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'Pending',
                priority: 'medium',
                project: projectName || '',
                assignee: '',
                dueDate: '',
                estimatedHours: ''
            })
        }
    }, [task, projectName, show])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Get employee and project IDs from names
        const selectedEmployee = executors.find(emp => emp.name === formData.assignee)
        const selectedProject = projects.find(proj => proj.name === formData.project)

        const taskData = {
            task_id: task?.task_id || `t${String(Date.now()).slice(-8)}`,
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            assignee_id: selectedEmployee?.employee_id || task?.assignee_id,
            project_id: selectedProject?.project_id || task?.project_id,
            estimatedHours: parseFloat(formData.estimatedHours) || 0,
            dueDate: formData.dueDate
        }

        onSave(taskData)
    }

    if (!show) return null

    return (
        <>
            {/* Bootstrap Modal Backdrop */}
            <div className="modal-backdrop fade show" onClick={onClose}></div>

            {/* Bootstrap Modal */}
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {isExecutor ? 'Update Task Status' : (task ? 'Edit Task' : 'Create New Task')}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : isExecutor ? (
                                    // Executor görünümü - sadece önemli bilgiler ve status
                                    <>
                                        <div className="mb-3">
                                            <h5>{formData.title}</h5>
                                            <p className="text-muted">{formData.description || 'No description'}</p>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Project</label>
                                                <p className="form-control-plaintext">{formData.project}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Priority</label>
                                                <p className="form-control-plaintext">
                                                    <span className={`badge bg-${formData.priority === 'critical' ? 'danger' : formData.priority === 'high' ? 'warning' : formData.priority === 'medium' ? 'info' : 'success'}`}>
                                                        {formData.priority.toUpperCase()}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Due Date</label>
                                                <p className="form-control-plaintext">{formData.dueDate}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Estimated Hours</label>
                                                <p className="form-control-plaintext">{formData.estimatedHours || 'Not set'}</p>
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <div className="mb-3">
                                            <label htmlFor="status" className="form-label">Update Status *</label>
                                            <select
                                                className="form-select form-select-lg"
                                                id="status"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Blocked">Blocked</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    // PM görünümü - tüm alanlar
                                    <>
                                        <div className="mb-3">
                                            <label htmlFor="title" className="form-label">Task Title *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="e.g., Design homepage mockup"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label">Description</label>
                                            <div style={{ minHeight: '150px' }}>
                                                <MarkdownEditor
                                                    value={formData.description}
                                                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                                    placeholder="Describe the task requirements..."
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="project" className="form-label">Project *</label>
                                                <select
                                                    className="form-select"
                                                    id="project"
                                                    name="project"
                                                    value={formData.project}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={projectName !== null}
                                                >
                                                    <option value="">Select a project</option>
                                                    {projects.map(project => (
                                                        <option key={project.project_id} value={project.name}>
                                                            {project.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="status" className="form-label">Status</label>
                                                <select
                                                    className="form-select"
                                                    id="status"
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Blocked">Blocked</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="priority" className="form-label">Priority</label>
                                                <select
                                                    className="form-select"
                                                    id="priority"
                                                    name="priority"
                                                    value={formData.priority}
                                                    onChange={handleChange}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="estimatedHours" className="form-label">Estimated Hours</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="estimatedHours"
                                                    name="estimatedHours"
                                                    value={formData.estimatedHours}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 8"
                                                    min="0"
                                                    max="1000"
                                                    step="0.5"
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="assignee" className="form-label">Assignee</label>
                                                <select
                                                    className="form-select"
                                                    id="assignee"
                                                    name="assignee"
                                                    value={formData.assignee}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select an assignee</option>
                                                    {executors.map(executor => (
                                                        <option key={executor.employee_id} value={executor.name}>
                                                            {executor.name} - {executor.role}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="dueDate" className="form-label">Due Date *</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="dueDate"
                                                    name="dueDate"
                                                    value={formData.dueDate}
                                                    onChange={handleChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {isExecutor ? 'Update Status' : (task ? 'Update Task' : 'Create Task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TaskModal