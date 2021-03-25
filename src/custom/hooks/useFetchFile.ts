import { useEffect, useState } from 'react'

export default function useFetchFile(file: string) {
  const [data, setData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFile = async () => {
      await fetch(file)
        .then(res => res.text())
        .then(text => {
          setData(text)
        })
        .catch(res => {
          setError(`Error fetching file ${file} - status: ${res.statusText}`)
        })
    }

    fetchFile()
  }, [file])

  return { data, error }
}
