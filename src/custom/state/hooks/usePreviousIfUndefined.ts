import { useEffect, useRef } from 'react'

// modified from https://usehooks.com/usePrevious/
export default function usePreviousIfUndefined<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>()

  // Store current value in ref
  useEffect(() => {
    // Mod to usePrevious: check if the new value is not undefined
    if (value !== undefined) {
      ref.current = value
    }
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}
