import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EmployeeProvider } from './context/EmployeeContext'
import EmployeeSelection from './pages/EmployeeSelection'
import Dashboard from './pages/Dashboard'
import NewProject from './pages/NewProject'
import ProjectPage from "./pages/ProjectPage"

function App() {
    return (
        <Router>
            <EmployeeProvider>
                <Routes>
                    <Route path="/" element={<EmployeeSelection />} />
                    <Route path="/pm" element={<Dashboard role="pm" />} />
                    <Route path="/pm/new-project" element={<NewProject />} />
                    <Route path="/pm/projects/:projectId" element={<ProjectPage />} />
                    <Route path="/executor" element={<Dashboard role="executor" />} />
                    <Route path="/executor/projects/:projectId" element={<ProjectPage />} />
                </Routes>
            </EmployeeProvider>
        </Router>
    )
}

export default App