import { useRoutes } from 'react-router-dom'
import { appRoutes } from './app/routes'
import { AppShell } from './app/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'

function App() {
  const element = useRoutes(appRoutes)

  return (
    <ToastProvider>
      <AppShell>{element}</AppShell>
    </ToastProvider>
  )
}

export default App
