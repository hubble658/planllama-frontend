function ProjectCard({ project, role, members = [], onEdit, onDelete, onClick }) {
  const progress = project.tasksCount > 0 ? (project.completedTasks / project.tasksCount) * 100 : 0

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'primary'
      case 'Planning': return 'warning'
      case 'Completed': return 'success'
      case 'On Hold': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusBorderColor = (status) => {
    switch(status) {
      case 'Completed': return 'var(--success-color)'
      case 'In Progress': return 'var(--primary-color)'
      case 'Planning': return 'var(--warning-color)'
      case 'On Hold': return '#6c757d'
      default: return '#6c757d'
    }
  }

  const getProgressBarClass = () => {
    if (progress >= 100) return 'bg-success' // completed
    if (progress >= 70) return 'bg-primary' // good progress
    if (progress >= 40) return 'bg-warning' // moderate progress
    if (progress > 0) return 'bg-warning' // just started
    return 'bg-secondary' // not started
  }

  const handleCardClick = (e) => {
    // Eğer butonlara tıklanmadıysa, kart tıklamasını işle
    if (!e.target.closest('button')) {
      onClick()
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(project)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(project.project_id)
  }

  return (
      <div
          className="project-card"
          onClick={handleCardClick}
          style={{ 
            cursor: 'pointer',
            borderLeft: `8px solid ${getStatusBorderColor(project.status)}`
          }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0">{project.name}</h6>
          <span className={`badge bg-${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        </div>

        <p className="text-muted small mb-3">{project.description}</p>

        <div className="mb-2">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Progress</span>
            <span>{project.completedTasks}/{project.tasksCount} tasks</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
                className={`progress-bar ${getProgressBarClass()}`}
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
            ></div>
          </div>
        </div>

        {/* Project Members */}
        {members.length > 0 && (
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <div className="d-flex" style={{ marginLeft: '-5px' }}>
                {members.slice(0, 4).map((member, index) => (
                  <div
                    key={member.employee_id}
                    className="position-relative"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                    title={`${member.name} - ${member.role}`}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: member.user_role === 'pm' ? '#0d6efd' : '#198754',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        border: '2px solid white',
                        cursor: 'pointer'
                      }}
                    >
                      {member.avatar}
                    </div>
                  </div>
                ))}
                {members.length > 4 && (
                  <div
                    className="position-relative"
                    style={{ marginLeft: '-8px' }}
                    title={`+${members.length - 4} more members`}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        border: '2px solid white'
                      }}
                    >
                      +{members.length - 4}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-muted ms-2 small">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
            Due: {project.dueDate}
          </div>

          {role === 'pm' && (
              <div className="btn-group btn-group-sm">
                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleEdit}
                    title="Edit Project"
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                  </svg>
                </button>
                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDelete}
                    title="Delete Project"
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
          )}
        </div>
      </div>
  )
}

export default ProjectCard