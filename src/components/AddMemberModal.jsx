import { useState, useEffect } from 'react'
import api from '../services/api'

function AddMemberModal({ show, onClose, projectId, currentMembers = [], onMemberAdded }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (show) {
      loadEmployees()
    }
  }, [show])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getEmployees()
      // Filter out employees who are already members
      const currentMemberIds = currentMembers.map(m => m.employee_id)
      const availableEmployees = data.filter(emp => !currentMemberIds.includes(emp.employee_id))
      setEmployees(availableEmployees)
    } catch (err) {
      console.error('Error loading employees:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee to add')
      return
    }

    try {
      setAdding(true)
      // API call to add member to project
      await api.addProjectMember(projectId, selectedEmployee.employee_id)
      
      if (onMemberAdded) {
        onMemberAdded(selectedEmployee)
      }
      
      setSelectedEmployee(null)
      onClose()
    } catch (err) {
      console.error('Error adding member:', err)
      alert(`Error adding member: ${err.message}`)
    } finally {
      setAdding(false)
    }
  }

  const EmployeeItem = ({ employee, selected, onClick }) => {
    const availableHours = employee.capacity_hours_per_week - employee.current_load_hours
    const loadPercentage = (employee.current_load_hours / employee.capacity_hours_per_week * 100).toFixed(0)
    
    return (
      <div 
        className={`list-group-item list-group-item-action ${selected ? 'active' : ''}`}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          <div 
            className="me-3"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: employee.user_role === 'pm' ? '#0d6efd' : '#198754',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            {employee.avatar}
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div>
                <h6 className={`mb-0 ${selected ? 'text-white' : ''}`}>{employee.name}</h6>
                <small className={selected ? 'text-white-50' : 'text-muted'}>{employee.role}</small>
              </div>
              <span className={`badge ${employee.user_role === 'pm' ? 'bg-primary' : 'bg-success'} ${selected ? 'bg-white text-primary' : ''}`}>
                {employee.user_role === 'pm' ? 'PM' : 'Executor'}
              </span>
            </div>
            
            <div className="row align-items-center mt-2">
              <div className="col-8">
                <div className="d-flex justify-content-between small mb-1">
                  <span className={selected ? 'text-white-50' : 'text-muted'}>Workload:</span>
                  <span className={selected ? 'text-white fw-bold' : 'fw-bold'}>{loadPercentage}%</span>
                </div>
                <div className="progress" style={{ height: '6px', backgroundColor: selected ? 'rgba(255,255,255,0.3)' : undefined }}>
                  <div 
                    className={`progress-bar ${selected ? 'bg-white' : (loadPercentage > 85 ? 'bg-danger' : loadPercentage > 70 ? 'bg-warning' : 'bg-success')}`}
                    style={{ width: `${loadPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="col-4 text-end">
                <small className={selected ? 'text-white-50' : 'text-muted'}>
                  {availableHours}h free
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!show) return null

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Team Member</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading employees...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <h6>Error loading employees</h6>
                <p>{error}</p>
                <button className="btn btn-primary btn-sm" onClick={loadEmployees}>
                  Retry
                </button>
              </div>
            ) : employees.length === 0 ? (
              <div className="alert alert-info">
                All available employees are already members of this project.
              </div>
            ) : (
              <>
                <p className="text-muted mb-3">
                  Select an employee to add to the project team. Click on an employee to select them.
                </p>
                <div className="list-group">
                  {employees.map(employee => (
                    <EmployeeItem
                      key={employee.employee_id}
                      employee={employee}
                      selected={selectedEmployee?.employee_id === employee.employee_id}
                      onClick={() => setSelectedEmployee(employee)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={adding}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleAddMember}
              disabled={!selectedEmployee || adding}
            >
              {adding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddMemberModal

