import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Header from '../components/Header'
import SkillTree from '../components/SkillTree'
import DetailPanel from '../components/DetailPanel'
import Legend from '../components/Legend'
import { useSkillTree } from '../hooks/useSkillTree'

export default function GrimoireMap() {
  const {
    nodes,
    statusById,
    toggleCheck,
    completeNode,
    addNodes,
    deleteNode,
    linkNodes,
    unlinkNodes,
    savePositions,
    stats,
  } = useSkillTree()

  /* 다중 선택 — 박스 드래그로 여러 노드를 한 번에 고를 수 있다 */
  const [selectedIds, setSelectedIds] = useState(['firewall'])
  const [bloomedId, setBloomedId] = useState(null)
  const [panelOpen, setPanelOpen] = useState(true)

  const prevStatus = useRef(statusById)

  /* handleDelete 가 deps 없이 최신 nodes 를 읽도록 ref 로 들고 있는다 */
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  /* 어떤 노드가 이제 막 completed 로 바뀌면 그 위에서 개화 연출을 터뜨린다 */
  useEffect(() => {
    for (const n of nodes) {
      const was = prevStatus.current[n.id]
      const now = statusById[n.id]
      if (was && was !== 'completed' && now === 'completed') {
        setBloomedId(n.id)
        const t = setTimeout(() => setBloomedId(null), 1600)
        prevStatus.current = statusById
        return () => clearTimeout(t)
      }
    }
    prevStatus.current = statusById
  }, [statusById, nodes])

  /* 수련서 패널엔 선택된 것 중 첫 노드를 펼친다 */
  const selected = nodes.find((n) => n.id === selectedIds[0]) || null

  /*
    React Flow 가 알려주는 선택 변경을 반영한다.
    노드를 새로 고르면(=selected:true 가 하나라도 있으면) 수련서를 자동으로 펼친다.
  */
  const handleSelectChanges = useCallback((changes) => {
    setSelectedIds((prev) => {
      const s = new Set(prev)
      for (const c of changes) {
        if (c.selected) s.add(c.id)
        else s.delete(c.id)
      }
      return [...s]
    })
    if (changes.some((c) => c.selected)) setPanelOpen(true)
  }, [])

  /* 빈 곳을 클릭하면 선택 해제 (패널은 그대로 둔다) */
  const handlePaneClick = useCallback(() => setSelectedIds([]), [])

  /* 드래그가 끝나면 옮긴 좌표를 저장 */
  const handleNodesPersist = useCallback((updates) => savePositions(updates), [savePositions])

  /* AI가 심은 노드 사슬을 트리에 추가하고, 뿌리 노드를 선택 상태로 옮긴다 */
  const handleCreateNodes = useCallback(
    (drafts) => {
      const ids = addNodes(drafts)
      if (ids.length) setSelectedIds([ids[0]])
      return ids
    },
    [addNodes],
  )

  /*
    특정 노드를 지도에서 지운다 (확인 후).
    useCallback 으로 안정적인 참조를 유지해야 React Flow 노드가 매 렌더마다
    재생성되어 엣지 렌더링이 깨지는 것을 막을 수 있다.
  */
  const handleDelete = useCallback(
    (id) => {
      const node = nodesRef.current.find((n) => n.id === id)
      const label = node ? `「${node.title}」` : '이 수련'
      if (!window.confirm(`${label} 룬을 지도에서 지울까요?`)) return
      deleteNode(id)
      setSelectedIds((cur) => cur.filter((s) => s !== id))
    },
    [deleteNode],
  )

  /* 드래그로 노드끼리 직접 연결 (source → target 선행관계) */
  const handleConnect = useCallback(
    (c) => c.source && c.target && linkNodes(c.source, c.target),
    [linkNodes],
  )

  /* 연결선을 클릭하면 끊는다 */
  const handleEdgeClick = useCallback(
    (_e, edge) => {
      if (window.confirm('이 선행 연결을 끊을까요?')) unlinkNodes(edge.source, edge.target)
    },
    [unlinkNodes],
  )

  /* 프록시/폼에 넘길 기존 노드 목록(선행 선택·추론용) */
  const existingList = nodes.map((n) => ({ id: n.id, title: n.title }))

  return (
    <div className="flex h-screen flex-col">
      <Header stats={stats} />

      <main
        className={`grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr] gap-3 p-3 ${
          panelOpen ? 'lg:grid-cols-[1fr_420px]' : 'lg:grid-cols-1'
        }`}
      >
        {/* 좌 · 지식의 지도 */}
        <section className="relative min-h-0 overflow-hidden rounded-2xl border border-gold-600/35 parchment">
          {/* backdrop-blur 는 팬/드래그 중 매 프레임 재블러 → 렉. 불투명 배경으로 대체 */}
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-gold-600/40 bg-grim-900/95 px-4 py-1.5 text-[11px] text-parchment/75">
            🜁 좌클릭 드래그로 노드 이동·범위 선택 · 우클릭 드래그로 지도 이동 · 선 클릭해 끊기
          </div>

          {/* 우클릭을 팬 조작으로 쓰므로 브라우저 컨텍스트 메뉴는 막는다 */}
          <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()}>
            <ReactFlowProvider>
              <SkillTree
                nodes={nodes}
                statusById={statusById}
                selectedIds={selectedIds}
                bloomedId={bloomedId}
                fitKey={panelOpen}
                onSelectChanges={handleSelectChanges}
                onPaneClick={handlePaneClick}
                onNodesPersist={handleNodesPersist}
                onDelete={handleDelete}
                onConnect={handleConnect}
                onEdgeClick={handleEdgeClick}
              />
            </ReactFlowProvider>
          </div>

          {/* 패널이 접혔을 때 다시 펼치는 손잡이 (우측 가장자리) */}
          {!panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="fade-up absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl border border-gold-500/50 bg-grim-800 px-2 py-3 font-display text-[11px] tracking-widest text-gold-300 shadow-lg transition hover:bg-grim-700"
              title="수련서 펼치기"
            >
              <span className="text-base">📖</span>
              <span className="[writing-mode:vertical-rl]">수련서 펼치기</span>
            </button>
          )}

          <Legend />
        </section>

        {/* 우 · 수련서 */}
        {panelOpen && (
          <div className="slide-in min-h-0">
            <DetailPanel
              node={selected}
              status={selected ? statusById[selected.id] : null}
              selectedCount={selectedIds.length}
              onToggle={(id) => toggleCheck(id)}
              onComplete={completeNode}
              onDelete={handleDelete}
              onCollapse={() => setPanelOpen(false)}
              existing={existingList}
              onCreateNodes={handleCreateNodes}
            />
          </div>
        )}
      </main>
    </div>
  )
}
