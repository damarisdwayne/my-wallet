import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ticker, targetPrice, currentPrice, condition, userEmail } = req.body as {
    ticker: string
    targetPrice: number
    currentPrice: number
    condition: 'above' | 'below'
    userEmail: string
  }

  if (!ticker || !targetPrice || !currentPrice || !condition || !userEmail) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const conditionLabel = condition === 'above' ? 'subiu para' : 'caiu para'
  const emoji = condition === 'above' ? '📈' : '📉'

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: userEmail,
      subject: `${emoji} Alerta de preço: ${ticker}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; color: #111;">${emoji} Alerta atingido: ${ticker}</h2>
          <p style="margin: 0 0 20px; color: #555; font-size: 15px;">
            <strong>${ticker}</strong> ${conditionLabel} <strong>R$ ${currentPrice.toFixed(2)}</strong>.
            O seu alvo era R$ ${targetPrice.toFixed(2)}.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="margin: 0; color: #999; font-size: 12px;">
            Acesse o My Wallet para ver sua carteira e criar novos alertas.
          </p>
        </div>
      `,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Failed to send alert email:', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
