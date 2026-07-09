/*
  최소 마크다운 렌더러 — 요약본에 쓰는 #, ##, **굵게**, `코드`, - 목록만 다룬다.
  라이브러리 없이 양피지 톤에 맞춰 직접 그린다.
*/

function renderInline(text, keyBase) {
  // **bold** 와 `code` 를 토큰으로 쪼갠다
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-bold text-gold-600">
          {p.slice(2, -2)}
        </strong>
      )
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return (
        <code
          key={`${keyBase}-${i}`}
          className="rounded bg-grim-800/10 px-1.5 py-0.5 font-mono text-[0.82em] text-grim-700"
          style={{ fontFamily: 'ui-monospace, monospace' }}
        >
          {p.slice(1, -1)}
        </code>
      )
    }
    return <span key={`${keyBase}-${i}`}>{p}</span>
  })
}

export default function Markdown({ text }) {
  const lines = text.split('\n')
  const blocks = []
  let list = null

  const flushList = () => {
    if (list) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 space-y-1.5 pl-1">
          {list.map((item, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink">
              <span className="mt-[3px] text-gold-500">✦</span>
              <span>{renderInline(item, `li-${i}`)}</span>
            </li>
          ))}
        </ul>,
      )
      list = null
    }
  }

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd()
    if (/^\s*[-*]\s+/.test(line)) {
      list = list || []
      list.push(line.replace(/^\s*[-*]\s+/, ''))
      return
    }
    flushList()
    if (line.startsWith('## ')) {
      blocks.push(
        <h3
          key={idx}
          className="mt-4 mb-1.5 font-display text-[15px] font-bold tracking-wide text-grim-700"
        >
          {renderInline(line.slice(3), `h3-${idx}`)}
        </h3>,
      )
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h2
          key={idx}
          className="mb-2 font-display text-lg font-extrabold tracking-wide text-grim-800"
        >
          {renderInline(line.slice(2), `h2-${idx}`)}
        </h2>,
      )
    } else if (line === '') {
      // 빈 줄 — 목록 종료 외에는 무시
    } else {
      blocks.push(
        <p key={idx} className="my-1.5 text-[13px] leading-relaxed text-ink">
          {renderInline(line, `p-${idx}`)}
        </p>,
      )
    }
  })
  flushList()

  return <div>{blocks}</div>
}
