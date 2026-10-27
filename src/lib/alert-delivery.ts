export const playAlertSound = () => {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // AudioContext not available
  }
}

export const requestBrowserPermission = async () => {
  if (!('Notification' in globalThis)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export const sendBrowserNotification = (title: string, message: string) => {
  if (!('Notification' in globalThis) || Notification.permission !== 'granted') return
  new Notification(title, { body: message, icon: '/favicon.ico', requireInteraction: true })
}

export const sendAlertEmail = async (body: Record<string, unknown>) => {
  try {
    await fetch('/api/send-alert-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // silent — notification still shown in-app
  }
}
