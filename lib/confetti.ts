import confetti from "canvas-confetti"

// Strictly 3 specific colors as requested: Gold, Green, Red
const CONFETTI_COLORS = [
    "#FFD700", // Gold
    "#4CAF50", // Green
    "#F44336", // Red
]

export function triggerWorkoutCompletionConfetti() {
    const duration = 2000 // 2 seconds
    const end = Date.now() + duration

        ; (function frame() {
            // Manually select a random color for this frame to ensure variety
            // even with low particle count.
            const randomColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]

            // Left side spawn
            confetti({
                particleCount: 1,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0 },
                colors: [randomColor], // Pass strict single color to ensure it renders
                gravity: 0.8,
                scalar: 1.2,
                drift: 0,
                ticks: 300,
                zIndex: 100,
                disableForReducedMotion: true,
                shapes: ['square', 'circle'],
            })

            // Right side spawn
            confetti({
                particleCount: 1,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0 },
                colors: [randomColor],
                gravity: 0.8,
                scalar: 1.2,
                drift: 0,
                ticks: 300,
                zIndex: 100,
                disableForReducedMotion: true,
                shapes: ['square', 'circle'],
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        })()
}
