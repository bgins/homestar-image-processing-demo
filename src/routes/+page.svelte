<script lang="ts">
  import type { NodeType } from 'svelvet'
  import { onDestroy } from 'svelte'
  import Svelvet from 'svelvet'

  import { connect } from '$lib/channel'
  import { edgeStore, nodeStore } from '../stores'
  import Controls from '$components/Controls.svelte'
  import Header from '$components/Header.svelte'
  import WorkflowDetail from '$components/WorkflowDetail.svelte'

  let nodes: any[] = []
  let edges: any[] = []
  let showWorkflowModal = false

  const unsubscribeNodeStore = nodeStore.subscribe(store => {
    nodes = store
  })

  const unsubscribeEdgeStore = edgeStore.subscribe(store => {
    edges = store
  })

  function toggleWorflowModal() {
    showWorkflowModal = !showWorkflowModal
  }

  // Connect to websocket server
  connect()

  onDestroy(() => {
    unsubscribeNodeStore()
    unsubscribeEdgeStore()
  })
</script>

<Header on:workflow={toggleWorflowModal} />
{#if showWorkflowModal}
  <WorkflowDetail />
{/if}
<Controls />
<Svelvet
  {nodes}
  {edges}
  width={window.innerWidth}
  height={window.innerHeight}
  initialZoom={1.25}
  initialLocation={{ x: 0, y: 0 }}
  boundary={{ x: window.innerWidth, y: window.innerHeight }}
/>
