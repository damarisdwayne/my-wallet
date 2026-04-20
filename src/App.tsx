import { useAuthInit } from '@/store/auth'
import { Router } from '@/routes/Router'

const App = () => {
  useAuthInit()
  return <Router />
}

export default App
