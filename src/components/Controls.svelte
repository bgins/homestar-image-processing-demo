<script lang="ts">
  import type { Task } from '$lib/task'
  import type { Workflow } from '$lib/workflow'

  import TaskEntry from '$components/controls/Task.svelte'
  import WorkflowEntry from '$components/controls/Workflow.svelte'

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

  let tasks: Record<string, Task[]> = {
    one: [
      {
        id: 1,
        workflowId: 'one',
        label: 'Crop',
        content: 'Waiting for task to complete',
        active: false,
        status: 'waiting'
      },
      {
        id: 2,
        workflowId: 'one',
        label: 'Rotate',
        content: 'Task completed with receipt...',
        active: false,
        status: 'success'
      },
      {
        id: 3,
        workflowId: 'one',
        label: 'Saturate',
        content: 'Task failed to complete.',
        active: false,
        status: 'failure'
      }
    ],
    two: [
      {
        id: 1,
        workflowId: 'two',
        label: 'Crop',
        content: 'Task completed in Workflow 1',
        active: false,
        status: 'skipped'
      },
      {
        id: 2,
        workflowId: 'two',
        label: 'Rotate',
        content: 'Task completed in Workflow 1',
        active: false,
        status: 'skipped'
      },
      {
        id: 3,
        workflowId: 'two',
        label: 'Grayscale',
        content: 'Task completed with receipt...',
        active: false,
        status: 'success'
      }
    ]
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

    console.log('Running workflow', workflowId)

    workflows[workflowId].status = 'working'

    setTimeout(() => {
      workflows[workflowId].status = 'waiting'
    }, 3000)
  }
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
