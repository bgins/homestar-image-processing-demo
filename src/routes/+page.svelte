<script lang="ts">
  import type { NodeType } from 'svelvet'
  import Svelvet from 'svelvet'

  import { edgeStore, nodeStore } from '../stores'
  import Controls from '$components/Controls.svelte'
  import Header from '$components/Header.svelte'
  import { onDestroy } from 'svelte'

  function handleNodeClick(node: NodeType) {
    console.log(node)
  }

  let nodes: any[] = []
  let edges: any[] = []

  const unsubscribeNodeStore = nodeStore.subscribe(store => {
    nodes = store
  })

  const unsubscribeEdgeStore = edgeStore.subscribe(store => {
    edges = store
  })

  onDestroy(() => {
    unsubscribeNodeStore()
    unsubscribeEdgeStore()
  })
</script>

<Header />
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
