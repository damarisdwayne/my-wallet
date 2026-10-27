import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ticker, targetPrice, currentPrice, condition, userEmail, title, lines } = req.body as {
    ticker?: string
    targetPrice?: number
    currentPrice?: number
    condition?: 'above' | 'below'
    userEmail: string
    title?: string
    lines?: string[]
  }

  // Generic digest (automatic portfolio alerts): a title plus one line per asset
  if (title && lines?.length && userEmail) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: process.env.ALERT_EMAIL ?? userEmail,
        subject: `📉 ${title}`,
        html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="margin: 0 0 12px; font-size: 20px; color: #111;">📉 ${title}</h2>
          <ul style="margin: 0 0 20px; padding-left: 18px; color: #555; font-size: 15px; line-height: 1.6;">
            ${lines.map((l) => `<li>${l}</li>`).join('')}
          </ul>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="margin: 0; color: #999; font-size: 12px;">
            Acesse o My Wallet para ver sua carteira e simular um aporte.
          </p>
        </div>
      `,
      })
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('Failed to send alert digest email:', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }
  }

  if (!ticker || !targetPrice || !currentPrice || !condition || !userEmail) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const conditionLabel = condition === 'above' ? 'subiu para' : 'caiu para'
  const emoji = condition === 'above' ? '📈' : '📉'

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: process.env.ALERT_EMAIL ?? userEmail,
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
