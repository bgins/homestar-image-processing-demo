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

export async function run(workflowId: WorkflowId) {
  let channel = getStore(channelStore)
  const tasks = getStore(taskStore)

  if (!channel) {
    await connect()
    channel = getStore(channelStore)
  }

  // Reset workflow UI and state
  reset(workflowId)

  // Initialize active workflow
  activeWorkflowStore.set({
    id: workflowId,
    tasks: tasks[workflowId].map(task => task.operation),
    step: 0,
    failedPingCount: 0
  })

  // Set workflow status to working
  workflowStore.update(workflows => ({
    ...workflows,
    [workflowId]: { ...workflows[workflowId], status: 'working' }
  }))

  // Send run command to server
  channel?.send(JSON.stringify({ run: workflowId }))

  if (import.meta.env.VITE_EMULATION_MODE === 'true') {
    // Emulate with an echo server
    emulate(workflowId, channel)
  }
}

/**
 * Reset tasks to waiting and workflow to starting state
 *
 * @param workflowId Workflow to reset
 */
function reset(workflowId: WorkflowId) {
  const status: TaskStatus = 'waiting'

  taskStore.update(store => {
    const updatedTasks = store[workflowId].map(t => ({
      ...t,
      status,
      message: getTaskMessage(status),
      receipt: null
    }))
    return { ...store, [workflowId]: updatedTasks }
  })
}

/**
 * Fail any tasks that have not completed
 *
 * @param workflowId Workflow to fail
 */
export function fail(workflowId: WorkflowId) {
  taskStore.update(store => {
    const updatedTasks = store[workflowId].map(t => {
      if (t.status !== 'success' && t.status !== 'skipped') {
        const status: TaskStatus = 'failure'

        return { ...t, status }
      } else {
        return t
      }
    })

    return { ...store, [workflowId]: updatedTasks }
  })

  // Set workflow status to waiting
  workflowStore.update(workflows => ({
    ...workflows,
    [workflowId]: { ...workflows[workflowId], status: 'waiting' }
  }))
}

// HANDLER

export async function handleMessage(event: MessageEvent) {
  const data = await event.data.text()

  // Reset ping count on echoed ping or pong from server
  if (data === 'ping' || data === 'pong') {
    activeWorkflowStore.update(store => (store ? { ...store, failedPingCount: 0 } : null))

    return
  }

  const message = JSON.parse(data)

  if (message.status === 'success' || message.status === 'skipped') {
    const activeWorkflow = getStore(activeWorkflowStore)

    if (!activeWorkflow) {
      console.error('Received a receipt but workflow was not initiated')
      return
    }

    if (message.op !== activeWorkflow.tasks[activeWorkflow.step]) {
      console.log(message.op)
      console.log(activeWorkflow.tasks[activeWorkflow.step])
      console.error('Received a receipt that did not match the expected workflow step')
      return
    }

    const taskId = activeWorkflow.step + 1
    const status = message.status
    const receipt = parseReceipt(message.receipt)

    // Update task in UI
    taskStore.update(store => {
      const updatedTasks = store[activeWorkflow.id].map(t =>
        t.id === taskId
          ? {
              ...t,
              status,
              message: getTaskMessage(status),
              receipt
            }
          : t
      )

      return { ...store, [activeWorkflow.id]: updatedTasks }
    })

    // Log receipt
    console.table(receipt)

    if (activeWorkflow.step === activeWorkflow.tasks.length - 1) {
      // Workflow is done. Reset workflow status to waiting.
      workflowStore.update(workflows => ({
        ...workflows,
        [activeWorkflow.id]: { ...workflows[activeWorkflow.id], status: 'waiting' }
      }))

      // Deactivate workflow
      activeWorkflowStore.set(null)
    } else {
      // Increment workflow step
      activeWorkflowStore.update(store => (store ? { ...store, step: store.step + 1 } : null))
    }
  } else {
    console.warn('Received an unexpected message', message)
  }
}

function parseReceipt(raw: {
  cid: Record<'/', string>
  instruction: Record<'/', string>
  iss: string | null
  meta: string | null
  out: ['ok' | 'error', Record<'/', Record<'bytes', string>>]
  prf: string[]
  ran: Record<'/', string>
}): Receipt {
  return {
    cid: raw.cid['/'],
    instruction: raw.instruction['/'],
    iss: raw.iss,
    meta: raw.meta,
    out: [raw.out[0], raw.out[1]['/'].bytes],
    prf: raw.prf,
    ran: raw.ran['/']
  }
}

function getTaskMessage(status: TaskStatus) {
  switch (status) {
    case 'waiting':
      return 'Waiting for task to complete.'

    case 'success':
      return 'Task succeeded.'

    case 'failure':
      return 'Task failed.'

    case 'skipped':
      return 'Task skipped.'
  }
}

// JSON WORKFLOWS

