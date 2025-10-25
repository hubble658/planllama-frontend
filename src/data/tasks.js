// Import dependencies for enrichment
import { getEmployeeByEmployeeId } from './employees'
import { getProjectByProjectId } from './projects'

// Mock task data
export const tasks = [
  {
    task_id: 't01',
    title: 'Design homepage mockup',
    description: 'Create high-fidelity mockup for the new homepage',
    status: 'In Progress',
    priority: 'high',
    assignee_id: 'e04',
    project_id: 'p01',
    dueDate: '2025-10-28',
    estimatedHours: 8,
    createdAt: '2025-10-15',
    completedAt: null
  },
  {
    task_id: 't02',
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication system',
    status: 'Pending',
    priority: 'critical',
    assignee_id: 'e03',
    project_id: 'p02',
    dueDate: '2025-10-30',
    estimatedHours: 16,
    createdAt: '2025-10-10',
    completedAt: null
  },
  {
    task_id: 't03',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints',
    status: 'In Progress',
    priority: 'medium',
    assignee_id: 'e03',
    project_id: 'p03',
    dueDate: '2025-11-05',
    estimatedHours: 12,
    createdAt: '2025-10-12',
    completedAt: null
  },
  {
    task_id: 't04',
    title: 'Setup database schema',
    description: 'Design and implement database tables',
    status: 'Completed',
    priority: 'high',
    assignee_id: 'e03',
    project_id: 'p02',
    dueDate: '2025-10-20',
    estimatedHours: 10,
    createdAt: '2025-10-05',
    completedAt: '2025-10-19'
  },
  {
    task_id: 't05',
    title: 'Create component library',
    description: 'Build reusable React components',
    status: 'Pending',
    priority: 'low',
    assignee_id: 'e04',
    project_id: 'p01',
    dueDate: '2025-11-10',
    estimatedHours: 20,
    createdAt: '2025-10-08',
    completedAt: null
  },
  {
    task_id: 't06',
    title: 'Implement payment gateway',
    description: 'Integrate Stripe payment system',
    status: 'In Progress',
    priority: 'critical',
    assignee_id: 'e03',
    project_id: 'p04',
    dueDate: '2025-11-01',
    estimatedHours: 24,
    createdAt: '2025-10-18',
    completedAt: null
  },
  {
    task_id: 't07',
    title: 'Design product cards',
    description: 'Create responsive product card components',
    status: 'Completed',
    priority: 'medium',
    assignee_id: 'e04',
    project_id: 'p04',
    dueDate: '2025-10-22',
    estimatedHours: 6,
    createdAt: '2025-10-14',
    completedAt: '2025-10-21'
  },
  {
    task_id: 't08',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated deployment',
    status: 'In Progress',
    priority: 'high',
    assignee_id: 'e03',
    project_id: 'p05',
    dueDate: '2025-11-03',
    estimatedHours: 8,
    createdAt: '2025-10-16',
    completedAt: null
  },
  {
    task_id: 't09',
    title: 'Create landing page',
    description: 'Design and implement marketing landing page',
    status: 'Pending',
    priority: 'medium',
    assignee_id: 'e04',
    project_id: 'p01',
    dueDate: '2025-11-08',
    estimatedHours: 12,
    createdAt: '2025-10-20',
    completedAt: null
  },
  {
    task_id: 't10',
    title: 'Implement push notifications',
    description: 'Add Firebase push notifications to mobile app',
    status: 'Pending',
    priority: 'high',
    assignee_id: 'e03',
    project_id: 'p02',
    dueDate: '2025-11-12',
    estimatedHours: 16,
    createdAt: '2025-10-11',
    completedAt: null
  },
  {
    task_id: 't11',
    title: 'Create REST API endpoints',
    description: 'Build user management API endpoints',
    status: 'In Progress',
    priority: 'critical',
    assignee_id: 'e03',
    project_id: 'p03',
    dueDate: '2025-10-29',
    estimatedHours: 14,
    createdAt: '2025-10-13',
    completedAt: null
  },
  {
    task_id: 't12',
    title: 'Design mobile UI screens',
    description: 'Create UI mockups for all mobile app screens',
    status: 'Completed',
    priority: 'high',
    assignee_id: 'e04',
    project_id: 'p02',
    dueDate: '2025-10-18',
    estimatedHours: 20,
    createdAt: '2025-10-01',
    completedAt: '2025-10-17'
  },
  {
    task_id: 't13',
    title: 'Implement search functionality',
    description: 'Add Elasticsearch integration for product search',
    status: 'Pending',
    priority: 'medium',
    assignee_id: 'e03',
    project_id: 'p04',
    dueDate: '2025-11-15',
    estimatedHours: 18,
    createdAt: '2025-10-19',
    completedAt: null
  },
  {
    task_id: 't14',
    title: 'Create email templates',
    description: 'Design responsive email templates for notifications',
    status: 'In Progress',
    priority: 'low',
    assignee_id: 'e04',
    project_id: 'p05',
    dueDate: '2025-11-07',
    estimatedHours: 8,
    createdAt: '2025-10-17',
    completedAt: null
  },
  {
    task_id: 't15',
    title: 'Performance optimization',
    description: 'Optimize API response times and database queries',
    status: 'Pending',
    priority: 'high',
    assignee_id: 'e03',
    project_id: 'p03',
    dueDate: '2025-11-20',
    estimatedHours: 16,
    createdAt: '2025-10-21',
    completedAt: null
  }
]

// Primary lookup by task_id (API compatible)
export const getTaskByTaskId = (taskId) => {
  return tasks.find(task => task.task_id === taskId)
}

// Get tasks by project_id
export const getTasksByProjectId = (projectId) => {
  return tasks.filter(task => task.project_id === projectId)
}

// Get tasks by assignee_id
export const getTasksByAssigneeId = (assigneeId) => {
  return tasks.filter(task => task.assignee_id === assigneeId)
}

// Get tasks by status
export const getTasksByStatus = (status) => {
  return tasks.filter(task => task.status === status)
}

// Get tasks by priority
export const getTasksByPriority = (priority) => {
  return tasks.filter(task => task.priority === priority)
}

// Deprecated functions for backward compatibility
export const getTaskById = (id) => {
  console.warn('getTaskById is deprecated, use getTaskByTaskId instead')
  return tasks.find(task => task.task_id === `t${String(id).padStart(2, '0')}`)
}

export const getTasksByProject = (projectName) => {
  console.warn('getTasksByProject is deprecated, use getTasksByProjectId instead')
  return enrichTasksForDisplay(tasks).filter(task => task.project === projectName)
}

export const getTasksByAssignee = (assigneeName) => {
  console.warn('getTasksByAssignee is deprecated, use getTasksByAssigneeId instead')
  return enrichTasksForDisplay(tasks).filter(task => task.assignee === assigneeName)
}

// Enrich tasks with names for display (converts IDs to names)
export const enrichTasksForDisplay = (tasksToEnrich) => {
  return tasksToEnrich.map(task => {
    const assignee = getEmployeeByEmployeeId(task.assignee_id)
    const project = getProjectByProjectId(task.project_id)
    
    return {
      ...task,
      assignee: assignee?.name || 'Unassigned',
      project: project?.name || 'Unknown Project'
    }
  })
}

// Get enriched tasks (with names) for display
export const getEnrichedTasks = () => {
  return enrichTasksForDisplay(tasks)
}

