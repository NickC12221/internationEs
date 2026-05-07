const FROM = 'International Escorts <support@internationalescorts.com>'

async function getResend() {
  const { Resend } = await import('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — email skipped:', subject)
    return
  }
  try {
    const resend = await getResend()
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('Email send error:', err)
  }
}

const base = (content: string) => `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0c0a09;color:#e7e5e4;padding:40px;">
  <h1 style="font-size:28px;font-weight:300;color:#fbbf24;margin-bottom:8px;">International Escorts</h1>
  <hr style="border-color:#292524;margin-bottom:32px;" />
  ${content}
  <hr style="border-color:#292524;margin-top:32px;" />
  <p style="color:#57534e;font-size:12px;">International Escorts &middot; <a href="https://internationalescorts.com" style="color:#57534e;">internationalescorts.com</a></p>
</div>`

const btn = (href: string, text: string) => `<a href="${href}" style="display:inline-block;margin-top:16px;background:#b45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">${text}</a>`

const p = (text: string) => `<p style="color:#a8a29e;line-height:1.7;">${text}</p>`

export const emailTemplates = {
  profileApproved: (name: string) => ({
    subject: 'Your profile is now live — International Escorts',
    html: base(`<h2 style="font-size:20px;font-weight:400;">🎉 Profile Approved!</h2>${p(`Hi ${name}, your profile on International Escorts is now live and visible to clients worldwide.`)}${p('Consider upgrading to Premium to appear at the top of all listings.')}${btn('https://internationalescorts.com/dashboard', 'Go to Dashboard')}`)
  }),
  profileRejected: (name: string, reason?: string) => ({
    subject: 'Update on your profile — International Escorts',
    html: base(`<h2 style="font-size:20px;font-weight:400;">Profile Review Update</h2>${p(`Hi ${name}, unfortunately your profile could not be approved at this time.${reason ? ` Reason: ${reason}` : ''}`)}${p('Please review our guidelines or contact support for assistance.')}${btn('https://internationalescorts.com/contact', 'Contact Support')}`)
  }),
  agencyApproved: (name: string) => ({
    subject: 'Your agency is now live — International Escorts',
    html: base(`<h2 style="font-size:20px;font-weight:400;">🎉 Agency Approved!</h2>${p(`Hi ${name}, your agency on International Escorts is now live. Start adding escorts from your dashboard.`)}${btn('https://internationalescorts.com/agency-dashboard', 'Go to Agency Dashboard')}`)
  }),
  agencyRejected: (name: string, reason?: string) => ({
    subject: 'Update on your agency — International Escorts',
    html: base(`<h2 style="font-size:20px;font-weight:400;">Agency Review Update</h2>${p(`Hi ${name}, unfortunately your agency could not be approved at this time.${reason ? ` Reason: ${reason}` : ''}`)}${btn('https://internationalescorts.com/contact', 'Contact Support')}`)
  }),
  newBooking: (escortName: string, clientName: string, date: string, duration: string) => ({
    subject: `New booking request from ${clientName}`,
    html: base(`<h2 style="font-size:20px;font-weight:400;">New Booking Request</h2>${p(`Hi ${escortName}, you have a new booking request from <strong style="color:#e7e5e4;">${clientName}</strong>.`)}<table style="width:100%;margin:16px 0;"><tr><td style="color:#78716c;padding:6px 0;font-size:14px;">Date</td><td style="color:#e7e5e4;font-size:14px;">${date}</td></tr><tr><td style="color:#78716c;padding:6px 0;font-size:14px;">Duration</td><td style="color:#e7e5e4;font-size:14px;">${duration}</td></tr></table>${btn('https://internationalescorts.com/dashboard/bookings', 'View Booking')}`)
  }),
  newMessage: (recipientName: string, senderName: string) => ({
    subject: `New message from ${senderName}`,
    html: base(`<h2 style="font-size:20px;font-weight:400;">New Message</h2>${p(`Hi ${recipientName}, you have a new message from <strong style="color:#e7e5e4;">${senderName}</strong>.`)}${btn('https://internationalescorts.com/dashboard/inbox', 'Read Message')}`)
  }),
  verificationApproved: (name: string) => ({
    subject: 'Identity verified ✓ — International Escorts',
    html: base(`<h2 style="font-size:20px;font-weight:400;">✓ Identity Verified</h2>${p(`Hi ${name}, your identity has been verified. Your profile now displays the Verified badge.`)}${btn('https://internationalescorts.com/dashboard', 'View Profile')}`)
  }),
}

export async function sendAdminEmail(subject: string, html: string) {
  await sendEmail({ to: 'support@internationalescorts.com', subject, html })
}

export const adminEmailTemplates = {
  newEscortSignup: (name: string, city: string, country: string, email: string) => ({
    subject: `New escort signup: ${name}`,
    html: base(`<h2 style="font-size:20px;font-weight:400;">New Escort Signup</h2>${p(`<strong style="color:#e7e5e4;">${name}</strong> from ${city}, ${country} has signed up and is awaiting approval.`)}${p(`Email: ${email}`)}<a href="https://internationalescorts.com/admin" style="display:inline-block;margin-top:16px;background:#b45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">Review in Admin →</a>`)
  }),
  newAgencySignup: (name: string, city: string, country: string, email: string) => ({
    subject: `New agency signup: ${name}`,
    html: base(`<h2 style="font-size:20px;font-weight:400;">New Agency Signup</h2>${p(`<strong style="color:#e7e5e4;">${name}</strong> from ${city}, ${country} has signed up and is awaiting approval.`)}${p(`Email: ${email}`)}<a href="https://internationalescorts.com/admin" style="display:inline-block;margin-top:16px;background:#b45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">Review in Admin →</a>`)
  }),
  newVerification: (name: string, email: string) => ({
    subject: `New verification request: ${name}`,
    html: base(`<h2 style="font-size:20px;font-weight:400;">New Verification Request</h2>${p(`<strong style="color:#e7e5e4;">${name}</strong> (${email}) has submitted their verification documents for review.`)}<a href="https://internationalescorts.com/admin" style="display:inline-block;margin-top:16px;background:#b45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">Review in Admin →</a>`)
  }),
}
