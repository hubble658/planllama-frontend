import { useState } from 'react'

function EmployeeSelector({ selectedEmployees, onEmployeesChange }) {
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    skills: [],
    department: ''
  })
  const [skillInput, setSkillInput] = useState('')

  // Mock available employees - will be replaced with API call
  const availableEmployees = [
    { employee_id: 'e14', name: 'John Doe', skills: ['python', 'fastapi', 'redis'], department: 'Backend' },
    { employee_id: 'e42', name: 'Jane Smith', skills: ['web', 'react', 'restapi'], department: 'Frontend' },
    { employee_id: 'e44', name: 'Bob Johnson', skills: ['python', 'react', 'docker'], department: 'Full Stack' }
  ]

  const handleAddEmployee = (employee) => {
    if (!selectedEmployees.find(e => e.employee_id === employee.employee_id)) {
      onEmployeesChange([...selectedEmployees, employee])
    }
  }

  const handleRemoveEmployee = (employeeId) => {
    onEmployeesChange(selectedEmployees.filter(e => e.employee_id !== employeeId))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !newEmployee.skills.includes(skillInput.trim())) {
      setNewEmployee({
        ...newEmployee,
        skills: [...newEmployee.skills, skillInput.trim().toLowerCase()]
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill) => {
    setNewEmployee({
      ...newEmployee,
      skills: newEmployee.skills.filter(s => s !== skill)
    })
  }

  const handleCreateEmployee = () => {
    if (newEmployee.employee_id && newEmployee.name) {
      handleAddEmployee(newEmployee)
      setNewEmployee({ employee_id: '', name: '', skills: [], department: '' })
      setShowAddEmployee(false)
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
        >
          {showAddEmployee ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {/* Add from existing employees */}
      {showAddEmployee && (
        <div className="card mb-3 p-3">
          <h6>Select from Available Employees</h6>
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
                      <div className="small text-muted">{emp.department}</div>
                      <div className="mt-1">
                        {emp.skills.map(skill => (
                          <span key={skill} className="badge bg-secondary me-1">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <span className="badge bg-primary">Add</span>
                  </div>
                </button>
              ))}
          </div>

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
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Department"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
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
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleAddSkill}
                >
                  +
                </button>
              </div>
            </div>
            <div className="col-12">
              {newEmployee.skills.map(skill => (
                <span key={skill} className="badge bg-secondary me-1">
                  {skill}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.6rem' }}
                    onClick={() => handleRemoveSkill(skill)}
                  ></button>
                </span>
              ))}
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary btn-sm w-100"
                onClick={handleCreateEmployee}
                disabled={!newEmployee.employee_id || !newEmployee.name}
              >
                Create & Add Employee
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
                    {emp.department && <div className="small text-muted">{emp.department}</div>}
                    <div className="mt-1">
                      {emp.skills.map(skill => (
                        <span key={skill} className="badge bg-secondary me-1">{skill}</span>
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
