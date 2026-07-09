/*
  황금 로터스 — 완수한 수련 위에 피어나는 개화 연출.
  petals 는 CSS @keyframes(petal-unfold)로 하나씩 펼쳐지고,
  burst=true 이면 섬광 + 불티가 한 번 터진다.
*/

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315]
const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2
  return { dx: Math.cos(a) * 42, dy: Math.sin(a) * 42, delay: (i % 5) * 0.04 }
})

export default function Lotus({ size = 46, burst = false }) {
  return (
    <div
      className="relative lotus-breathe"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {burst && (
        <>
          <span
            className="bloom-flash absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(246,231,191,0.95) 0%, rgba(244,201,93,0.5) 40%, transparent 70%)',
            }}
          />
          {SPARKS.map((s, i) => (
            <span
              key={i}
              className="spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-gold-100"
              style={{
                '--dx': `${s.dx}px`,
                '--dy': `${s.dy}px`,
                animationDelay: `${s.delay}s`,
                boxShadow: '0 0 6px 1px rgba(244,201,93,0.9)',
              }}
            />
          ))}
        </>
      )}

      <svg viewBox="0 0 100 100" className="h-full w-full lotus-in">
        <defs>
          <radialGradient id="lotus-petal" cx="50%" cy="80%" r="80%">
            <stop offset="0%" stopColor="#fff4d0" />
            <stop offset="55%" stopColor="#f4c95d" />
            <stop offset="100%" stopColor="#c98f2c" />
          </radialGradient>
          <radialGradient id="lotus-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8e6" />
            <stop offset="100%" stopColor="#e0a838" />
          </radialGradient>
        </defs>

        <g transform="translate(50 52)">
          {PETALS.map((rot, i) => (
            <path
              key={rot}
              className="petal"
              d="M0 6 C -11 -6 -8 -30 0 -40 C 8 -30 11 -6 0 6 Z"
              fill="url(#lotus-petal)"
              stroke="#8f6417"
              strokeWidth="1"
              style={{ '--rot': `${rot}deg`, animationDelay: `${i * 0.05}s` }}
            />
          ))}
          <circle r="7" fill="url(#lotus-core)" stroke="#8f6417" strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}
