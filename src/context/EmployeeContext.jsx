import { createContext, useContext, useState, useEffect } from 'react'
import { getEmployeeByEmployeeId } from '../data/employees'
import api from '../services/api'

const EmployeeContext = createContext()

export function EmployeeProvider({ children }) {
  const [currentEmployee, setCurrentEmployee] = useState(null)

  // Load employee from localStorage on mount
  useEffect(() => {
    const savedEmployeeId = localStorage.getItem('currentEmployeeId')
    if (savedEmployeeId) {
      // API'den güncel employee bilgisini yükle
      api.getEmployee(savedEmployeeId)
        .then(employee => {
          if (employee) {
            setCurrentEmployee(employee)
          }
        })
        .catch(err => {
          console.error('Error loading saved employee:', err)
          // Fallback to mock data
          const employee = getEmployeeByEmployeeId(savedEmployeeId)
          if (employee) {
            setCurrentEmployee(employee)
          }
        })
    }
  }, [])

  // Save employee to localStorage when it changes
  const selectEmployee = (employee) => {
    setCurrentEmployee(employee)
    if (employee) {
      localStorage.setItem('currentEmployeeId', employee.employee_id)
    } else {
      localStorage.removeItem('currentEmployeeId')
    }
  }

  // Refresh employee data from API (for workload updates)
  const refreshEmployee = async () => {
    if (currentEmployee) {
      try {
        const updatedEmployee = await api.getEmployee(currentEmployee.employee_id)
        setCurrentEmployee(updatedEmployee)
      } catch (err) {
        console.error('Error refreshing employee:', err)
      }
    }
  }

  const logout = () => {
    setCurrentEmployee(null)
    localStorage.removeItem('currentEmployeeId')
  }

  return (
    <EmployeeContext.Provider value={{ 
      currentEmployee, 
      selectEmployee, 
      refreshEmployee, 
      logout 
    }}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider')
  }
  return context
}