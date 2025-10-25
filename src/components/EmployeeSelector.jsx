import { useState, useEffect } from 'react'
import api from '../services/api'

function EmployeeSelector({ selectedEmployees, onEmployeesChange }) {
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    skills: [],
    role: ''
  })
  const [skillInput, setSkillInput] = useState('')
  const [availableEmployees, setAvailableEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch available employees from API
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getEmployees('executor')
      setAvailableEmployees(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = (employee) => {
    if (!selectedEmployees.find(e => e.employee_id === employee.employee_id)) {
      onEmployeesChange([...selectedEmployees, employee])
    }
  }

  const handleRemoveEmployee = (employeeId) => {
    onEmployeesChange(selectedEmployees.filter(e => e.employee_id !== employeeId))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !newEmployee.skills.find(s => (typeof s === 'string' ? s : s.name) === skillInput.trim().toLowerCase())) {
      setNewEmployee({
        ...newEmployee,
        skills: [...newEmployee.skills, { name: skillInput.trim().toLowerCase(), level: 3 }] // Default level 3
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill) => {
    setNewEmployee({
      ...newEmployee,
      skills: newEmployee.skills.filter(s => (typeof s === 'string' ? s : s.name) !== (typeof skill === 'string' ? skill : skill.name))
    })
  }

  const handleCreateEmployee = async () => {
    if (newEmployee.employee_id && newEmployee.name) {
      setLoading(true)
      setError(null)
      try {
        const createdEmployee = await api.createEmployee({
          employee_id: newEmployee.employee_id,
          name: newEmployee.name,
          skills: newEmployee.skills,
          role: newEmployee.role || 'Developer', // Default role
          user_role: 'executor', // User role for permissions
          capacity_hours_per_week: 40, // Default capacity
          current_load_hours: 0
        })
        
        // Add to selected employees
        handleAddEmployee(createdEmployee)
        
        // Refresh available employees list
        await fetchEmployees()
        
        // Reset form
        setNewEmployee({ employee_id: '', name: '', skills: [], role: '' })
        setShowAddEmployee(false)
      } catch (err) {
        setError(err.message)
        console.error('Error creating employee:', err)
        alert(`Hata: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="form-label mb-0">Project Team</label>
        <button 
          type="button" 
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowAddEmployee(!showAddEmployee)}
          disabled={loading}
        >
          {showAddEmployee ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Add from existing employees */}
      {showAddEmployee && (
        <div className="card mb-3 p-3">
          <h6>Select from Available Employees</h6>
          
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Loading employees...</span>
            </div>
          ) : (
            <>
              <div className="list-group mb-3">
                {availableEmployees
                  .filter(emp => !selectedEmployees.find(e => e.employee_id === emp.employee_id))
                  .map(emp => (
                    <button
                      key={emp.employee_id}
                      type="button"
                      className="list-group-item list-group-item-action"
                      onClick={() => handleAddEmployee(emp)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{emp.name}</strong> ({emp.employee_id})
                          {emp.role && <div className="small text-muted">{emp.role}</div>}
                          <div className="mt-1">
                            {emp.skills && emp.skills.map(skill => (
                              <span key={typeof skill === 'string' ? skill : skill.name} className="badge bg-secondary me-1">
                                {typeof skill === 'string' ? skill : skill.name}
                                {typeof skill === 'object' && skill.level && (
                                  <span className="ms-1 opacity-75">★{skill.level}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="badge bg-primary">Add</span>
                      </div>
                    </button>
                  ))}
                {availableEmployees.filter(emp => !selectedEmployees.find(e => e.employee_id === emp.employee_id)).length === 0 && (
                  <div className="text-muted small p-2">No available employees to add</div>
                )}
              </div>
            </>
          )}

          <hr />

          {/* Create new employee */}
          <h6>Or Create New Employee</h6>
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Employee ID (e.g., e45)"
                value={newEmployee.employee_id}
                onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Role (e.g., Frontend Developer)"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleAddSkill}
                  disabled={loading}
                >
                  +
                </button>
              </div>
            </div>
            <div className="col-12">
              {newEmployee.skills.map(skill => (
                <span key={typeof skill === 'string' ? skill : skill.name} className="badge bg-secondary me-1">
                  {typeof skill === 'string' ? skill : skill.name}
                  {typeof skill === 'object' && skill.level && (
                    <span className="ms-1 opacity-75">★{skill.level}</span>
                  )}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.6rem' }}
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={loading}
                  ></button>
                </span>
              ))}
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary btn-sm w-100"
                onClick={handleCreateEmployee}
                disabled={!newEmployee.employee_id || !newEmployee.name || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  'Create & Add Employee'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected employees */}
      <div className="selected-employees">
        {selectedEmployees.length === 0 ? (
          <div className="text-muted small">No employees added yet</div>
        ) : (
          <div className="list-group">
            {selectedEmployees.map(emp => (
              <div key={emp.employee_id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <strong>{emp.name}</strong> <span className="text-muted">({emp.employee_id})</span>
                    {emp.role && <div className="small text-muted">{emp.role}</div>}
                    <div className="mt-1">
                      {emp.skills && emp.skills.map(skill => (
                        <span key={typeof skill === 'string' ? skill : skill.name} className="badge bg-secondary me-1">
                          {typeof skill === 'string' ? skill : skill.name}
                          {typeof skill === 'object' && skill.level && (
                            <span className="ms-1 opacity-75">★{skill.level}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveEmployee(emp.employee_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeSelector