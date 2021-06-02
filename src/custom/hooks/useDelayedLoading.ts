import { useEffect, useState } from 'react'

export default function useDelayedLoading(isLoading: boolean, time: number) {
  const [delayedLoad, setDelayedLoad] = useState(isLoading)

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    // price is being queried
    if (isLoading) {
      // isn't currently showing cow or hasnt yet been updated here
      // so we clear any running timeouts ready to clear local loading state
      // and essentially reset them
      clearTimeout(timeout as NodeJS.Timeout)
      setDelayedLoad(true)
    } else {
      // no longer loading
      // reset timeout to clear local loading state after LOADING_COW_TIMER ms
      if (delayedLoad) {
        timeout = setTimeout(() => {
          clearTimeout(timeout as NodeJS.Timeout)
          setDelayedLoad(false)
        }, time)
      }
    }

    return () => clearTimeout(timeout as NodeJS.Timeout)
    // Disable exhaustive deps as this only needs to be aware of the softLoading prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  return delayedLoad
}
