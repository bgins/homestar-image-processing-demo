<script lang="ts">
  import type { NodeType } from 'svelvet'
  import Svelvet from 'svelvet'

  const imageUrls = ['synthcat.jpg']

  function handleNodeClick(node: NodeType) {
    console.log(node)
  }

  const initialNodes = [
    {
      id: '1',
      position: { x: 500, y: 300 },
      data: {
        html: `<img src="${imageUrls[0]}" />`
      },
      width: 150,
      height: 150,
      bgColor: 'white',
      borderColor: 'transparent',
      clickCallback: handleNodeClick
    },
    {
      id: '2',
      position: { x: 750, y: 300 },
      data: { label: 'Ok' },
      width: 150,
      height: 150,
      bgColor: 'white',
      clickCallback: handleNodeClick
    },
    {
      id: '3',
      position: { x: 1000, y: 300 },
      data: { label: 'Processed output here' },
      width: 150,
      height: 150,
      bgColor: 'white',
      clickCallback: handleNodeClick
    },
    {
      id: '4',
      position: { x: 1250, y: 300 },
      data: { label: 'Nope' },
      width: 150,
      height: 150,
      bgColor: 'white',
      clickCallback: handleNodeClick
    }
  ]

  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', label: 'Crop', arrow: true },
    { id: 'e2-3', source: '2', target: '3', label: 'Rotate', arrow: true },
    { id: 'e3-4', source: '3', target: '4', label: 'Saturate', arrow: true }
  ]
</script>

<Svelvet
  nodes={initialNodes}
  edges={initialEdges}
  width={window.innerWidth}
  height={window.innerHeight}
  initialZoom={1.25}
  initialLocation={{ x: 0, y: 0 }}
  boundary={{ x: window.innerWidth, y: window.innerHeight }}
/>
