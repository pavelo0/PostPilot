import { Toaster } from 'sonner'
import { AppRouter } from '@/router'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  )
}

export default App
