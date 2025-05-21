interface WorkoutLogoProps {
  className?: string
  size?: number
}

export function WorkoutLogo({ className = "", size = 24 }: WorkoutLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M6.5 6.5H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 10L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13.5L16 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 17H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
    </svg>
  )
}
