import { useState } from 'react'
import { ErrorMessageProps, SwapCallbackError } from 'components/swap/styleds'
import useTransactionErrorModal from './useTransactionErrorModal'

/**
 * @description hook for getting CowSwap error and handling them visually
 * @description ErrorMessage component accepts an error message to override exported error state, and a close option
 * @returns returns object: { error, setError, ErrorMessage } => error message, error message setter, and our ErrorMessage component
 */
export function useErrorMessage() {
  // Any async bc errors
  const [internalError, setError] = useState<string | undefined>()
  const handleCloseError = () => setError(undefined)

  return {
    error: internalError,
    handleSetError: setError,
    ErrorMessage: ({
      error = internalError,
      showClose = false,
      ...rest
    }: Pick<ErrorMessageProps, 'error' | 'showClose' | '$css'>) =>
      error ? <SwapCallbackError showClose={showClose} handleClose={handleCloseError} error={error} {...rest} /> : null,
  }
}

export function useErrorModal() {
  // Any async bc errors
  const [internalError, setError] = useState<string | undefined>()
  const { openModal, closeModal, TransactionErrorModal } = useTransactionErrorModal()

  const handleCloseError = () => {
    closeModal()
    setError(undefined)
  }
  const handleSetError = (error: string | undefined) => {
    // close any open modals
    // closeModal()
    // set the error and IF error, open modal
    setError(error)
    error && openModal()
  }

  return {
    error: internalError,
    handleCloseError,
    handleSetError,
    ErrorModal: ({ message = internalError }: { message?: string }) => (
      <TransactionErrorModal onDismiss={handleCloseError} message={message} />
    ),
  }
}
