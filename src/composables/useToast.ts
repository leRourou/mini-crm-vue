import { reactive, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastState {
  show: boolean
  message: string
  type: ToastType
  icon: string
  loading: boolean
  timeout: number
}

/**
 * Reusable toast notification composable following DRY principle
 * Eliminates duplicate toast logic across components
 */
export function useToast() {
  const state = reactive<ToastState>({
    show: false,
    message: '',
    type: 'info',
    icon: '',
    loading: false,
    timeout: 4000
  })

  
  const toastConfigs: Record<ToastType, { icon: string; timeout: number }> = {
    success: { icon: 'mdi-check-circle', timeout: 4000 },
    error: { icon: 'mdi-alert-circle', timeout: 6000 },
    warning: { icon: 'mdi-alert', timeout: 5000 },
    info: { icon: 'mdi-information', timeout: 4000 },
    loading: { icon: '', timeout: 0 } 
  }

  /**
   * Show a toast notification
   */
  const showToast = (message: string, type: ToastType = 'info') => {
    const config = toastConfigs[type]
    
    state.message = message
    state.type = type
    state.icon = config.icon
    state.loading = type === 'loading'
    state.timeout = config.timeout
    state.show = true
  }

  /**
   * Hide the current toast
   */
  const hideToast = () => {
    state.show = false
  }

  /**
   * Convenience methods for different toast types
   */
  const success = (message: string) => showToast(message, 'success')
  const error = (message: string) => showToast(message, 'error')
  const warning = (message: string) => showToast(message, 'warning')
  const info = (message: string) => showToast(message, 'info')
  const loading = (message: string) => showToast(message, 'loading')

  /**
   * Show error from exception with optional prefix
   */
  const errorFromException = (error: unknown, prefix: string = 'Error') => {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    showToast(`${prefix}: ${message}`, 'error')
  }

  /**
   * Show a promise-based toast that updates based on promise resolution
   */
  const promiseToast = async <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error?: string
    }
  ): Promise<T> => {
    loading(messages.loading)
    
    try {
      const result = await promise
      success(messages.success)
      return result
    } catch (error) {
      const errorMessage = messages.error || 'Operation failed'
      errorFromException(error, errorMessage)
      throw error
    }
  }

  return {
    
    state: readonly(state),
    
    
    showToast,
    hideToast,
    
    
    success,
    error,
    warning,
    info,
    loading,
    errorFromException,
    promiseToast
  }
}


let globalToast: ReturnType<typeof useToast> | null = null

/**
 * Get or create the global toast instance
 * Follows Singleton pattern for consistent toast behavior
 */
export function useGlobalToast(): ReturnType<typeof useToast> {
  if (!globalToast) {
    globalToast = useToast()
  }
  return globalToast
}