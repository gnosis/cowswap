import { useEffect, useState } from 'react'

// modified from https://usehooks.com/useDebounce/
export default function useDebounceWithForceUpdate<T>(
  value: T,
  delay: number,
  forceUpdateRef?: string | number | boolean
): T {
  const [lastForceUpdateRef, setLastForceUpdateRef] = useState(forceUpdateRef)
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  // force update
  useEffect(() => {
    if (
      (Boolean(value) && debouncedValue === undefined) ||
      (Boolean(forceUpdateRef) && forceUpdateRef !== lastForceUpdateRef)
    ) {
      setDebouncedValue(value)
      setLastForceUpdateRef(forceUpdateRef)
    }
  }, [debouncedValue, forceUpdateRef, lastForceUpdateRef, value])

  // Update debounced value after delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, debouncedValue])

  return value
}
