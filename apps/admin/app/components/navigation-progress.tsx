import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'react-router'

function nextProgress(prev: number): number {
  if (prev >= 90) return prev
  const increment = prev < 50 ? 8 : prev < 80 ? 3 : 1
  return Math.min(prev + increment, 90)
}

export function NavigationProgress() {
  const navigation = useNavigation()
  const isNavigating = navigation.state !== 'idle'

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const wasNavigating = useRef(false)

  useEffect(() => {
    if (isNavigating) {
      wasNavigating.current = true
      setVisible(true)
      setProgress(10)

      const interval = setInterval(() => {
        setProgress(nextProgress)
      }, 200)

      return () => clearInterval(interval)
    }

    if (!wasNavigating.current) return
    wasNavigating.current = false

    setProgress(100)
    const timeout = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 300)

    return () => clearTimeout(timeout)
  }, [isNavigating])

  if (!visible) return null

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-label="Page loading progress"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'oklch(0.637 0.237 25.331)',
        transition: 'width 200ms ease-out',
      }}
    />
  )
}
