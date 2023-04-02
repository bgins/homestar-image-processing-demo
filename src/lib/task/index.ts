export type Task = {
  id: number
  workflowId: 'one' | 'two'
  label: string
  content: string
  active: boolean
  status: 'waiting' | 'skipped' | 'success' | 'failure'
}