declare module 'constants' {
  // necessary for some reason to bring './constants'into scope
  import('./custom/constants')
  export * from './custom/constants'
}
