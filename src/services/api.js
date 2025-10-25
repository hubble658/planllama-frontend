export const API_BASE_URL = 'http://localhost:5000/api';

class APIService {

  // Hata yönetimi için yardımcı fonksiyon
  async handleResponse(response) {
    if (!response.ok) {
      let errorData;
      try {
        // Yanıtın JSON olup olmadığını kontrol et
        const text = await response.text();
        errorData = text ? JSON.parse(text) : { error: 'Unknown error with no body' };
      } catch (e) {
        // JSON parse hatası olursa
        errorData = { error: `HTTP error! Status: ${response.status}`, status: response.status };
      }

      const error = new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      error.response = errorData; // Hata yanıtını kaydet
      throw error;
    }

    // 204 No Content gibi durumlarda (örn: DELETE) body olmaz
    if (response.status === 204) {
      return { success: true, status: 204 };
    }

    // Diğer başarılı yanıtlar için JSON'u parse et
    return response.json();
  }

  // Employees
  async getEmployees(role = null) {
    const url = role ? `${API_BASE_URL}/employees?role=${role}` : `${API_BASE_URL}/employees`
    const response = await fetch(url)
    return this.handleResponse(response)
  }

  async getEmployee(employeeId) {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`)
    return this.handleResponse(response)
  }

  async createEmployee(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    })
    return this.handleResponse(response)
  }

  // Projects
  async getProjectMembers(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`)
    return this.handleResponse(response)
  }

  async getProjects(options = {}) {
    const params = new URLSearchParams()
    if (options.status) params.append('status', options.status)
    if (options.include_tasks) params.append('include_tasks', 'true')

    const url = `${API_BASE_URL}/projects?${params}`
    const response = await fetch(url)
    return this.handleResponse(response)
  }

  async getProject(projectId, includeTasks = false) {
    const url = `${API_BASE_URL}/projects/${projectId}?include_tasks=${includeTasks}`
    const response = await fetch(url)
    return this.handleResponse(response)
  }

  async createProject(projectData) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })
    return this.handleResponse(response)
  }

  async updateProject(projectId, projectData) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })
    return this.handleResponse(response)
  }

  async deleteProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE'
    })
    return this.handleResponse(response)
  }

  // Tasks
  async getTasks(options = {}) {
    const params = new URLSearchParams({ enrich: 'true' })
    if (options.status) params.append('status', options.status)
    if (options.assignee_id) params.append('assignee_id', options.assignee_id)
    if (options.project_id) params.append('project_id', options.project_id)

    const url = `${API_BASE_URL}/tasks?${params}`
    const response = await fetch(url)
    return this.handleResponse(response)
  }

  async getTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}?enrich=true`)
    return this.handleResponse(response)
  }

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    return this.handleResponse(response)
  }

  async updateTask(taskId, taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    return this.handleResponse(response)
  }

  async updateTaskStatus(taskId, status) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    return this.handleResponse(response)
  }

  async deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    })
    return this.handleResponse(response)
  }

  // Tasks by Assignee
  async getTasksByAssignee(assigneeId) {
    const response = await fetch(`${API_BASE_URL}/tasks/by-assignee/${assigneeId}`)
    return this.handleResponse(response)
  }

  // Tasks by Project - Görevleri projeye göre getiren ana metot
  async getTasksByProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/tasks/by-project/${projectId}`)
    return this.handleResponse(response)
  }

  // Analyze project with LLaMa (AI) - backend should expose this endpoint
  async analyzeProject(projectId, options = {}) {
    const url = `${API_BASE_URL}/projects/${projectId}/analyze`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })
    return this.handleResponse(response)
  }

  // AI Task Generation Endpoint (handleSubmit'ten taşınan)
  async createProjectAndTasks(projectData) {
    const response = await fetch(`${API_BASE_URL}/projects/generate-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    return this.handleResponse(response);
  }
}

export default new APIService()