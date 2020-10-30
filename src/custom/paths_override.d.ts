declare module 'constants' {
  // necessary for some reason to bring './constants'into scope
  import('./constants')
  export * from './constants'
}
