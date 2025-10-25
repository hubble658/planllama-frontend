function TaskCard({ task, role, onEdit, onDelete, onUpdateStatus }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success'
      case 'In Progress': return 'primary'
      case 'Pending': return 'warning'
      default: return 'secondary'
    }
  }

  const getPriorityClass = (priority) => {
    return `priority-${priority}`
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'success'
      case 'critical': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusBorderColor = (status) => {
    switch(status) {
      case 'Completed': return 'var(--success-color)'
      case 'In Progress': return 'var(--primary-color)'
      case 'Pending': return 'var(--warning-color)'
      case 'Blocked': return 'var(--danger-color)'
      default: return '#6c757d'
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.task_id)
    }
  }

  const handleUpdateStatus = () => {
    if (onUpdateStatus) {
      onUpdateStatus(task)
    }
  }

  return (
    <div 
      className={`task-card ${getPriorityClass(task.priority)}`}
      style={{ borderLeft: `8px solid ${getStatusBorderColor(task.status)}` }}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-1 flex-grow-1">{task.title}</h6>
        <span className={`badge bg-${getStatusColor(task.status)} ms-2`}>
          {task.status}
        </span>
      </div>
      
      <p className="text-muted small mb-3">{task.description}</p>
      
      <div className="mb-2">
        <div className="small text-muted mb-1">
          <strong>Project:</strong> {task.project}
        </div>
        <div className="small text-muted mb-1">
          <strong>Assignee:</strong> {task.assignee}
        </div>
        <div className="small text-muted">
          <strong>Due:</strong> {task.dueDate}
        </div>
      </div>

      <div className="mb-3">
        <span className={`badge bg-${getPriorityColor(task.priority)}`}>
          {task.priority} priority
        </span>
      </div>
      
      {role === 'executor' && (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={handleUpdateStatus}
          >
            Update Status
          </button>
        </div>
      )}
      
      {role === 'pm' && (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button 
            className="btn btn-sm btn-outline-danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskCard
