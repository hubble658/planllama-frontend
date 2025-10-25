import { useEmployee } from '../context/EmployeeContext'
import logo from '../assets/logo.ico'

function Header({ title, onChangeRole }) {
  const { currentEmployee } = useEmployee()

  return (
    <div className="dashboard-header">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center gap-2">
              <img src={logo} alt="PlanLLaMA" style={{ width: '64px', height: '64px' }} />
              <h4 className="mb-0">PlanLLaMA - {title}</h4>
            </div>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            {currentEmployee && (
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="avatar-circle"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: currentEmployee.user_role === 'pm' ? '#0d6efd' : '#198754',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {currentEmployee.avatar}
                </div>
                <div className="d-flex flex-column" style={{ lineHeight: '1.2' }}>
                  <span className="fw-bold" style={{ fontSize: '14px' }}>
                    {currentEmployee.name}
                  </span>
                  <span className="text-muted" style={{ fontSize: '12px' }}>
                    {currentEmployee.role}
                  </span>
                </div>
              </div>
            )}
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={onChangeRole}
            >
              Change Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
