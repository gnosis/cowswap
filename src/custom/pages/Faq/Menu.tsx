import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from './styled'
import { isMobile } from 'react-device-detect'

const LINKS = [
  { title: 'General', url: '/faq' },
  { title: 'Protocol', url: '/faq/protocol' },
  { title: 'Token', url: '/faq/token' },
  { title: 'Trading', url: '/faq/trading' },
  { title: 'Affiliate', url: '/faq/affiliate' },
]

export function FaqMenu() {
  const [isExpanded, setisExpanded] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const element = event.target as HTMLElement
    const isActive = element.classList.contains('active')
    isMobile && isActive && setisExpanded(true)
  }

  return (
    <Menu>
      <ul className={isExpanded ? 'expanded' : ''}>
        {LINKS.map(({ title, url }, i) => (
          <li key={i}>
            <NavLink
              exact
              to={url}
              activeClassName={'active'}
              onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
            >
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </Menu>
  )
}
