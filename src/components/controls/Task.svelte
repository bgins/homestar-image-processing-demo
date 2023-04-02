<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'

  import type { Task } from '$lib/task'
  import CircleIcon from '$components/icons/Circle.svelte'
  import CheckCircleIcon from '$components/icons/CheckCircle.svelte'
  import ChevronDownIcon from '$components/icons/ChevronDown.svelte'
  import ChevronUpIcon from '$components/icons/ChevronUp.svelte'
  import MinusCircleIcon from '$components/icons/MinusCircle.svelte'
  import XCircleIcon from '$components/icons/XCircle.svelte'

  export let task: Task

  const dispatch = createEventDispatcher()

  function expand(task: Task) {
    dispatch('expand', { task })
  }

  function collapse(task: Task) {
    dispatch('collapse', { task })
  }
</script>

<div class="px-2 py-1.5">
  <div class="flex flex-cols gap-2 items-center">
    {#if task.status === 'waiting'}
      <CircleIcon />
    {:else if task.status === 'skipped'}
      <MinusCircleIcon />
    {:else if task.status === 'success'}
      <CheckCircleIcon />
    {:else if task.status === 'failure'}
      <XCircleIcon />
    {/if}
    {task.label}
    {#if task.active}
      <span
        class="ml-auto cursor-pointer"
        on:click={() => collapse(task)}
        on:keypress={() => collapse(task)}
      >
        <ChevronUpIcon />
      </span>
    {:else}
      <span
        class="ml-auto cursor-pointer"
        on:click={() => expand(task)}
        on:keypress={() => expand(task)}
      >
        <ChevronDownIcon />
      </span>
    {/if}
  </div>
  {#if task.active}
    <div class="slider" transition:slide>
      <p class="text-sm text-slate-700">{task.content}</p>
    </div>
  {/if}
</div>
