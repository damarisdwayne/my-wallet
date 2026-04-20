import { useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider, githubProvider, appleProvider } from '@/lib/firebase'

export const userAtom = atom<User | null>(null)
export const authLoadingAtom = atom(true)

export const useAuthInit = () => {
  const [, setUser] = useAtom(userAtom)
  const [, setLoading] = useAtom(authLoadingAtom)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsub
  }, [setUser, setLoading])
}

export const useAuth = () => {
  const [user] = useAtom(userAtom)
  const [loading] = useAtom(authLoadingAtom)

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider)
  const loginWithGithub = () => signInWithPopup(auth, githubProvider)
  const loginWithApple = () => signInWithPopup(auth, appleProvider)
  const logout = () => signOut(auth)

  return { user, loading, loginWithGoogle, loginWithGithub, loginWithApple, logout }
}
