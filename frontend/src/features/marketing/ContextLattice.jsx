/**
 * Lightweight SVG that visualizes Grasyn's core idea:
 * people, work, and knowledge as a connected lattice.
 */
export function ContextLattice({ className }) {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lattice-line" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6695b9" stopOpacity="0.25" />
          <stop offset="1" stopColor="#3368a0" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {[
        [80, 60, 240, 90],
        [240, 90, 400, 70],
        [240, 90, 180, 180],
        [240, 90, 320, 190],
        [180, 180, 90, 250],
        [180, 180, 250, 260],
        [320, 190, 250, 260],
        [320, 190, 410, 240],
        [400, 70, 410, 240],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="url(#lattice-line)"
          strokeWidth="2"
        />
      ))}

      {[
        { cx: 80, cy: 60, label: 'Team' },
        { cx: 240, cy: 90, label: 'Context' },
        { cx: 400, cy: 70, label: 'Work' },
        { cx: 180, cy: 180, label: 'Talk' },
        { cx: 320, cy: 190, label: 'Tasks' },
        { cx: 90, cy: 250, label: 'Docs' },
        { cx: 250, cy: 260, label: 'History' },
        { cx: 410, cy: 240, label: 'Code' },
      ].map((node) => (
        <g key={node.label}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r="22"
            fill="#ffffff"
            stroke="#3368a0"
            strokeWidth="2"
          />
          <circle cx={node.cx} cy={node.cy} r="6" fill="#3368a0" />
          <text
            x={node.cx}
            y={node.cy + 40}
            textAnchor="middle"
            fill="#475569"
            fontSize="11"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
