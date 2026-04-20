import { useAuthInit } from '@/store/auth'
import { Router } from '@/routes/router'

const App = () => {
  useAuthInit()
  return <Router />
}

export default App
