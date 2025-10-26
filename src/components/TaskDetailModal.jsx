function TaskDetailModal({ show, onClose, task }) {
  if (!show || !task) return null

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success'
      case 'In Progress': return 'primary'
      case 'Pending': return 'warning'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'secondary'
      default: return 'info'
    }
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div className="flex-grow-1">
              <h5 className="modal-title mb-1">{task.title}</h5>
              <small className="text-muted">{task.task_id}</small>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Status & Priority */}
            <div className="d-flex gap-2 mb-4">
              <span className={`badge bg-${getStatusColor(task.status)} px-3 py-2`}>
                {task.status}
              </span>
              {task.priority && (
                <span className={`badge bg-${getPriorityColor(task.priority)} px-3 py-2`}>
                  Priority: {task.priority.toUpperCase()}
                </span>
              )}
            </div>

            {/* Main Info */}
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-2">📁 Project</h6>
                <p className="mb-0">{task.project || 'No project assigned'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-2">👤 Assignee</h6>
                <p className="mb-0">{task.assignee_name || task.assignee || 'Unassigned'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-2">📅 Due Date</h6>
                <p className="mb-0">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'No due date'}
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-2">⏱️ Estimated Hours</h6>
                <p className="mb-0">{task.estimated_hours ? `${task.estimated_hours}h` : 'Not estimated'}</p>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="mb-4">
                <h6 className="text-muted mb-2">📝 Description</h6>
                <div className="alert alert-light">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {task.description}
                  </p>
                </div>
              </div>
            )}

            {/* Dependencies */}
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted mb-2">🔗 Dependencies</h6>
                <div className="d-flex flex-wrap gap-2">
                  {task.dependencies.map((dep, idx) => (
                    <span key={idx} className="badge bg-secondary">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted mb-2">🏷️ Tags</h6>
                <div className="d-flex flex-wrap gap-2">
                  {task.tags.map((tag, idx) => (
                    <span key={idx} className="badge bg-info">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-top pt-3 mt-4">
              <div className="row small text-muted">
                {task.createdAt && (
                  <div className="col-md-6">
                    <strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}
                  </div>
                )}
                {task.updatedAt && (
                  <div className="col-md-6">
                    <strong>Updated:</strong> {new Date(task.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailModal

