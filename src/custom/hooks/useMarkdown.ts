import { useEffect, useState } from 'react'
import { devLog } from 'utils/logging'

export default function useMarkdown(file: string) {
  const [content, setContent] = useState('')

  useEffect(() => {
    const fetchContent = async () => {
      await fetch(file)
        .then((res) => res.text())
        .then((text) => {
          setContent(text)
        })
        .catch((error) => {
          devLog(`Error fetching markdown content file ${file}: `, error)
          return null
        })
    }

    fetchContent()
  }, [file])

  return content
}
