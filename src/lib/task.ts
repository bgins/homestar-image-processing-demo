export type Task = {
  id: number
  workflowId: 'one' | 'two'
  operation: TaskOperation
  active: boolean
  status: TaskStatus
  message: string
  receipt?: Receipt
}

export type Receipt = {
  cid: string
  instruction: string
  iss: string | null
  meta: string | null
  out: ['ok' | 'error', string]
  prf: string[]
  ran: string
}

export type TaskStatus = 'waiting' | 'skipped' | 'success' | 'failure'

export type TaskOperation = 'crop' | 'rotate90' | 'blur' | 'grayscale'
