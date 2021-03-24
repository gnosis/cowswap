import React, { useEffect, useState } from 'react'
import { Title, Content, AppBodyMod } from './About.styled'
import markdownContent from './about.md'
import ReactMarkdown from 'react-markdown'

export default function About() {
  const [content, setContent] = useState('')

  useEffect(() => {
    const fetchContent = async () => {
      await fetch(markdownContent)
        .then(res => res.text())
        .then(text => {
          setContent(text)
        })
        .catch(error => {
          console.log('Error fetching markdown content: ', error)
          return null
        })
    }

    fetchContent()
  }, [])

  return (
    <AppBodyMod>
      <Title>About</Title>
      <Content>{content.length > 0 && <ReactMarkdown>{content}</ReactMarkdown>}</Content>
    </AppBodyMod>
  )
}
