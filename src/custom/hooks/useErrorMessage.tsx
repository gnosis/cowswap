import { useState } from 'react'
import { ErrorMessageProps, SwapCallbackError } from 'components/swap/styleds'

/**
 * @description hook for getting CowSwap error and handling them visually
 * @description ErrorMessage component accepts an error message to override exported error state, and a close option
 * @returns returns object: { error, setError, ErrorMessage } => error message, error message setter, and our ErrorMessage component
 */
export default function useErrorMessage() {
  // Any async bc errors
  const [internalError, setError] = useState<string | undefined>()

  const handleCloseError = () => setError(undefined)

  return {
    error: internalError,
    setError,
    ErrorMessage: ({
      error = internalError,
      showClose = false,
      ...rest
    }: Pick<ErrorMessageProps, 'error' | 'showClose' | '$css'>) =>
      error ? <SwapCallbackError showClose={showClose} handleClose={handleCloseError} error={error} {...rest} /> : null,
  }
}
