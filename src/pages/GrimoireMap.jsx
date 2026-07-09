import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Header from '../components/Header'
import SkillTree from '../components/SkillTree'
import DetailPanel from '../components/DetailPanel'
import Legend from '../components/Legend'
import { useSkillTree } from '../hooks/useSkillTree'

export default function GrimoireMap() {
  const { nodes, statusById, toggleCheck, completeNode, addNodes, deleteNode, stats } =
    useSkillTree()
  const [selectedId, setSelectedId] = useState('firewall')
  const [bloomedId, setBloomedId] = useState(null)

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

  const selected = nodes.find((n) => n.id === selectedId) || null

  /* AI가 심은 노드 사슬을 트리에 추가하고, 뿌리 노드를 선택 상태로 옮긴다 */
  const handleCreateNodes = useCallback(
    (drafts) => {
      const ids = addNodes(drafts)
      if (ids.length) setSelectedId(ids[0])
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
      setSelectedId((cur) => (cur === id ? null : cur))
    },
    [deleteNode],
  )

  /* 프록시에 넘길 기존 노드 목록(선행 추론용) */
  const existingList = nodes.map((n) => ({ id: n.id, title: n.title }))

  return (
    <div className="flex h-screen flex-col">
      <Header stats={stats} />

      <main className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr] gap-3 p-3 lg:grid-cols-[1fr_440px]">
        {/* 좌 · 지식의 지도 */}
        <section className="relative min-h-0 overflow-hidden rounded-2xl border border-gold-600/35 parchment">
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-gold-600/40 bg-grim-900/80 px-4 py-1.5 text-[11px] text-parchment/75 backdrop-blur">
            🜁 수련의 룬을 누르시면 기록과 비약 완수 퀘스트가 해금됩니다.
          </div>
          <div className="absolute inset-0">
            <ReactFlowProvider>
              <SkillTree
                nodes={nodes}
                statusById={statusById}
                selectedId={selectedId}
                bloomedId={bloomedId}
                onSelect={setSelectedId}
                onDelete={handleDelete}
              />
            </ReactFlowProvider>
          </div>
          <Legend />
        </section>

        {/* 우 · 수련서 */}
        <DetailPanel
          node={selected}
          status={selected ? statusById[selected.id] : null}
          onToggle={(id) => toggleCheck(id)}
          onComplete={completeNode}
          onDelete={handleDelete}
          existing={existingList}
          onCreateNodes={handleCreateNodes}
        />
      </main>
    </div>
  )
}
