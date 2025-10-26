import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmployee } from '../context/EmployeeContext'
import logo from '../assets/logo.ico'
import api from '../services/api'

function EmployeeSelection() {
  const navigate = useNavigate()
  const { selectEmployee } = useEmployee()
  
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getEmployees()
      setEmployees(data)
    } catch (err) {
      console.error('Error loading employees:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEmployee = (employee) => {
    selectEmployee(employee)
    navigate(`/${employee.user_role}`)
  }

  // Group employees by role
  const projectManagers = employees.filter(emp => emp.user_role === 'pm')
  const executors = employees.filter(emp => emp.user_role === 'executor')

  const EmployeeCard = ({ employee }) => {
    const availableHours = employee.capacity_hours_per_week - employee.current_load_hours
    const loadPercentage = (employee.current_load_hours / employee.capacity_hours_per_week * 100).toFixed(0)
    
    return (
      <div 
        className="card employee-card h-100 text-center p-3" 
        onClick={() => handleSelectEmployee(employee)}
        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
      >
        <div className="card-body">
          <div className="mb-3">
            <div 
              className="avatar-circle mx-auto"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: employee.user_role === 'pm' ? '#0d6efd' : '#198754',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              {employee.avatar}
            </div>
          </div>
          <h5 className="card-title mb-1">{employee.name}</h5>
          <p className="text-muted small mb-2">{employee.role}</p>
          <span className={`badge ${employee.user_role === 'pm' ? 'bg-primary' : 'bg-success'} mb-2`}>
            {employee.user_role === 'pm' ? 'Product Manager' : 'Executor'}
          </span>
          <div className="mt-2 small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Workload:</span>
              <span className="fw-bold">{loadPercentage}%</span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div 
                className={`progress-bar ${loadPercentage > 85 ? 'bg-danger' : loadPercentage > 70 ? 'bg-warning' : 'bg-success'}`}
                style={{ width: `${loadPercentage}%` }}
              ></div>
            </div>
            <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
              {availableHours}h available / {employee.capacity_hours_per_week}h
            </div>
          </div>
        </div>
      </div>
    )
  }

  const EmployeeListItem = ({ employee }) => {
    const availableHours = employee.capacity_hours_per_week - employee.current_load_hours
    const loadPercentage = (employee.current_load_hours / employee.capacity_hours_per_week * 100).toFixed(0)
    
    return (
      <div 
        className="list-group-item list-group-item-action" 
        onClick={() => handleSelectEmployee(employee)}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          <div 
            className="avatar-circle me-3"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: employee.user_role === 'pm' ? '#0d6efd' : '#198754',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            {employee.avatar}
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div>
                <h6 className="mb-0">{employee.name}</h6>
                <p className="text-muted small mb-0">{employee.role}</p>
              </div>
              <span className={`badge ${employee.user_role === 'pm' ? 'bg-primary' : 'bg-success'}`}>
                {employee.user_role === 'pm' ? 'Product Manager' : 'Executor'}
              </span>
            </div>
            
            <div className="row align-items-center mt-2">
              <div className="col-md-8">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Workload:</span>
                  <span className="fw-bold">{loadPercentage}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${loadPercentage > 85 ? 'bg-danger' : loadPercentage > 70 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${loadPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="col-md-4 text-end">
                <small className="text-muted">
                  {availableHours}h available / {employee.capacity_hours_per_week}h
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="row min-vh-100 align-items-center justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading employees...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="row min-vh-100 align-items-center justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger">
              <h5>Error loading employees</h5>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadEmployees}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row min-vh-100 align-items-center justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
              <img src={logo} alt="PlanLLaMA" style={{ width: '96px', height: '96px' }} />
              <h1 className="display-4 mb-0">PlanLLaMA</h1>
            </div>
            <p className="lead text-muted">Select an employee to continue</p>
          </div>

          {/* View Toggle Buttons */}
          <div className="d-flex justify-content-end mb-3">
            <div className="btn-group btn-group-sm" role="group">
              <button 
                type="button" 
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
                <span className="ms-1">Grid</span>
              </button>
              <button 
                type="button" 
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
                <span className="ms-1">List</span>
              </button>
            </div>
          </div>

          {/* Product Managers Section */}
          {projectManagers.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-3">
                <span className="badge bg-primary me-2">PM</span>
                Product Managers
              </h4>
              
              {viewMode === 'grid' ? (
                <div className="row g-3">
                  {projectManagers.map(employee => (
                    <div key={employee.employee_id} className="col-md-6">
                      <EmployeeCard employee={employee} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="list-group">
                  {projectManagers.map(employee => (
                    <EmployeeListItem key={employee.employee_id} employee={employee} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Executors Section */}
          {executors.length > 0 && (
            <div>
              <h4 className="mb-3">
                <span className="badge bg-success me-2">EX</span>
                Executors
              </h4>
              
              {viewMode === 'grid' ? (
                <div className="row g-3">
                  {executors.map(employee => (
                    <div key={employee.employee_id} className="col-md-6">
                      <EmployeeCard employee={employee} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="list-group">
                  {executors.map(employee => (
                    <EmployeeListItem key={employee.employee_id} employee={employee} />
                  ))}
                </div>
              )}
            </div>
          )}

          {employees.length === 0 && (
            <div className="alert alert-info text-center">
              No employees found. Please add employees to the system.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeSelection