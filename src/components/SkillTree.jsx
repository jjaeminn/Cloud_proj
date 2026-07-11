import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  SelectionMode,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react'
import SkillNode from './SkillNode'

const nodeTypes = { skill: SkillNode }

/* 우클릭(버튼 2)으로만 캔버스를 팬한다 → 좌클릭 드래그는 박스 선택에 쓰인다 */
const PAN_BUTTONS = [2]

/*
  하드코딩 데이터를 React Flow 가 이해하는 nodes/edges 로 변환한다.
  선행관계(prerequisites)가 그대로 엣지가 되고,
  엣지의 className 은 대상 노드의 상태를 따른다(완료=금선, 봉인=점선).

  마우스 조작:
   · 좌클릭(노드)        → 선택
   · 좌클릭 드래그(노드) → 노드 이동 (여러 개 선택했으면 함께 이동)
   · 좌클릭 드래그(빈 곳) → 박스 선택 (걸친 노드 다중 선택)
   · 우클릭 드래그        → 캔버스 팬
*/
export default function SkillTree({
  nodes: data,
  statusById,
  selectedIds,
  bloomedId,
  fitKey,
  onSelectChanges,
  onPaneClick,
  onNodesPersist,
  onDelete,
  onConnect,
  onEdgeClick,
}) {
  /* 패널을 접거나 펼쳐 지도 크기가 달라지면 남는 공간에 맞춰 부드럽게 재정렬 */
  const rf = useReactFlow()
  const firstFit = useRef(true)
  useEffect(() => {
    if (firstFit.current) {
      firstFit.current = false
      return
    }
    const t = setTimeout(() => rf.fitView({ padding: 0.25, duration: 450 }), 120)
    return () => clearTimeout(t)
  }, [fitKey, rf])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  /*
    성능: 노드/데이터 객체를 id 별로 캐시해 "바뀌지 않은 노드"는 참조 동일성을 유지한다.
    memo(SkillNode) 와 짝을 이뤄, 한 노드를 옮기거나 고를 때 그 노드만 리렌더된다.
    (이건 "우리 데이터 → React Flow 노드" 로 파생하는 base 값이다)
  */
  const cache = useRef(new Map())
  const derived = useMemo(() => {
    const c = cache.current
    const out = data.map((n) => {
      const status = statusById[n.id]
      const isSelected = selectedSet.has(n.id)
      const justBloomed = bloomedId === n.id
      const prev = c.get(n.id)

      const dataUnchanged =
        prev &&
        prev.title === n.title &&
        prev.grade === n.grade &&
        prev.tagline === n.tagline &&
        prev.status === status &&
        prev.selected === isSelected &&
        prev.justBloomed === justBloomed &&
        prev.onDelete === onDelete

      const nodeData = dataUnchanged
        ? prev.data
        : {
            title: n.title,
            grade: n.grade,
            tagline: n.tagline,
            status,
            selected: isSelected,
            justBloomed,
            onDelete: () => onDelete?.(n.id),
          }

      c.set(n.id, {
        title: n.title,
        grade: n.grade,
        tagline: n.tagline,
        status,
        selected: isSelected,
        justBloomed,
        onDelete,
        data: nodeData,
      })
      return {
        id: n.id,
        type: 'skill',
        position: n.position,
        selected: isSelected,
        data: nodeData,
      }
    })

    const alive = new Set(data.map((n) => n.id))
    for (const id of [...c.keys()]) if (!alive.has(id)) c.delete(id)
    return out
  }, [data, statusById, selectedSet, bloomedId, onDelete])

  /*
    React Flow 가 실제로 렌더하는 노드 상태는 우리가 로컬로 소유한다.
    이래야 React Flow 가 붙이는 measured(측정 크기)·dragging 같은 내부 필드가
    보존된다. 예전엔 매 변경마다 새 객체를 통째로 만들어 넘겨서 measured 가 사라지고
    노드가 visibility:hidden 으로 사라졌다.
  */
  const [rfNodes, setRfNodes] = useState(derived)
  const rfNodesRef = useRef(rfNodes)
  rfNodesRef.current = rfNodes

  /*
    파생 데이터가 바뀌면 로컬 상태에 반영하되, React Flow 가 붙인
    measured/internals 는 이어받는다.

    좌표는 함정이다: 선택/상태 변경으로 이 effect 가 도는 순간 파생 좌표(=저장된 값)로
    덮으면, 드래그 중인 라이브 좌표가 원위치로 튄다. 그래서 "파생 좌표가 실제로
    바뀐 노드"(추가·초기화·드래그 종료 후 저장 반영)만 파생 좌표를 적용하고,
    그 외엔 로컬(라이브) 좌표를 보존한다.
  */
  const lastDerivedPos = useRef(new Map())
  useEffect(() => {
    setRfNodes((prev) => {
      const prevById = new Map(prev.map((n) => [n.id, n]))
      const seen = new Set()
      const merged = derived.map((d) => {
        seen.add(d.id)
        const old = prevById.get(d.id)
        const last = lastDerivedPos.current.get(d.id)
        lastDerivedPos.current.set(d.id, d.position)
        if (!old) return d
        const externalMove = !last || last.x !== d.position.x || last.y !== d.position.y
        return {
          ...old,
          data: d.data,
          selected: d.selected,
          position: externalMove ? d.position : old.position,
          measured: old.measured,
          width: old.width,
          height: old.height,
        }
      })
      for (const id of [...lastDerivedPos.current.keys()]) if (!seen.has(id)) lastDerivedPos.current.delete(id)
      return merged
    })
  }, [derived])

  /* 엣지는 좌표와 무관하다(그래프 모양 + 상태에만 의존) → graphSig 로만 memo */
  const dataRef = useRef(data)
  dataRef.current = data
  const statusRef = useRef(statusById)
  statusRef.current = statusById

  const graphSig = useMemo(
    () => data.map((n) => `${n.id}>${n.prerequisites.join(',')}:${statusById[n.id]}`).join('|'),
    [data, statusById],
  )

  const rfEdges = useMemo(() => {
    const d = dataRef.current
    const s = statusRef.current
    const present = new Set(d.map((n) => n.id))
    const edges = []
    for (const n of d) {
      for (const p of n.prerequisites) {
        if (!present.has(p)) continue // 삭제된 선행 노드로 향하는 엣지는 건너뛴다
        const cls = s[n.id] === 'locked' ? 'locked' : s[p] === 'completed' ? 'completed' : ''
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
    // graphSig 가 같으면 엣지도 같다
  }, [graphSig])

  /*
    React Flow 의 변경을 applyNodeChanges 로 적용한다 — measured/dragging 등 내부
    필드를 보존해 노드가 사라지지 않는다. 선택 변경만 부모에도 알려준다.
    (드래그 중 좌표는 로컬에서만 갱신하고, 저장은 드래그 종료 시 한 번)
  */
  const handleNodesChange = useCallback(
    (changes) => {
      setRfNodes((nds) => applyNodeChanges(changes, nds))
      const selects = changes.filter((c) => c.type === 'select')
      if (selects.length) onSelectChanges?.(selects)
    },
    [onSelectChanges],
  )

  /*
    드래그가 끝나면 옮긴 노드의 최종 좌표를 저장한다.
    React Flow 가 콜백으로 주는 nodes(움직인 노드들)를 쓴다 — 로컬 state 는 아직
    flush 전이라 ref 를 읽으면 옛 좌표가 잡힌다. (다중 선택 드래그는 nodes 에 전부 담김)
  */
  const handleNodeDragStop = useCallback(
    (_event, _node, nodes) => {
      const moved = nodes && nodes.length ? nodes : rfNodesRef.current
      onNodesPersist?.(moved.map((n) => ({ id: n.id, position: n.position })))
    },
    [onNodesPersist],
  )

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      onNodeDragStop={handleNodeDragStop}
      onPaneClick={onPaneClick}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.4}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      /* ── 마우스 조작 ─────────────────────────── */
      nodesDraggable
      nodesConnectable
      elementsSelectable
      edgesFocusable
      panOnDrag={PAN_BUTTONS} /* 우클릭 드래그로만 팬 */
      selectionOnDrag /* 좌클릭 드래그 = 박스 선택 */
      selectionMode={SelectionMode.Partial} /* 박스에 걸치기만 해도 선택 */
      selectNodesOnDrag={false}
      deleteKeyCode={null}
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
