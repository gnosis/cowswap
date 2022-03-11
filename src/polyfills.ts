import 'polyfill-object.fromentries'

import flat from 'array.prototype.flat'
import flatMap from 'array.prototype.flatmap'

flat.shim()
flatMap.shim()

// define a new console
const console = (function (originalConsole) {
  return {
    log(...args: any[]) {
      if (process.env.NODE_ENV !== 'production') {
        originalConsole.log(...args)
      }
    },
    debug(...args: any[]) {
      if (process.env.NODE_ENV !== 'production') {
        originalConsole.debug(...args)
      }
    },
    info(...args: any[]) {
      if (process.env.NODE_ENV !== 'production') {
        originalConsole.info(...args)
      }
    },
    warn(...args: any[]) {
      if (process.env.NODE_ENV !== 'production') {
        originalConsole.warn(...args)
      }
    },
    error(...args: any[]) {
      if (process.env.NODE_ENV !== 'production') {
        originalConsole.error(...args)
      }
    },
  }
})(window.console)

//Then redefine the old console
window.console = { ...window.console, ...console }
