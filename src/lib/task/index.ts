export type Task = {
  id: number
  workflowId: 'one' | 'two'
  label: string
  content: string
  active: boolean
  status: TaskStatus
}

export type TaskStatus = 'waiting' | 'skipped' | 'success' | 'failure'