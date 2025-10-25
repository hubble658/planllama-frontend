import { useState } from 'react'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import api from '../services/api'

function TaskList({ role, tasks = [], project = null, onDataChange }) {
  // ARTIK useEmployee'ye ihtiyaç yok - tasks prop'tan geliyor
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Hangi projelerin açık olduğunu takip et
  const [expandedProjects, setExpandedProjects] = useState({})

  // useEffect KALDIRILDI - artık tasks prop'tan geliyor
  // loadTasks fonksiyonu KALDIRILDI - Dashboard yapıyor

  // Proje açma/kapama toggle fonksiyonu
  const toggleProject = (projectName) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }))
  }

  // Modal functions
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
        // Update existing task
        await api.updateTask(taskData.task_id, taskData)
      } else {
        // Create new task
        await api.createTask(taskData)
      }
      
      // Parent'ı güncelle (Dashboard'ın loadData'sını tetikler)
      if (onDataChange) {
        onDataChange()
      }
      
      setShowModal(false)
      setEditingTask(null)
    } catch (err) {
      console.error('Error saving task:', err)
      alert(`Error saving task: ${err.message}`)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId)
        
        // Parent'ı güncelle
        if (onDataChange) {
          onDataChange()
        }
      } catch (err) {
        console.error('Error deleting task:', err)
        alert(`Error deleting task: ${err.message}`)
      }
    }
  }

  const handleUpdateStatus = (task) => {
    // Executor için task düzenleme (sadece status güncellemesi için de kullanılabilir)
    setEditingTask(task)
    setShowModal(true)
  }

  // Taskları projelere göre grupla
  const groupedTasks = tasks.reduce((groups, task) => {
    const projectName = task.project
    if (!groups[projectName]) {
      groups[projectName] = []
    }
    groups[projectName].push(task)
    return groups
  }, {})

  // Proje isimlerini alfabetik sırala
  const sortedProjects = Object.keys(groupedTasks).sort()

  // Loading ve error state'leri KALDIRILDI - Dashboard hallediyor

  // Eğer belirli bir proje için gösteriliyorsa ve task yoksa
  if (project && tasks.length === 0) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Tasks</h5>
          {role === 'pm' && (
            <button className="btn btn-primary btn-sm" onClick={handleNewTask}>
              + New Task
            </button>
          )}
        </div>
        <div className="alert alert-info">
          No tasks found for this project.
        </div>

        {/* Task Modal */}
        <TaskModal
          show={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingTask(null)
          }}
          onSave={handleSaveTask}
          task={editingTask}
          projectName={project}
          role={role}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          {project ? `Tasks for ${project}` : (role === 'pm' ? 'All Tasks' : 'My Tasks')}
        </h5>
        {role === 'pm' && (
          <button className="btn btn-primary btn-sm" onClick={handleNewTask}>
            + New Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="alert alert-info">
          No tasks found.
        </div>
      ) : (
        <>
          {/* Eğer tek proje gösteriliyorsa, gruplanmadan direkt göster */}
          {project ? (
            <div className="row">
              {tasks.map(task => (
                <div key={task.task_id} className="col-md-6 col-lg-4 mb-3">
                  <TaskCard
                    task={task}
                    role={role}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onUpdateStatus={handleUpdateStatus}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Tüm projeler için gruplanmış görünüm */
            sortedProjects.map(projectName => (
              <div key={projectName} className="mb-3">
                <div
                  className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleProject(projectName)}
                >
                  <h6 className="mb-0 text-muted">
                    {expandedProjects[projectName] ? '▼' : '▶'} {projectName} ({groupedTasks[projectName].length})
                  </h6>
                </div>

                {expandedProjects[projectName] && (
                  <div className="row">
                    {groupedTasks[projectName].map(task => (
                      <div key={task.task_id} className="col-md-6 col-lg-4 mb-3">
                        <TaskCard
                          task={task}
                          role={role}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* Task Modal */}
      <TaskModal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        task={editingTask}
        projectName={project}
        role={role}
      />
    </div>
  )
}

export default TaskList