import { derived, writable } from 'svelte/store'
import type { Readable, Writable } from 'svelte/store'
import type { NodeType } from 'svelvet'

import type { Task } from "$lib/task"

export const taskStore: Writable<Record<string, Task[]>> = writable({
  one: [
    {
      id: 1,
      workflowId: 'one',
      operation: 'crop',
      message: 'Waiting for task to complete',
      active: false,
      status: 'waiting'
    },
    {
      id: 2,
      workflowId: 'one',
      operation: 'rotate',
      message: 'Waiting for task to complete.',
      active: false,
      status: 'waiting'
    },
    {
      id: 3,
      workflowId: 'one',
      operation: 'blur',
      message: 'Waiting for task to complete.',
      active: false,
      status: 'waiting'
    }
  ],
  two: [
    {
      id: 1,
      workflowId: 'two',
      operation: 'crop',
      message: 'Waiting for task to complete.',
      active: false,
      status: 'waiting'
    },
    {
      id: 2,
      workflowId: 'two',
      operation: 'rotate',
      message: 'Waiting for task to complete.',
      active: false,
      status: 'waiting'
    },
    {
      id: 3,
      workflowId: 'two',
      operation: 'grayscale',
      message: 'Waiting for task to complete.',
      active: false,
      status: 'waiting'
    }
  ]
})

export const nodeStore: Readable<NodeType[]> = derived(taskStore, $taskStore => {
  const workflowOneNodes = $taskStore[ 'one' ].reduce((nodes, task, index) => {
    if (task.status === 'success') {
      const idOffset = 2

      // @ts-ignore
      nodes = [ ...nodes, {
        id: String(index + idOffset),
        position: { x: 500 + ((index + 1) * 250), y: 150 },
        data: {
          html: `<img src="synthcat.jpg" draggable="false" />`
        },
        width: 150,
        height: 150,
        bgColor: 'white',
        borderColor: 'transparent',
      } ]
    }
    return nodes
  }, [])

  const workflowTwoNodes = $taskStore[ 'two' ].reduce((nodes, task, index) => {
    if (task.status === 'success') {
      const idOffset = 5

      // @ts-ignore
      nodes = [ ...nodes, {
        id: String(index + idOffset),
        position: { x: 500 + (index  * 250), y: 450 },
        data: {
          html: `<img src="synthcat.jpg" draggable="false" />`
        },
        width: 150,
        height: 150,
        bgColor: 'white',
        borderColor: 'transparent',
      } ]
    }
    return nodes
  }, [])

  return [
    {
      id: '1',
      position: { x: 500, y: 300 },
      data: {
        html: `<img src="synthcat.jpg" draggable="false" />`
      },
      width: 150,
      height: 150,
      bgColor: 'white',
      borderColor: 'transparent',
    },
    ...workflowOneNodes,
    ...workflowTwoNodes
  ]
})


export const edgeStore = derived(nodeStore, $nodeStore => {
  let edges: any[] = []
  const nodeIds = $nodeStore.map(node => node.id)

  if (nodeIds.includes('1') && nodeIds.includes('2')) {
    edges = [ ...edges, { id: 'e1-2', source: '1', target: '2', label: 'Crop', arrow: true } ]
  }

  if (nodeIds.includes('2') && nodeIds.includes('3')) {
    edges = [ ...edges, { id: 'e2-3', source: '2', target: '3', label: 'Rotate', arrow: true } ]
  }

  if (nodeIds.includes('1') && nodeIds.includes('7')) {
    edges = [ ...edges, { id: 'e1-7', source: '1', target: '7', label: 'Crop-Rotate-Grayscale', arrow: true, type: 'bezier' } ]
  }

  return edges
})