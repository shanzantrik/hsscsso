export interface EmailOptions {
  to: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      console.error('BREVO_API_KEY not configured')
      return false
    }

    const emailData = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'HSSC SSO Gateway',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@hssc.com'
      },
      to: [{
        email: options.to,
        name: options.name
      }],
      subject: options.subject,
      htmlContent: options.htmlContent,
      ...(options.textContent && { textContent: options.textContent })
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Email sent successfully:', result)
      return true
    } else {
      const error = await response.text()
      console.error('Email sending failed:', error)
      return false
    }

  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string, password: string, loginUrl: string): Promise<boolean> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">HSSC SSO Gateway</h1>
      </div>

      <div style="padding: 30px; background-color: #f9fafb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to HSSC SSO Gateway!</h2>

        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Hello ${name},
        </p>

        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Your account has been successfully created in the HSSC SSO Gateway system.
          You can now access the Learning Management System (LMS) using your credentials below.
        </p>

        <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">Your Login Credentials</h3>
          <p style="color: #374151; margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
          <p style="color: #374151; margin-bottom: 10px;"><strong>Password:</strong> ${password}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
            Please keep these credentials secure and do not share them with anyone.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}"
             style="background-color: #3b82f6; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: bold;">
            Access Learning Portal
          </a>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-bottom: 10px;">Important Information</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Your account is now active and ready to use</li>
            <li>You can access the LMS through the SSO Gateway</li>
            <li>If you forget your password, use the "Forgot Password" option</li>
            <li>For technical support, contact your system administrator</li>
          </ul>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>

      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>&copy; 2025 HSSC SSO Gateway. All rights reserved.</p>
      </div>
    </div>
  `

  const textContent = `
    Welcome to HSSC SSO Gateway!

    Hello ${name},

    Your account has been successfully created in the HSSC SSO Gateway system.
    You can now access the Learning Management System (LMS) using your credentials below.

    Your Login Credentials:
    Email: ${email}
    Password: ${password}

    Please keep these credentials secure and do not share them with anyone.

    Access Learning Portal: ${loginUrl}

    Important Information:
    - Your account is now active and ready to use
    - You can access the LMS through the SSO Gateway
    - If you forget your password, use the "Forgot Password" option
    - For technical support, contact your system administrator

    This is an automated message. Please do not reply to this email.

    &copy; 2025 HSSC SSO Gateway. All rights reserved.
  `

  return await sendEmail({
    to: email,
    name: name,
    subject: 'Welcome to HSSC SSO Gateway - Your Account Has Been Created',
    htmlContent: htmlContent,
    textContent: textContent
  })
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">HSSC SSO Gateway</h1>
      </div>

      <div style="padding: 30px; background-color: #f9fafb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>

        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Hello ${name},
        </p>

        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset your password for your HSSC SSO Gateway account.
          If you didn't make this request, you can safely ignore this email.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #dc2626; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: bold;">
            Reset Your Password
          </a>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-bottom: 10px;">Important Information</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>This link will expire in 1 hour for security reasons</li>
            <li>If the link doesn't work, copy and paste it into your browser</li>
            <li>For security, this link can only be used once</li>
            <li>If you didn't request this reset, please contact support immediately</li>
          </ul>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>

      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>&copy; 2025 HSSC SSO Gateway. All rights reserved.</p>
      </div>
    </div>
  `

    const textContent = `
    Password Reset Request - HSSC SSO Gateway

    Hello ${name},

    We received a request to reset your password for your HSSC SSO Gateway account.
    If you didn't make this request, you can safely ignore this email.

    Reset Your Password: ${resetUrl}

    Important Information:
    - This link will expire in 1 hour for security reasons
    - If the link doesn't work, copy and paste it into your browser
    - For security, this link can only be used once
    - If you didn't request this reset, please contact support immediately

    This is an automated message. Please do not reply to this email.

    &copy; 2025 HSSC SSO Gateway. All rights reserved.
  `

  return await sendEmail({
    to: email,
    name: name,
    subject: 'Password Reset Request - HSSC SSO Gateway',
    htmlContent: htmlContent,
    textContent: textContent
  })
}
