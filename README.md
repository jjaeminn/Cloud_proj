# 고대 마법서: 대현자의 수련지도 (Skill-Tree)

학습 노트를 요약해 **지식의 스킬트리**로 펼쳐 보여주는 앱.
노드 = 퀘스트, 노드 내용 = 공부 정리, 개화(황금 로터스) = 완료 연출.

## 스택

- **Vite + React (JS)** — 프론트 뼈대
- **React Router** — 소개 페이지(`/`) ↔ 수련지도(`/map`) 라우팅
- **Tailwind CSS v4** (`@tailwindcss/vite`) — 스타일
- **React Flow** (`@xyflow/react`) — 스킬트리(줌·팬·연결선)
- 순수 CSS `@keyframes` — 개화 애니메이션 (라이브러리 없음)
- **localStorage** — 완료(체크) 상태 저장
- **Express + Gemini** — 노트 → 스킬 노드 요약 프록시

## 실행

```bash
npm install

# 터미널 1 — 프론트
npm run dev            # http://localhost:5173

# 터미널 2 — 현자의 LLM 프록시 (AI 탭용)
cp .env.example .env   # GEMINI_API_KEY 채우기
npm run server         # http://localhost:8787
```

> 프록시(`npm run server`)를 켜지 않아도 앱은 동작한다.
> AI 탭은 프록시가 없으면 **로컬 목업**으로 대체되고, 있으면 실제 LLM 요약을 사용한다.
> 키는 `AIStudio → https://aistudio.google.com/apikey` 에서 무료로 발급.

## 구조

```
src/
├─ App.jsx                라우터 (/ → 소개, /map → 수련지도)
├─ pages/
│  ├─ Landing.jsx         소개 페이지(기능 · 작동 원리 · 기술 스택 · 진입 버튼)
│  └─ GrimoireMap.jsx     수련지도 본체(레이아웃 · 개화 · 선택 · 삭제)
├─ data/skillTree.js      하드코딩 수련 데이터(요약·위치·체크리스트)
├─ hooks/useSkillTree.js  localStorage + 상태 파생(completed/available/locked)
├─ components/
│  ├─ Header.jsx          서명 · 학기 숙련도 프로그레스 (로고 → 소개로 이동)
│  ├─ SkillTree.jsx       React Flow 캔버스(노드/엣지 변환)
│  ├─ SkillNode.jsx       커스텀 노드(로터스 / 구슬 / 봉인)
│  ├─ Lotus.jsx           황금 로터스 개화 SVG + 섬광·불티
│  ├─ DetailPanel.jsx     우측 수련서(3탭: 일지 · 직접 새기기 · 현자 AI)
│  ├─ AiSprout.jsx        "현자의 가지심기" — 노트 → /api/summarize → 트리에 심기
│  ├─ ManualNode.jsx      "직접 새기기" — 폼으로 노드 손수 생성(선행 선택 포함)
│  ├─ Markdown.jsx        요약본용 초경량 마크다운 렌더러
│  └─ Legend.jsx          지도 하단 범례
server/index.js           Express + LLM 프록시(provider-무관, 기본 Gemini)
```

## 상태 모델

노드의 `status`는 저장하지 않고 파생한다:

- 체크리스트가 전부 `done` → **completed** (로터스 만개)
- `prerequisites`가 전부 completed → **available** (도전 가능, 맥동 구슬)
- 그 외 → **locked** (봉인, 점선 엣지)

`prerequisites`가 곧 React Flow 엣지, `position`이 노드 좌표.

## 노드를 만드는 3가지 방법

1. **현자 (AI)** — 노트를 붙여 넣으면 여러 단계로 자동 분해·연결 (아래 파이프라인)
2. **직접 새기기** — 제목·요약·체크리스트·선행 수련을 폼으로 입력해 손수 생성
3. **드래그 연결** — 지도에서 노드 우측 점을 끌어 다른 노드에 이으면 선행관계 생성.
   연결선을 클릭하면 끊긴다. 기본 커리큘럼 노드까지 자유롭게 잇고 끊을 수 있다.
   - 추가/해제한 연결은 `grimoire.links` / `grimoire.unlinks` 로 저장되고,
     `useSkillTree` 가 `(기본 선행 ∪ 직접 연결) − 끊은 연결` 로 병합한다. 순환은 자동 거부.

## AI 파이프라인 (텍스트 → 스킬트리)

1. AI 탭에 강의 노트를 붙여 넣고 **"지식의 가지 심기"** 클릭
2. 프론트가 `POST /api/summarize` 로 노트 + 기존 노드 목록(선행 추론용)을 보냄
3. `server/index.js` 가 API 키를 숨긴 채 LLM(Gemini)을 호출, 아래 스키마로 강제 출력:

```jsonc
{ "title", "grade", "tagline", "summary" /* 마크다운 */,
  "checklist": ["..."], "prerequisites": ["기존 노드 id", ...] }
```

4. `useSkillTree.addNode()` 가 위치를 자동 계산해 트리에 심고, 곧바로 선택 상태로 옮김
5. 완수 상태·심은 노드는 `localStorage` 에 저장되어 새로고침해도 유지

### provider 교체

`server/index.js` 의 `summarize()` `switch` 에 함수 하나만 추가하면 된다.
`LLM_PROVIDER` 환경변수로 선택 (기본 `gemini`). OpenAI 호환 엔드포인트 예시는
파일 안 주석 참고.

### Vite 프록시

`vite.config.js` 가 `/api/*` 를 `http://localhost:8787` 로 넘긴다 —
개발 중엔 CORS 걱정 없이 같은 오리진처럼 쓰인다.
