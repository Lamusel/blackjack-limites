import { useEffect, useRef, useCallback } from 'react'

/**
 * useTimer
 * Ejecuta onTick cada segundo mientras isActive === true.
 * onExpire se llama cuando el tiempo llega a 0.
 */
export function useTimer({ isActive, duration, onTick, onExpire }) {
  const remaining = useRef(duration)
  const interval  = useRef(null)

  const stop = useCallback(() => {
    clearInterval(interval.current)
    interval.current = null
  }, [])

  const start = useCallback(() => {
    stop()
    remaining.current = duration
    interval.current = setInterval(() => {
      remaining.current -= 1
      onTick?.(remaining.current)
      if (remaining.current <= 0) {
        stop()
        onExpire?.()
      }
    }, 1000)
  }, [duration, onTick, onExpire, stop])

  useEffect(() => {
    if (isActive) start()
    else stop()
    return stop
  }, [isActive, start, stop])
}
