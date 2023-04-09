import { get as getStore } from 'svelte/store'

import type { Receipt, TaskOperation, TaskStatus } from '$lib/task'

import { activeWorkflowStore, channelStore, taskStore, workflowStore } from '../stores'
import { connect, type Channel } from '$lib/channel'
import type { Maybe } from '$lib'


export type Workflow = {
  id: WorkflowId
  status: 'waiting' | 'working'
}

export type WorkflowState = {
  id: WorkflowId
  tasks: TaskOperation[]
  step: number
  failedPingCount: number
}

export type WorkflowId = 'one' | 'two'


// RUN

export function run(workflowId: WorkflowId) {
  const channel = getStore(channelStore)
  const tasks = getStore(taskStore)

  if (!channel) connect()

  // Reset workflow UI and state
  reset(workflowId)

  // Initialize active workflow
  activeWorkflowStore.set({
    id: workflowId,
    tasks: tasks[ workflowId ].map(task => task.operation),
    step: 0,
    failedPingCount: 0
  })

  // Set workflow status to working
  workflowStore.update(workflows => ({
    ...workflows,
    [ workflowId ]: { ...workflows[ workflowId ], status: 'working' }
  }))

  // Send run command to server
  channel?.send(JSON.stringify({ run: workflowId }))

  // Emulate with an echo server
  emulate(workflowId, channel)
}


/**
 * Reset tasks to waiting and workflow to starting state
 *
 * @param workflowId Workflow to reset
 */
function reset(workflowId: WorkflowId) {
  const status: TaskStatus = 'waiting'

  taskStore.update(store => {
    const updatedTasks = store[ workflowId ].map(t => ({ ...t, status }))
    return { ...store, [ workflowId ]: updatedTasks }
  })
}

/**
 * Fail any tasks that have not completed
 *
 * @param workflowId Workflow to fail
 */
export function fail(workflowId: WorkflowId) {
  taskStore.update(store => {
    const updatedTasks = store[ workflowId ].map(t => {
      if (t.status !== 'success' && t.status !== 'skipped') {
        const status: TaskStatus = 'failure'

        return { ...t, status }
      } else {
        return t
      }
    })

    return { ...store, [ workflowId ]: updatedTasks }
  })

  // Set workflow status to waiting
  workflowStore.update(workflows => ({
    ...workflows,
    [ workflowId ]: { ...workflows[ workflowId ], status: 'waiting' }
  }))
}


// HANDLER

export async function handleMessage(event: MessageEvent) {
  const data = await event.data.text()

  // Reset ping count on echoed ping or pong from server
  if (data === 'ping' || data === 'pong') {
    activeWorkflowStore.update(store => store ? { ...store, failedPingCount: 0 } : null)

    return
  }

  const message = JSON.parse(data)

  if (message.status === 'success' || message.status === 'skipped') {
    const activeWorkflow = getStore(activeWorkflowStore)

    if (!activeWorkflow) {
      console.error('Received a receipt but workflow was not initiated')
      return
    }

    if (message.op !== activeWorkflow.tasks[ activeWorkflow.step ]) {
      console.error('Received a receipt that did not match the expected workflow step')
      return
    }

    const taskId = activeWorkflow.step + 1
    const status = message.status
    const receipt = message.receipt

    // Update task in UI
    taskStore.update(store => {
      const updatedTasks = store[ activeWorkflow.id ].map(t =>
        t.id === taskId
          ? {
            ...t,
            status,
            message: getTaskContent(status),
            receipt
          }
          : t
      )

      return { ...store, [ activeWorkflow.id ]: updatedTasks }
    })

    // Log receipt
    console.table(receipt)

    if (activeWorkflow.step === activeWorkflow.tasks.length - 1) {
      // Workflow is done. Reset workflow status to waiting.
      workflowStore.update(workflows => ({
        ...workflows,
        [ activeWorkflow.id ]: { ...workflows[ activeWorkflow.id ], status: 'waiting' }
      }))

      // Deactivate workflow
      activeWorkflowStore.set(null)

    } else {
      // Increment workflow step
      activeWorkflowStore.update(store => store ? ({ ...store, step: store.step + 1 }) : null)
    }

  } else {
    console.warn('Received an unexpected message', message)
  }
}

function getTaskContent(status: TaskStatus) {
  switch (status) {
    case 'waiting':
      return 'Waiting for task to complete.'

    case 'success':
      return 'Task completed successfully.'

    case 'failure':
      return 'Task failed to complete.'

    case 'skipped':
      return 'Task completed in another workflow.'
  }
}



// EMULATION

function emulate(workflowId: string, channel: Maybe<Channel>) {
  if (!channel) {
    console.error('Cannot emulate. Channel has not been set.')
    return
  }

  if (workflowId === 'one') {
    Promise.resolve()
      .then(() => sendEmulated('success', 'one', 'crop', channel, 500))
      .then(() => sendEmulated('success', 'one', 'rotate', channel, 1500))
      .then(() => sendEmulated('success', 'one', 'blur', channel, 20000))
  } else if (workflowId === 'two') {
    Promise.resolve()
      .then(() => sendEmulated('skipped', 'two', 'crop', channel, 200))
      .then(() => sendEmulated('skipped', 'two', 'rotate', channel, 200))
      .then(() => sendEmulated('success', 'two', 'grayscale', channel, 1500))
  }
}

function sendEmulated(status: TaskStatus, workflowId: string, op: TaskOperation, channel: Channel, delay: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      const message = JSON.stringify({
        status,
        workflowId,
        op,
        receipt: sampleReceipt
      })

      channel.send(message)

      resolve(null)
    }, delay)
  })
}

const sampleReceipt: Receipt = {
  cid: 'bafyrmiczrugtx6jj42qbwd2ctlmj766th2nwzfsqmvathjdxk63rwkkvpi',
  instruction: 'bafyrmiekhdmnekp6kx6fl22btn6skx7mksl2p64rat6etwcykzpfqow67a',
  iss: null,
  meta: null,
  out: [ 'ok', 'base64image' ],
  prf: [],
  ran: 'bafkr4ickinozehpaz72vtgpbhhqpf6v2fi67rvr6uis52bwsesoss6vinq'
}