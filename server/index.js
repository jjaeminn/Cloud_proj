/*
  ════════════════════════════════════════════════════════════════
   현자의 프록시 — 학습 노트를 받아 LLM 으로 '수련 노드' 초안을 빚는다.
   API 키는 이 서버에만 숨겨두고, 프론트는 /api/summarize 만 부른다.

   provider-무관: LLM_PROVIDER 로 갈아끼운다 (기본 gemini, 무료 티어).
   실행:  npm run server     (skill-tree/.env 에 GEMINI_API_KEY 필요)
  ════════════════════════════════════════════════════════════════
*/
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '256kb' }))

const PORT = process.env.PORT || 8787
const PROVIDER = process.env.LLM_PROVIDER || 'gemini'

/*
  프론트가 원하는 스키마. 노트를 '여러 개의 수련 노드'로 쪼개 트리로 반환한다.
  각 노드는 key(임시 식별자)를 갖고, prerequisites 는 형제 노드의 key 또는
  '이미 존재하는 수련'의 id 를 가리킨다 → 이걸로 1→2→3 선행 사슬이 만들어진다.
*/
const NODE_SCHEMA = {
  type: 'object',
  properties: {
    nodes: {
      type: 'array',
      description: '학습 진도 순서대로 나눈 2~6개의 수련 노드',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', description: '이 노드의 임시 식별자 (예: n1, n2, n3)' },
          title: { type: 'string', description: '개념 이름(짧게, 판타지 색을 살짝)' },
          grade: { type: 'string', description: '예: "AI 강 · 소환"' },
          tagline: { type: 'string', description: '한 줄 시적 부제' },
          summary: { type: 'string', description: '마크다운(#, ##, - 목록, **굵게**, `코드`)' },
          checklist: { type: 'array', items: { type: 'string' }, description: '구체적 학습/실습 과제 2~4개' },
          prerequisites: {
            type: 'array',
            items: { type: 'string' },
            description: '선행 노드의 key(형제) 또는 기존 노드 id. 사슬의 첫 노드는 빈 배열.',
          },
        },
        required: ['key', 'title', 'summary', 'checklist'],
      },
    },
  },
  required: ['nodes'],
}

function buildPrompt(notes, existing) {
  const list = (existing || []).map((n) => `- ${n.id}: ${n.title}`).join('\n') || '(없음)'
  return `당신은 '고대 마법서: 대현자의 수련지도'의 사서(司書) 현자입니다.
학생이 오늘 공부한 노트를 바치면, 그 지식을 '학습 진도 순서대로 이어지는 여러 수련 노드'로 쪼개어 스킬트리에 심습니다.

[핵심 규칙 — 트리 구조화]
- 노트를 하나의 노드로 뭉치지 말고, 배우는 순서에 따라 2~6개의 노드로 나눈다 (기초 → 심화).
- 각 노드에는 고유한 key 를 부여한다 (n1, n2, n3 ...).
- 각 노드의 prerequisites 로 바로 앞 단계 노드의 key 를 넣어 1 → 2 → 3 사슬(또는 분기 트리)을 만든다. 사슬의 첫 노드는 빈 배열.
- 노트 전체가 정말 단일 개념이면 1개만 만들어도 된다.

[내용 규칙]
- 모든 텍스트는 한국어. 그리모어(중세 마법서) 어조를 은은히 섞되, 기술적 사실은 정확하게.
- title 은 개념의 이름(짧게). grade 는 "AI 강 · <키워드>" 형식.
- summary 는 마크다운: 첫 줄은 "# 제목", 그 다음 줄은 반드시 빈 줄, 이어 짧은 문단·목록(-)·**굵게**·\`코드\`.
- checklist 는 학생이 실제로 완수할 구체적 과제 2~4개.
- 사슬의 첫 노드는 아래 '이미 존재하는 수련' 목록 중 딛고 설 항목의 id 를 prerequisites 로 골라도 된다(선택). 애매하면 빈 배열.

[이미 존재하는 수련(선행 후보)]
${list}

[학생이 바친 노트]
${notes}`
}

/* ── provider: Gemini (Google AI Studio, 무료 티어) ───────────── */
async function callGemini(notes, existing) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('NO_KEY')
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(notes, existing) }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: NODE_SCHEMA,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GEMINI_${res.status}: ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('EMPTY_RESPONSE')
  return JSON.parse(text)
}

/*
  다른 provider 를 붙이려면 여기에 함수를 추가하고 switch 에 등록하면 끝.
  예) OpenAI 호환 엔드포인트:
    async function callOpenAI(notes, existing) {
      const res = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, {...})
      ...
      return JSON.parse(choice.message.content)
    }
*/
async function summarize(notes, existing) {
  switch (PROVIDER) {
    case 'gemini':
      return callGemini(notes, existing)
    default:
      throw new Error(`UNKNOWN_PROVIDER: ${PROVIDER}`)
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: PROVIDER, keyPresent: Boolean(process.env.GEMINI_API_KEY) })
})

app.post('/api/summarize', async (req, res) => {
  const { notes, existing } = req.body || {}
  if (!notes || typeof notes !== 'string' || notes.trim().length < 4) {
    return res.status(400).json({ error: 'BAD_INPUT', message: '노트 텍스트가 필요합니다.' })
  }
  try {
    const node = await summarize(notes.trim(), existing)
    res.json(node)
  } catch (err) {
    const code = err.message === 'NO_KEY' ? 503 : 502
    console.error('[summarize]', err.message)
    res.status(code).json({
      error: err.message === 'NO_KEY' ? 'NO_KEY' : 'LLM_ERROR',
      message:
        err.message === 'NO_KEY'
          ? 'GEMINI_API_KEY 가 설정되지 않았습니다. skill-tree/.env 를 확인하세요.'
          : '현자가 응답하지 못했습니다: ' + err.message,
    })
  }
})

app.listen(PORT, () => {
  console.log(`🜁 현자의 프록시가 http://localhost:${PORT} 에서 깨어났습니다 (provider=${PROVIDER})`)
  if (!process.env.GEMINI_API_KEY) {
    console.log('   ⚠  GEMINI_API_KEY 없음 — /api/summarize 는 503 을 돌려줍니다 (프론트는 로컬 목업으로 대체).')
  }
})
