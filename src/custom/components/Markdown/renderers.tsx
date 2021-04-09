import React, { ReactNode, ReactElement } from 'react'
import HashLink from 'components/HashLink'

// Another overcomplicated React thing? ok!
// react-markdown doesn't auto add ids to header tags
// making TOCs impossible without some annoying plugins to install etc
// https://github.com/remarkjs/react-markdown/issues/404
function flatten(text: string, child: ReactNode): any {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray((child as ReactElement).props.children).reduce(flatten, text)
}

/**
 * HeadingRenderer is a custom renderer
 * It parses the heading and attaches an id to it to be used as an anchor
 */
const HeadingRenderer = (props: { level: number; children: ReactNode }) => {
  const children = React.Children.toArray(props.children)
  const text = children.reduce(flatten, '')
  const slug = text.toLowerCase().replace(/\W/g, '-')
  return React.createElement('h' + props.level, { id: slug }, props.children)
}

const LinkRenderer = (props: { href: string; children: React.ReactNode }) => {
  const isExternalLink = props.href.match(/^(https?:)?\/\//)
  return isExternalLink ? (
    <a target="_blank" href={props.href} rel="noopener noreferrer">
      {props.children}
    </a>
  ) : (
    <HashLink href={props.href} to={props.href}>
      {props.children}
    </HashLink>
  )
}

export { HeadingRenderer, LinkRenderer }
