import { useCallback, useMemo, useState } from 'react'
import { INITIAL_NODES } from '../data/skillTree'

const PROGRESS_KEY = 'grimoire.progress.v1'
const CUSTOM_KEY = 'grimoire.custom.v1'
const DELETED_KEY = 'grimoire.deleted.v1'
const LINKS_KEY = 'grimoire.links.v1' // 직접 그은 연결(추가 선행)
const UNLINKS_KEY = 'grimoire.unlinks.v1' // 끊은 연결(기본 선행 포함)

/* localStorage 저장소들 */
function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 사서의 서고가 가득 찼다 — 조용히 넘긴다 */
  }
}

function slugify(title, taken) {
  let base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'branch'
  let id = base
  let i = 2
  while (taken.has(id)) id = `${base}-${i++}`
  return id
}

const ekey = (s, t) => `${s}${t}`

export function useSkillTree() {
  const [progress, setProgress] = useState(() => load(PROGRESS_KEY) || {})
  const [custom, setCustom] = useState(() => load(CUSTOM_KEY) || [])
  const [deleted, setDeleted] = useState(() => load(DELETED_KEY) || [])
  const [links, setLinks] = useState(() => load(LINKS_KEY) || [])
  const [unlinks, setUnlinks] = useState(() => load(UNLINKS_KEY) || [])

  /*
    기본 노드 + AI/직접 노드 − 삭제된 노드.
    각 노드의 prerequisites 는 (기본 선행 ∪ 직접 그은 연결) − 끊은 연결 로 병합한다.
  */
  const nodes = useMemo(() => {
    const gone = new Set(deleted)
    const base = [...INITIAL_NODES, ...custom].filter((n) => !gone.has(n.id))
    const unlinkSet = new Set(unlinks.map((e) => ekey(e.source, e.target)))
    const extra = {} // target → [source, ...]
    for (const e of links) (extra[e.target] ||= []).push(e.source)

    return base.map((node) => {
      const merged = [...new Set([...(node.prerequisites || []), ...(extra[node.id] || [])])].filter(
        (p) => !unlinkSet.has(ekey(p, node.id)),
      )
      return {
        ...node,
        prerequisites: merged,
        checklist: node.checklist.map((c) => ({ ...c, done: progress[c.id] ?? c.done })),
      }
    })
  }, [progress, custom, deleted, links, unlinks])

  /* 선행 노드가 삭제됐으면 무시 (남은 선행만 따진다) */
  const statusById = useMemo(() => {
    const present = new Set(nodes.map((n) => n.id))
    const completed = {}
    for (const n of nodes) {
      completed[n.id] = n.checklist.length > 0 && n.checklist.every((c) => c.done)
    }
    const status = {}
    for (const n of nodes) {
      const prereqs = n.prerequisites.filter((p) => present.has(p))
      if (completed[n.id]) status[n.id] = 'completed'
      else if (prereqs.every((p) => completed[p])) status[n.id] = 'available'
      else status[n.id] = 'locked'
    }
    return status
  }, [nodes])

  const toggleCheck = useCallback((checkId, forced) => {
    setProgress((prev) => {
      const next = { ...prev, [checkId]: forced ?? !prev[checkId] }
      save(PROGRESS_KEY, next)
      return next
    })
  }, [])

  const completeNode = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return
      setProgress((prev) => {
        const next = { ...prev }
        node.checklist.forEach((c) => {
          next[c.id] = true
        })
        save(PROGRESS_KEY, next)
        return next
      })
    },
    [nodes],
  )

  /*
    노드 배열(AI 사슬 또는 직접 만든 단일 노드)을 한꺼번에 트리에 심는다.
    draft.key → 최종 id 매핑, prerequisites 의 형제 key/기존 id 해석, 위상 순서 배치.
  */
  const addNodes = useCallback(
    (drafts) => {
      const list = (Array.isArray(drafts) ? drafts : [drafts]).filter(Boolean)
      if (list.length === 0) return []

      const taken = new Set(nodes.map((n) => n.id))
      const keyMap = {}
      const prepared = list.map((draft) => {
        const id = slugify(draft.title || 'branch', taken)
        taken.add(id)
        if (draft.key) keyMap[draft.key] = id
        return { draft, id }
      })

      const resolved = {}
      for (const { draft, id } of prepared) {
        const rp = (draft.prerequisites || [])
          .map((p) => keyMap[p] || p)
          .filter((p) => taken.has(p) && p !== id)
        resolved[id] = [...new Set(rp)]
      }

      const placed = {}
      const posOf = (id) => {
        if (placed[id]) return placed[id]
        const n = nodes.find((x) => x.id === id)
        return n ? n.position : null
      }
      const allPositions = () => [...nodes.map((n) => n.position), ...Object.values(placed)]

      const out = []
      const remaining = [...prepared]
      let guard = 0
      while (remaining.length && guard++ < 200) {
        let idx = remaining.findIndex(({ id }) => resolved[id].every((p) => posOf(p)))
        if (idx < 0) idx = 0
        const { draft, id } = remaining.splice(idx, 1)[0]

        const prereqPos = resolved[id].map((p) => posOf(p)).filter(Boolean)
        let x, y
        if (prereqPos.length) {
          x = Math.max(...prereqPos.map((p) => p.x)) + 310
          y = Math.round(prereqPos.reduce((s, p) => s + p.y, 0) / prereqPos.length)
        } else {
          x = 40
          const ys = allPositions().map((p) => p.y)
          y = (ys.length ? Math.max(...ys) : 0) + 200
        }
        let g = 0
        while (
          allPositions().some((p) => Math.abs(p.x - x) < 220 && Math.abs(p.y - y) < 120) &&
          g++ < 40
        ) {
          y += 150
        }
        placed[id] = { x, y }

        const checklist = (draft.checklist || []).map((c, i) => ({
          id: `${id}-c${i}`,
          text: typeof c === 'string' ? c : c.text,
          done: false,
        }))
        out.push({
          id,
          grade: draft.grade || 'AI 강 · 가지심기',
          title: draft.title || '이름 없는 비술',
          tagline: draft.tagline || '현자가 틔운 새로운 수련 가지',
          prerequisites: resolved[id],
          position: { x, y },
          summary: draft.summary || '',
          checklist: checklist.length
            ? checklist
            : [{ id: `${id}-c0`, text: '핵심 개념 정리', done: false }],
          ai: !draft.manual,
        })
      }

      setCustom((prev) => {
        const next = [...prev, ...out]
        save(CUSTOM_KEY, next)
        return next
      })
      return out.map((n) => n.id)
    },
    [nodes],
  )

  const deleteNode = useCallback((id) => {
    setCustom((prev) => {
      const next = prev.filter((n) => n.id !== id)
      save(CUSTOM_KEY, next)
      return next
    })
    setDeleted((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      save(DELETED_KEY, next)
      return next
    })
  }, [])

  /*
    직접 연결: source 를 target 의 선행으로 잇는다 (엣지 source→target).
    순환(cycle)이 생기면 거부한다.
  */
  const linkNodes = useCallback(
    (source, target) => {
      if (!source || !target || source === target) return
      const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
      if (!byId[source] || !byId[target]) return
      // 이미 존재하는 선행이면 무시
      if (byId[target].prerequisites.includes(source)) return
      // source 가 (이행적으로) target 에 의존하면 순환 → 거부
      const reaches = (a, b, seen = new Set()) => {
        for (const p of byId[a]?.prerequisites || []) {
          if (p === b) return true
          if (!seen.has(p)) {
            seen.add(p)
            if (reaches(p, b, seen)) return true
          }
        }
        return false
      }
      if (reaches(source, target)) return

      setLinks((prev) => {
        if (prev.some((e) => e.source === source && e.target === target)) return prev
        const next = [...prev, { source, target }]
        save(LINKS_KEY, next)
        return next
      })
      setUnlinks((prev) => {
        const next = prev.filter((e) => !(e.source === source && e.target === target))
        if (next.length !== prev.length) save(UNLINKS_KEY, next)
        return next
      })
    },
    [nodes],
  )

  /* 연결 끊기: 직접 연결은 제거, 기본 선행은 unlink 로 가린다 */
  const unlinkNodes = useCallback((source, target) => {
    setLinks((prev) => {
      const next = prev.filter((e) => !(e.source === source && e.target === target))
      if (next.length !== prev.length) save(LINKS_KEY, next)
      return next
    })
    setUnlinks((prev) => {
      if (prev.some((e) => e.source === source && e.target === target)) return prev
      const next = [...prev, { source, target }]
      save(UNLINKS_KEY, next)
      return next
    })
  }, [])

  const stats = useMemo(() => {
    const total = nodes.length
    const done = nodes.filter((n) => statusById[n.id] === 'completed').length
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [nodes, statusById])

  return {
    nodes,
    statusById,
    toggleCheck,
    completeNode,
    addNodes,
    deleteNode,
    linkNodes,
    unlinkNodes,
    stats,
  }
}
