import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'info' | 'warning' | 'error'

type ToastContextValue = {
  pushToast: (message: string, variant?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToastContext() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }

  return context
}
