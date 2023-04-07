<script lang="ts">
  import { onDestroy } from 'svelte'

  import type { Receipt, Task, TaskStatus } from '$lib/task'
  import type { Workflow } from '$lib/workflow'

  import { taskStore } from '../stores'
  import TaskEntry from '$components/controls/Task.svelte'
  import WorkflowEntry from '$components/controls/Workflow.svelte'

  let tasks: Record<string, Task[]> = {}

  const unsubscribeTaskStore = taskStore.subscribe(store => {
    tasks = store
  })

  let workflows: Record<string, Workflow> = {
    one: {
      id: 'one',
      status: 'waiting'
    },
    two: {
      id: 'two',
      status: 'waiting'
    }
  }

  function expand(event: CustomEvent<{ task: Task }>) {
    const { task } = event.detail

    tasks[task.workflowId] = tasks[task.workflowId].map(t => {
      t.active = false

      if (t.id === task.id) {
        t.active = true
      }

      return t
    })
  }

  function collapse(event: CustomEvent<{ task: Task }>) {
    const { task } = event.detail

    tasks[task.workflowId] = tasks[task.workflowId].map(t => {
      t.active = false
      return t
    })
  }

  function run(event: CustomEvent<{ workflowId: string }>) {
    const { workflowId } = event.detail

    workflows[workflowId].status = 'working'
    reset(workflowId)

    if (workflowId === 'one') {
      Promise.resolve()
        .then(() => execute(tasks['one'][0], 'success', 500))
        .then(() => execute(tasks['one'][1], 'success', 1500))
        .then(() => execute(tasks['one'][2], 'failure', 3000))
        .then(() => (workflows[workflowId].status = 'waiting'))
    } else if (workflowId === 'two') {
      Promise.resolve()
        .then(() => execute(tasks['two'][0], 'skipped', 200))
        .then(() => execute(tasks['two'][1], 'skipped', 200))
        .then(() => execute(tasks['two'][2], 'success', 1500))
        .then(() => (workflows[workflowId].status = 'waiting'))
    }
  }

  function reset(workflowId: string) {
    taskStore.update(store => {
      const status: TaskStatus = 'waiting'
      const updatedTasks = store[workflowId].map(t => ({ ...t, status }))
      return { ...store, [workflowId]: updatedTasks }
    })
  }

  function execute(task: Task, status: TaskStatus, delay: number) {
    return new Promise(resolve => {
      setTimeout(() => {
        taskStore.update(store => {
          const updatedTasks = store[task.workflowId].map(t =>
            t.id === task.id
              ? {
                  ...t,
                  status,
                  message: getTaskContent(status),
                  receipt: status === 'success' ? sampleReceipt : undefined
                }
              : t
          )

          console.table(sampleReceipt)

          return { ...store, [task.workflowId]: updatedTasks }
        })
        resolve(null)
      }, delay)
    })
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

  const sampleReceipt: Receipt = {
    cid: 'bafyrmiczrugtx6jj42qbwd2ctlmj766th2nwzfsqmvathjdxk63rwkkvpi',
    instruction: 'bafyrmiekhdmnekp6kx6fl22btn6skx7mksl2p64rat6etwcykzpfqow67a',
    iss: null,
    meta: null,
    out: ['ok', 'base64image'],
    prf: [],
    ran: 'bafkr4ickinozehpaz72vtgpbhhqpf6v2fi67rvr6uis52bwsesoss6vinq'
  }

  onDestroy(() => {
    unsubscribeTaskStore()
  })
</script>

<div class="absolute z-10 left-3 top-16 w-60 bg-white border border-black shadow-md">
  <WorkflowEntry workflow={workflows.one} on:run={run} />
  {#each tasks.one as task}
    <TaskEntry {task} on:expand={expand} on:collapse={collapse} />
  {/each}
  <WorkflowEntry workflow={workflows.two} on:run={run} />
  {#each tasks.two as task}
    <TaskEntry {task} on:expand={expand} on:collapse={collapse} />
  {/each}
</div>
