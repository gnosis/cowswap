import React, { useEffect } from 'react'
import { LinkProps, useLocation, Link } from 'react-router-dom'

const HashLink = (props: LinkProps) => {
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.slice(1)
    const elem = document.getElementById(id)

    if (!elem) return

    window.scrollTo(0, elem.offsetTop)
  }, [location.hash])

  return <Link {...props}>{props.children}</Link>
}

export default HashLink