export const workflowOneJson = {
  tasks: [
    {
      cause: null,
      meta: {
        fuel: 18446744073709552000,
        time: 100000
      },
      prf: [],
      run: {
        input: {
          args: [
            {
              '/': 'bafybeifxw3ssa2hqcfqstn34t6ftmab7cmrcz35pmglhb73oq3p3ab2lsy'
            },
            150,
            350,
            500,
            500,
            1080,
            1080
          ],
          func: 'crop'
        },
        nnc: '',
        op: 'wasm/run',
        rsc: 'https://ipfs.io/ipfs/bafkreibex7s4fg7wk34q7nhgk5ougy3bhpv4hho2cxjo2jv5sue4ufnkdq'
      }
    },
    {
      cause: null,
      meta: {
        fuel: 18446744073709552000,
        time: 100000
      },
      prf: [],
      run: {
        input: {
          args: [
            {
              'await/ok': {
                '/': 'bafyrmih62pwbqlvlr6zqanownd4mduo6ttc6bffzbqjmo5z3u7zadw6ppi'
              }
            },
            500,
            500
          ],
          func: 'rotate90'
        },
        nnc: '',
        op: 'wasm/run',
        rsc: 'https://ipfs.io/ipfs/bafkreibex7s4fg7wk34q7nhgk5ougy3bhpv4hho2cxjo2jv5sue4ufnkdq'
      }
    },
    {
      cause: null,
      meta: {
        fuel: 18446744073709552000,
        time: 100000
      },
      prf: [],
      run: {
        input: {
          args: [
            {
              'await/ok': {
                '/': 'bafyrmiaridcyi7fuu5k5ryswfgmsjxfonrzlwjvekmq74fdwvys6rkmdfi'
              }
            },
            2.1,
            500,
            500
          ],
          func: 'blur'
        },
        nnc: '',
        op: 'wasm/run',
        rsc: 'https://ipfs.io/ipfs/bafkreibex7s4fg7wk34q7nhgk5ougy3bhpv4hho2cxjo2jv5sue4ufnkdq'
      }
    }
  ]
}

export const workflowTwoJson = {
  tasks: [
    {
      cause: null,
      meta: {
        fuel: 18446744073709552000,
        time: 100000
      },
      prf: [],
      run: {
        input: {
          args: [
            {
              '/': 'bafybeifxw3ssa2hqcfqstn34t6ftmab7cmrcz35pmglhb73oq3p3ab2lsy'
            },
            150,
            350,
            500,
            500,
            1080,
            1080
          ],
          func: 'crop'
        },
        nnc: '',
        op: 'wasm/run',
        rsc: 'https://ipfs.io/ipfs/bafkreibex7s4fg7wk34q7nhgk5ougy3bhpv4hho2cxjo2jv5sue4ufnkdq'
      }
    },
    {
      cause: null,
      meta: {
        fuel: 18446744073709552000,
        time: 100000
      },
      prf: [],
      run: {
        input: {
          args: [
            {
              'await/ok': {
                '/': 'bafyrmih62pwbqlvlr6zqanownd4mduo6ttc6bffzbqjmo5z3u7zadw6ppi'
              }
            },
            500,
            500
          ],
          func: 'rotate90'
        },
        nnc: '',
        op: 'wasm/run',
        rsc: 'https://ipfs.io/ipfs/bafkreibex7s4fg7wk34q7nhgk5ougy3bhpv4hho2cxjo2jv5sue4ufnkdq'
      }
    },
    {
      cause: null,
      meta: {
        fuel: 18446744073709552000,
        time: 100000
      },
      prf: [],
      run: {
        input: {
          args: [
            {
              'await/ok': {
                '/': 'bafyrmiaridcyi7fuu5k5ryswfgmsjxfonrzlwjvekmq74fdwvys6rkmdfi'
              }
            },
            500,
            500
          ],
          func: 'grayscale'
        },
        nnc: '',
        op: 'wasm/run',
        rsc: 'https://ipfs.io/ipfs/bafkreibex7s4fg7wk34q7nhgk5ougy3bhpv4hho2cxjo2jv5sue4ufnkdq'
      }
    }
  ]
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
      .then(() => sendEmulated('success', 'one', 'rotate90', channel, 1500))
      .then(() => sendEmulated('success', 'one', 'blur', channel, 20000))
  } else if (workflowId === 'two') {
    Promise.resolve()
      .then(() => sendEmulated('skipped', 'two', 'crop', channel, 200))
      .then(() => sendEmulated('skipped', 'two', 'rotate90', channel, 200))
      .then(() => sendEmulated('success', 'two', 'grayscale', channel, 1500))
  }
}

function sendEmulated(
  status: TaskStatus,
  workflowId: string,
  op: TaskOperation,
  channel: Channel,
  delay: number
) {
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

const catResponse = await fetch('./spacecat')
const base64Cat = await catResponse.text()

const sampleReceipt = {
  cid: {
    '/': 'bafyrmiczrugtx6jj42qbwd2ctlmj766th2nwzfsqmvathjdxk63rwkkvpi'
  },
  instruction: {
    '/': 'bafyrmiekhdmnekp6kx6fl22btn6skx7mksl2p64rat6etwcykzpfqow67a'
  },
  iss: null,
  meta: null,
  out: ['ok', { '/': { bytes: `${base64Cat}` } }],
  prf: [],
  ran: {
    '/': 'bafkr4ickinozehpaz72vtgpbhhqpf6v2fi67rvr6uis52bwsesoss6vinq'
  }
}
