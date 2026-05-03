import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const MASK = '••••••'
export const MASK_SHORT = '•••'

export const hideValuesAtom = atomWithStorage<boolean>('hideValues', false)

export const usePrivacy = () => {
  const [hideValues, setHideValues] = useAtom(hideValuesAtom)
  const toggleHideValues = () => setHideValues((v) => !v)
  return { hideValues, toggleHideValues }
}
