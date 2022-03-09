import OperatorError from 'api/gnosisProtocol/errors/OperatorError'
import QuoteError from 'api/gnosisProtocol/errors/QuoteError'

type SentryErrorOptions = {
  message: string
  name: string
  optionalTags?: {
    [x: string]: string
  }
}

export function constructSentryError(
  baseError: QuoteError | OperatorError | Error,
  response: any,
  { message, name, optionalTags = {} }: SentryErrorOptions
) {
  const constructedError = Object.assign(new Error(), baseError, {
    message,
    name,
  })

  const tags = {
    ...optionalTags,
    errorType: baseError?.name,
    responseStatus: response.status,
  }

  return { baseError, sentryError: constructedError, tags }
}

// checks response for non json/application return type and throw appropriate error
export function checkAndThrowIfJsonSerialisableError(response: Response) {
  // don't attempt json parse if not json response...
  if (response.headers.get('Content-Type') !== 'application/json') {
    throw new Error(
      `Non JSON serialisable error detected with status code ${response.status}. ${JSON.stringify(response.statusText)}`
    )
  }
}

// Curried fn base
// Logs a choice from LogType in any env except Production. Else noop
type LogType = keyof Pick<Console, 'debug' | 'log' | 'error' | 'warn' | 'info'>
export const devConsole =
  (type: LogType) =>
  (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      return console[type](...args)
    }
  }

export const devLog = devConsole('log')
export const devWarn = devConsole('warn')
export const devInfo = devConsole('info')
export const devError = devConsole('error')
export const devDebug = devConsole('debug')
