/**
 * Creates a dashboard notification AND sends an email to the user.
 * Use this instead of prisma.notification.create directly.
 */
export async function notifyUser({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string
  type: string
  title: string
  body: string
  link?: string
}) {
  const { prisma } = await import('@/lib/db/prisma')
  const { sendEmail } = await import('@/lib/email/resend')

  // Create dashboard notification
  await prisma.notification.create({
    data: { userId, type, title, body, link }
  }).catch(() => {})

  // Send email
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (user?.email && !user.email.includes('@agency-')) {
      const FROM = 'International Escorts <support@internationalescorts.com>'
      const html = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0c0a09;color:#e7e5e4;padding:40px;">
  <h1 style="font-size:24px;font-weight:300;color:#fbbf24;margin-bottom:8px;">International Escorts</h1>
  <hr style="border-color:#292524;margin-bottom:24px;" />
  <h2 style="font-size:18px;font-weight:400;color:#e7e5e4;">${title}</h2>
  <p style="color:#a8a29e;line-height:1.7;margin-top:12px;">${body}</p>
  ${link ? `<a href="https://internationalescorts.com${link}" style="display:inline-block;margin-top:20px;background:#b45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">View Details →</a>` : ''}
  <hr style="border-color:#292524;margin-top:32px;" />
  <p style="color:#57534e;font-size:12px;">International Escorts · <a href="https://internationalescorts.com" style="color:#57534e;">internationalescorts.com</a></p>
</div>`

      await sendEmail({ to: user.email, subject: title, html }).catch(() => {})
    }
  } catch {}
}
