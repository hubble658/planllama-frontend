import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatsCard from '../components/StatsCard'
import ProjectList from '../components/ProjectList'
import TaskList from '../components/TaskList'
import { useEmployee } from '../context/EmployeeContext'
import api from '../services/api'

function Dashboard({ role = 'pm' }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('projects')
  const [viewMode, setViewMode] = useState('list') // 'grid' or 'list'
  const { currentEmployee } = useEmployee()
  
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // loadData fonksiyonunu useCallback ile tanımla
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (role === 'pm') {
        const [projectsData, tasksData] = await Promise.all([
          api.getProjects(),
          api.getTasks()
        ])
        setProjects(projectsData)
        setTasks(tasksData)
      } else if (role === 'executor') {
        const projectsData = await api.getProjects()
        setProjects(projectsData)
        
        if (currentEmployee) {
          const tasksResponse = await api.getTasksByAssignee(currentEmployee.employee_id)
          setTasks(tasksResponse.tasks || [])
        } else {
          setTasks([])
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [role, currentEmployee])

  // useEffect ile loadData'yı çağır - SADECE MOUNT'TA VE ROLE/EMPLOYEE DEĞİŞİNCE
  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculate overall project progress for PM stats
  const overallProjectProgress = useMemo(() => {
    if (role !== 'pm' || projects.length === 0) return 0
    
    const totalTasks = projects.reduce((sum, p) => sum + (p.tasksCount || 0), 0)
    const completedTasks = projects.reduce((sum, p) => sum + (p.completedTasks || 0), 0)
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }, [role, projects])

  // Get color based on project statuses
  const getProjectStatsColor = useMemo(() => {
    const inProgressCount = projects.filter(p => p.status === 'In Progress').length
    const completedCount = projects.filter(p => p.status === 'Completed').length
    const planningCount = projects.filter(p => p.status === 'Planning').length
    
    if (completedCount >= inProgressCount && completedCount > 0) return 'success'
    if (inProgressCount > 0) return 'primary'
    if (planningCount > 0) return 'warning'
    return 'info'
  }, [projects])

  // Calculate executor stats based on current employee
  const executorStats = useMemo(() => {
    if (!currentEmployee || role !== 'executor') return null
    
    const assignedTasks = tasks.length
    const inProgress = tasks.filter(task => task.status === 'In Progress').length
    const completed = tasks.filter(task => task.status === 'Completed').length
    const pending = tasks.filter(task => task.status === 'Pending').length
    
    return {
      assignedTasks: { title: 'Assigned Tasks', value: assignedTasks, color: 'primary' },
      inProgress: { title: 'In Progress', value: inProgress, color: 'warning' },
      completed: { title: 'Completed', value: completed, color: 'success' },
      pending: { title: 'Pending', value: pending, color: 'info' }
    }
  }, [currentEmployee, role, tasks])

  // Role-based configuration
  const config = {
    pm: {
      title: 'Product Manager Dashboard',
      stats: {
        totalProjects: { 
          title: 'Total Projects', 
          value: projects.length, 
          color: getProjectStatsColor,
          subtitle: `${overallProjectProgress}% Overall Progress`
        },
        activeTasks: { 
          title: 'Active Tasks', 
          value: tasks.filter(t => t.status === 'In Progress').length, 
          color: 'success' 
        },
        pendingTasks: { 
          title: 'Pending Tasks', 
          value: tasks.filter(t => t.status === 'Pending').length, 
          color: 'warning' 
        },
        completedTasks: { 
          title: 'Completed Tasks', 
          value: tasks.filter(t => t.status === 'Completed').length, 
          color: 'info' 
        }
      },
      showTabs: true
    },
    executor: {
      title: 'Executor Dashboard',
      stats: executorStats || {
        assignedTasks: { title: 'Assigned Tasks', value: 0, color: 'primary' },
        inProgress: { title: 'In Progress', value: 0, color: 'warning' },
        completed: { title: 'Completed', value: 0, color: 'success' },
        pending: { title: 'Pending', value: 0, color: 'info' }
      },
      showTabs: false
    }
  }

  const currentConfig = config[role] || config.pm
  const statsArray = Object.values(currentConfig.stats)

  if (loading) {
    return (
      <div>
        <Header 
          title={currentConfig.title} 
          onChangeRole={() => navigate('/')} 
        />
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Header 
          title={currentConfig.title} 
          onChangeRole={() => navigate('/')} 
        />
        <div className="container-fluid">
          <div className="alert alert-danger mt-4">
            <h5>Error loading dashboard</h5>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadData}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header 
        title={currentConfig.title} 
        onChangeRole={() => navigate('/')} 
      />
      
      <div className="container-fluid">
        {/* Employee Info Card (for executors) */}
        {role === 'executor' && currentEmployee && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <h6 className="text-muted mb-1">Current Workload</h6>
                      <h3 className="mb-0">{currentEmployee.current_load_hours}h / {currentEmployee.capacity_hours_per_week}h</h3>
                    </div>
                    <div className="col-md-6">
                      <div className="progress" style={{ height: '24px' }}>
                        <div 
                          className={`progress-bar ${
                            (currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100) > 85 ? 'bg-danger' : 
                            (currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100) > 70 ? 'bg-warning' : 
                            'bg-success'
                          }`}
                          style={{ width: `${(currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100).toFixed(0)}%` }}
                        >
                          {(currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 text-end">
                      <h6 className="text-muted mb-1">Available Capacity</h6>
                      <h3 className="mb-0 text-success">
                        {currentEmployee.capacity_hours_per_week - currentEmployee.current_load_hours}h
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="row mb-4">
          {statsArray.map((stat, index) => (
            <div key={index} className="col-md-3">
              <StatsCard 
                title={stat.title} 
                value={stat.value} 
                color={stat.color}
                subtitle={stat.subtitle}
              />
            </div>
          ))}
        </div>

        {/* Tabs (only for PM) */}
        {currentConfig.showTabs && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <ul className="nav nav-tabs mb-0">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projects')}
                >
                  Projects
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  All Tasks
                </button>
              </li>
            </ul>
            
            {/* View Toggle Buttons */}
            <div className="btn-group btn-group-sm" role="group">
              <button 
                type="button" 
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
              </button>
              <button 
                type="button" 
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* View Toggle for Executor (no tabs) */}
        {!currentConfig.showTabs && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">My Tasks</h5>
            <div className="btn-group btn-group-sm" role="group">
              <button 
                type="button" 
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
              </button>
              <button 
                type="button" 
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content - DATA'YI PROP OLARAK GEÇİR */}
        <div className="tab-content">
          {currentConfig.showTabs ? (
            <>
              {activeTab === 'projects' && (
                <ProjectList 
                  role={role} 
                  projects={projects}
                  onDataChange={loadData}
                  viewMode={viewMode}
                />
              )}
              {activeTab === 'tasks' && (
                <TaskList 
                  role={role} 
                  tasks={tasks}
                  onDataChange={loadData}
                  viewMode={viewMode}
                />
              )}
            </>
          ) : (
            <TaskList 
              role={role} 
              tasks={tasks}
              onDataChange={loadData}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard