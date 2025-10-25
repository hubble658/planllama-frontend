import { useState } from 'react'
import TaskModal from './TaskModal'
import api from '../services/api'

// Simple table/list style TaskList (Slack/Jira-like)
function TaskList({ role, tasks = [], project = null, onDataChange }) {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const handleNewTask = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
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
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{project ? `Tasks for ${project}` : (role === 'pm' ? 'All Tasks' : 'My Tasks')}</h5>
        <div className="d-flex gap-2">
          {role === 'pm' && <button className="btn btn-primary btn-sm" onClick={handleNewTask}>+ New Task</button>}
        </div>
      </div>

      {(!tasks || tasks.length === 0) ? (
        <div className="alert alert-info">No tasks found.</div>
      ) : (
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

      <TaskModal show={showModal} onClose={() => { setShowModal(false); setEditingTask(null) }} onSave={handleSaveTask} task={editingTask} projectName={project} role={role} />
    </div>
  )
}

export default TaskList