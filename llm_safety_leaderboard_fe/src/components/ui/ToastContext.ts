import { createContext, useContext } from 'react'

type ToastContextValue = {
  pushToast: (message: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToastContext() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }

  return context
}
