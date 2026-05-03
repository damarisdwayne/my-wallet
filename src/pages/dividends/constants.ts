export const MONTH_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export const THIS_YEAR = new Date().getFullYear().toString()
export const CURRENT_MONTH = new Date().toISOString().slice(0, 7)

export const W = 800
export const H = 280
export const PAD = { top: 24, right: 20, bottom: 44, left: 72 }
export const CW = W - PAD.left - PAD.right
export const CH = H - PAD.top - PAD.bottom
export const Y_TICKS = 5

export const FII_COLOR = 'hsl(142 71% 45%)'
export const STOCK_COLOR = 'hsl(217 91% 60%)'
export const FIXED_COLOR = 'hsl(48 96% 53%)'
export const EXT_COLOR = 'hsl(280 70% 60%)'
