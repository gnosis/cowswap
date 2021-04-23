import HashLink from 'components/HashLink'

export function ContentLink (props: { href: string; children: React.ReactNode }): JSX.Element {
  const isExternalLink = /^(https?:)?\/\//.test(props.href)
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
