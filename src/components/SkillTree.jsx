import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
} from '@xyflow/react'
import SkillNode from './SkillNode'

const nodeTypes = { skill: SkillNode }

/*
  하드코딩 데이터를 React Flow 가 이해하는 nodes/edges 로 변환한다.
  선행관계(prerequisites)가 그대로 엣지가 되고,
  엣지의 className 은 대상 노드의 상태를 따른다(완료=금선, 봉인=점선).
*/
export default function SkillTree({
  nodes: data,
  statusById,
  selectedId,
  bloomedId,
  onSelect,
  onDelete,
  onConnect,
  onEdgeClick,
}) {
  const rfNodes = useMemo(
    () =>
      data.map((n) => ({
        id: n.id,
        type: 'skill',
        position: n.position,
        data: {
          title: n.title,
          grade: n.grade,
          tagline: n.tagline,
          status: statusById[n.id],
          selected: selectedId === n.id,
          justBloomed: bloomedId === n.id,
          onDelete: () => onDelete?.(n.id),
        },
        draggable: false,
      })),
    [data, statusById, selectedId, bloomedId, onDelete],
  )

  const rfEdges = useMemo(() => {
    const present = new Set(data.map((n) => n.id))
    const edges = []
    for (const n of data) {
      for (const p of n.prerequisites) {
        if (!present.has(p)) continue // 삭제된 선행 노드로 향하는 엣지는 건너뛴다
        const targetStatus = statusById[n.id]
        const cls =
          targetStatus === 'locked'
            ? 'locked'
            : statusById[p] === 'completed'
              ? 'completed'
              : ''
        edges.push({
          id: `${p}->${n.id}`,
          source: p,
          target: n.id,
          type: 'default',
          className: cls,
          animated: cls === 'completed',
        })
      }
    }
    return edges
  }, [data, statusById])

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onSelect(node.id)}
      onPaneClick={() => onSelect(null)}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.4}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      nodesConnectable
      edgesFocusable
      deleteKeyCode={null}
      elementsSelectable
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={26}
        size={1.4}
        color="#b39a6b"
      />
      <Controls
        showInteractive={false}
        className="!border !border-gold-600/40 !bg-grim-800/80 !shadow-lg [&_button]:!border-gold-600/20 [&_button]:!bg-grim-700 [&_button]:!fill-gold-300 [&_button:hover]:!bg-grim-600"
      />
    </ReactFlow>
  )
}
