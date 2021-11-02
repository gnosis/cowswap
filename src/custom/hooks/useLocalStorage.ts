import { useState } from 'react'

export const useLocalStorage = (key: string, value: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get item from the local storage via the key or catch an err and return value
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : value
    } catch (error) {
      console.warn(error)
      return value
    }
  })
  // Set a value to the local storage and catch errs
  const setValue = (value: any) => {
    try {
      // repeat the useState behavior
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue]
}
