import toast from 'react-hot-toast'

/**
 * The app's only entry point for transient messages. Features import `notify`
 * instead of the toast library directly, so defaults live in one place and the
 * library can be swapped without touching screens.
 */
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast(message),

  /** Shows an ApiError (or any Error) thrown by the API layer. */
  apiError: (error) =>
    toast.error(error?.message ?? 'Something went wrong. Please try again.'),
}
