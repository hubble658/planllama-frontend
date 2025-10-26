import { useState } from 'react'
import TaskModal from './TaskModal'
import TaskDetailModal from './TaskDetailModal'
import api from '../services/api'

// Simple table/list style TaskList (Slack/Jira-like)
function TaskList({ role, tasks = [], project = null, onDataChange, viewMode = 'list' }) {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const handleNewTask = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setShowDetailModal(true)
  }

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await api.updateTask(taskData.task_id, taskData)
      } else {
        await api.createTask(taskData)
      }
      if (onDataChange) onDataChange()
      setShowModal(false)
      setEditingTask(null)
    } catch (err) {
      console.error('Error saving task:', err)
      alert(`Error saving task: ${err.message}`)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.deleteTask(taskId)
      if (onDataChange) onDataChange()
    } catch (err) {
      console.error('Error deleting task:', err)
      alert(`Error deleting task: ${err.message}`)
    }
  }

  if (project && tasks.length === 0) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Tasks</h5>
          {role === 'pm' && <button className="btn btn-primary btn-sm" onClick={handleNewTask}>+ New Task</button>}
        </div>
        <div className="alert alert-info">No tasks found for this project.</div>
        <TaskModal show={showModal} onClose={() => { setShowModal(false); setEditingTask(null) }} onSave={handleSaveTask} task={editingTask} projectName={project} role={role} />
        <TaskDetailModal show={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedTask(null) }} task={selectedTask} />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{project ? `Tasks for ${project}` : (role === 'pm' ? ' ' : 'My Tasks')}</h5>
        <div className="d-flex gap-2">
          {role === 'pm' && <button className="btn btn-primary btn-sm" onClick={handleNewTask}>+ New Task</button>}
        </div>
      </div>

      {(!tasks || tasks.length === 0) ? (
        <div className="alert alert-info">No tasks found.</div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            // Grid/Card View
            <div className="row g-3">
              {tasks.map(task => (
                <div key={task.task_id} className="col-md-6 col-lg-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0">{task.title}</h6>
                        <span className={`badge bg-${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'primary' : 'warning'}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          📁 {task.project || '—'}
                        </small>
                        <small className="text-muted d-block mb-1">
                          👤 {task.assignee_name || task.assignee || 'Unassigned'}
                        </small>
                        <small className="text-muted d-block">
                          📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </small>
                      </div>

                      <div className="d-flex gap-2 mt-auto">
                        <button 
                          className="btn btn-sm btn-outline-info" 
                          onClick={() => handleViewTask(task)}
                          title="View Details"
                        >
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                          </svg>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary flex-grow-1" 
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </button>
                        {role === 'pm' && (
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => handleDeleteTask(task.task_id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table/List View
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Title</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.task_id}>
                      <td style={{maxWidth: 200}} className="text-truncate">{task.project || '—'}</td>
                      <td style={{maxWidth: 400}} className="text-truncate">{task.title}</td>
                      <td>{task.assignee_name || task.assignee || 'Unassigned'}</td>
                      <td>
                        <span className={`badge bg-${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'primary' : 'warning'}`}>{task.status}</span>
                      </td>
                      <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => handleViewTask(task)}
                            title="View Details"
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                            </svg>
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditTask(task)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTask(task.task_id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <TaskModal show={showModal} onClose={() => { setShowModal(false); setEditingTask(null) }} onSave={handleSaveTask} task={editingTask} projectName={project} role={role} />
      <TaskDetailModal show={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedTask(null) }} task={selectedTask} />
    </div>
  )
}

export default TaskList