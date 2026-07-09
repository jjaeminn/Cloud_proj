/*
  실제 수련 데이터 — 리눅스 서버·네트워크 인프라 한 학기 과정.
  한 노드 = 하나의 퀘스트:  요약(1단계) · 트리 위치(2단계) · 체크리스트(3단계)

  status 는 파생값이라 여기 저장하지 않는다.
   · 체크리스트가 전부 done  → completed (황금 로터스 만개)
   · prerequisites 가 전부 completed → available (도전 가능)
   · 그 외 → locked (고대 봉인)

  4단 레이어(x축)로 좌→우 흐른다:
   0: 리눅스 · 네트워크   1: SSH · DNS · OCI
   2: BIND · 방화벽       3: Nginx · 메일
*/

export const INITIAL_NODES = [
  // ── Layer 0 ─────────────────────────────────
  {
    id: 'linux',
    grade: 'I 강 · 기초',
    title: '리눅스의 태동',
    tagline: '셸과 권한, 만물을 다스리는 명령의 언어',
    prerequisites: [],
    position: { x: 40, y: 110 },
    summary: `# 리눅스의 태동

모든 서버 마법의 근원. **셸(shell)** 을 통해 커널에게 명을 내린다.

- **파일 계층** — \`/\` 아래 \`/etc\` \`/var\` \`/home\` 의 질서
- **권한** — \`rwx\` · \`chmod 755\` · 소유자/그룹/기타
- **프로세스** — \`ps\` · \`top\` · \`systemctl\` 로 정령을 부린다
- **패키지** — \`apt\` / \`dnf\` 로 새 주문서를 내려받는다`,
    checklist: [
      { id: 'lx1', text: '파일 계층과 절대·상대 경로 이해', done: false },
      { id: 'lx2', text: 'chmod / chown 권한 술식 숙달', done: false },
      { id: 'lx3', text: 'systemctl 로 서비스 정령 제어', done: false },
    ],
  },
  {
    id: 'network',
    grade: 'I 강 · 기초',
    title: '네트워크의 심장',
    tagline: '만물이 흐르는 IP와 포트의 경로 해례',
    prerequisites: [],
    position: { x: 40, y: 340 },
    summary: `# 네트워크의 심장

**IP 주소**는 영지 안 모든 존재의 좌표이며, **포트**는 그 존재가 열어둔 성문이다.

- **TCP** — 전령을 반드시 도착시키는 굳건한 언약 (연결 지향)
- **UDP** — 빠르되 도착을 보장치 않는 파발마 (비연결)
- **포트 22/80/443** — SSH·HTTP·HTTPS 성문의 번호
- **서브넷 · 게이트웨이** — 영지의 경계와 관문`,
    checklist: [
      { id: 'n1', text: 'IP · 포트의 좌표 개념 이해', done: false },
      { id: 'n2', text: 'TCP 3-way 결속 의식 해석', done: false },
      { id: 'n3', text: '주요 포트 번호 암기', done: false },
    ],
  },

  // ── Layer 1 ─────────────────────────────────
  {
    id: 'ssh',
    grade: 'II 강 · 결속',
    title: 'SSH 원격 결속',
    tagline: '먼 서버와 암호로 손을 맞잡는 비밀 통로',
    prerequisites: ['linux', 'network'],
    position: { x: 340, y: 90 },
    summary: `# SSH — 원격의 손

멀리 떨어진 서버의 셸을 내 앞으로 소환하는 **암호화된 통로**.

- \`ssh user@host\` — 22번 성문으로 결속
- **공개키 인증** — \`ssh-keygen\` 으로 열쇠 한 쌍을 벼린다
- \`~/.ssh/authorized_keys\` 에 공개열쇠를 봉인
- **비밀번호 로그인 차단**으로 침입을 원천 봉쇄`,
    checklist: [
      { id: 's1', text: 'ssh-keygen 으로 키 쌍 생성', done: false },
      { id: 's2', text: '공개키를 서버 authorized_keys 에 등록', done: false },
      { id: 's3', text: 'PasswordAuthentication no 봉인', done: false },
    ],
  },
  {
    id: 'dns',
    grade: 'II 강 · 검령',
    title: 'DNS 주소 변환',
    tagline: '이름을 실좌표로 옮겨 적는 궤의 로드맵',
    prerequisites: ['network'],
    position: { x: 340, y: 250 },
    summary: `# DNS — 이름의 연금술

사람은 이름을 부르고, 기계는 좌표를 좇는다. **DNS**는 그 둘을 잇는 번역의 술식이다.

- **정방향 조회** — \`example.com\` → \`93.184.216.34\`
- **역방향 조회** — 좌표에서 이름을 되짚음
- **레코드** — A · AAAA · CNAME · MX · NS
- **재귀 질의** — 루트 → TLD → 권한 서버로 이어지는 순례`,
    checklist: [
      { id: 'd1', text: '정방향 · 역방향 조회 이해', done: false},
      { id: 'd2', text: '루트 네임서버의 역할 파악', done: false},
      { id: 'd3', text: '레코드 유형(A·MX·CNAME) 구분', done: false },
    ],
  },
  {
    id: 'oci',
    grade: 'III 강 · 소환',
    title: 'OCI 클라우드 소환',
    tagline: '오라클 구름 위에 나만의 영지를 세우다',
    prerequisites: ['linux'],
    position: { x: 340, y: 430 },
    summary: `# OCI — 구름 위의 영지

**Oracle Cloud Infrastructure** 위에 가상의 서버(Compute 인스턴스)를 소환한다.

- **VCN(가상 클라우드 네트워크)** — 구름 속 사설 영지
- **보안 목록 / NSG** — 클라우드 층의 관문 규칙
- **공인 IP** — 바깥 세계와 이어지는 좌표
- **부트 볼륨** — 서버의 영혼이 담긴 저장소`,
    checklist: [
      { id: 'o1', text: 'Compute 인스턴스 생성', done: false },
      { id: 'o2', text: 'VCN · 서브넷 · 보안 목록 구성', done: false },
      { id: 'o3', text: '공인 IP 로 SSH 접속 확인', done: false },
    ],
  },

  // ── Layer 2 ─────────────────────────────────
  {
    id: 'bind',
    grade: 'III 강 · 심장',
    title: 'BIND 네임서버',
    tagline: '리눅스 기반에 BIND 권한 서버를 직접 세우다',
    prerequisites: ['dns'],
    position: { x: 650, y: 160 },
    summary: `# BIND — 나만의 이름 신전 건립

DNS의 이치를 알았으니, 이제 **직접 권한 서버를 세운다.**

- \`named.conf\` — 신전의 계율서
- **존 파일(zone file)** — 각 도메인의 족보
- **SOA · NS · A 레코드**로 권위를 선포
- \`rndc reload\` 로 계율을 재봉인`,
    checklist: [
      { id: 'b1', text: 'named.conf 계율서 작성', done: false },
      { id: 'b2', text: '정방향 존 파일 구성', done: false },
      { id: 'b3', text: 'SOA 레코드 시리얼 관리', done: false },
    ],
  },
  {
    id: 'firewall',
    grade: 'IV 강 · 수호',
    title: '방화벽의 수호망',
    tagline: '수입 패킷의 해례를 사전에 무산시키는 결계망',
    prerequisites: ['ssh', 'dns'],
    position: { x: 650, y: 380 },
    summary: `# 방화벽의 수호망: iptables 결계

외부 침입 세력으로부터 우리 영지의 보루와 서버를 보호하기 위한 인바운드/아웃바운드 정화 결계입니다.

## 🩸 결계 규칙

**ACCEPT** — 안전한 우군 패킷의 영토 진입 허용
**DROP** — 부정한 침입자의 흔적조차 모르게 소멸
**REJECT** — 출입 거부 통지서를 정중히 송달`,
    checklist: [
      { id: 'f1', text: '53번 DNS 포트 해제 수호 규칙 주입', done: false },
      { id: 'f2', text: '특정 사악한 침입 IP의 영구 차단 결계 실험', done: false },
    ],
  },

  // ── Layer 3 ─────────────────────────────────
  {
    id: 'nginx',
    grade: 'V 강 · 봉산',
    title: '고속 웹 Nginx',
    tagline: '바람보다 빠른 봉산 가속으로 반향 캐리어 제어',
    prerequisites: ['firewall', 'oci'],
    position: { x: 960, y: 250 },
    summary: `# Nginx — 바람의 관문

정적 자원을 빛의 속도로 흘려보내고, 뒤편의 서버들을 지휘하는 **리버스 프록시**.

- \`server\` 블록 — 가상 관문 정의
- \`location\` — 경로별 향로 분기
- **reverse proxy** — 뒤편 응용에 요청 전달
- **로드 밸런싱** — 여러 일꾼에게 짐을 고루 분배`,
    checklist: [
      { id: 'g1', text: 'server 블록 가상 관문 설정', done: false },
      { id: 'g2', text: 'reverse proxy 향로 구성', done: false },
      { id: 'g3', text: '정적 파일 캐시 최적화', done: false },
    ],
  },
  {
    id: 'mail',
    grade: 'V 강 · 전승',
    title: '전승 메일 서버',
    tagline: 'SMTP와 사서함 마법의 유기적인 결합',
    prerequisites: ['firewall', 'bind'],
    position: { x: 960, y: 470 },
    summary: `# 전승 메일 서버 — 서신의 소환진

먼 곳의 현자와 서신을 주고받는 **SMTP · IMAP** 이중 소환진.

- **Postfix** — 서신을 실어 나르는 MTA
- **Dovecot** — 사서함(IMAP/POP3)의 수호자
- **MX 레코드** — 서신이 향할 신전의 좌표
- **SPF · DKIM** — 위조 서신을 가려내는 인장`,
    checklist: [
      { id: 'm1', text: 'Postfix MTA 소환진 구축', done: false },
      { id: 'm2', text: 'Dovecot 사서함 결계', done: false },
      { id: 'm3', text: 'SPF · DKIM 인장 각인', done: false },
    ],
  },
]
