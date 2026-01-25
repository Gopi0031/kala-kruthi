// /app/api/send-quotation/route.js
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    console.log('📧 Email API called')

    const EMAIL_USER = process.env.EMAIL_USER
    const EMAIL_PASS = process.env.EMAIL_PASS
    const OWNER_EMAIL = process.env.OWNER_EMAIL || EMAIL_USER // Owner email (defaults to EMAIL_USER)

    console.log('📧 EMAIL_USER:', EMAIL_USER ? '✓ Loaded' : '❌ Missing')
    console.log('📧 OWNER_EMAIL:', OWNER_EMAIL ? '✓ Loaded' : '❌ Missing')

    if (!EMAIL_USER || !EMAIL_PASS) {
      return NextResponse.json(
        { error: 'Email credentials not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const pdfOwner = formData.get('pdfOwner')        // PDF WITH prices
    const pdfCustomer = formData.get('pdfCustomer')  // PDF WITHOUT prices
    const customerEmail = formData.get('customerEmail')
    const subject = formData.get('subject')
    const customerName = formData.get('customerName')
    const eventType = formData.get('eventType')

    if (!pdfOwner || !pdfCustomer || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required files or email' },
        { status: 400 }
      )
    }

    // Check PDF sizes
    const bufferOwner = await pdfOwner.arrayBuffer()
    const bufferCustomer = await pdfCustomer.arrayBuffer()
    const sizeOwnerMB = bufferOwner.byteLength / (1024 * 1024)
    const sizeCustomerMB = bufferCustomer.byteLength / (1024 * 1024)
    
    console.log('📄 Owner PDF size:', sizeOwnerMB.toFixed(2), 'MB')
    console.log('📄 Customer PDF size:', sizeCustomerMB.toFixed(2), 'MB')

    if (sizeOwnerMB > 20 || sizeCustomerMB > 20) {
      return NextResponse.json(
        { error: 'PDF too large. Max 20MB for Gmail.' },
        { status: 400 }
      )
    }

    const attachmentOwner = Buffer.from(bufferOwner)
    const attachmentCustomer = Buffer.from(bufferCustomer)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })

    // 1️⃣ Send email to OWNER with prices
    const ownerInfo = await transporter.sendMail({
      from: `Kalakruthi Photography <${EMAIL_USER}>`,
      to: OWNER_EMAIL,
      subject: `[NEW QUOTATION] ${subject || 'Quotation Request'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #10b981;">📋 New Quotation Request</h2>
          <p><strong>Customer:</strong> ${customerName || 'N/A'}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Event Type:</strong> ${eventType || 'N/A'}</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #666;">
            Find the full quotation with pricing details attached.
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            🕒 Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      `,
      attachments: [{
        filename: `Quotation_${customerName?.replace(/\s+/g, '_') || 'customer'}_WITH_PRICES.pdf`,
        content: attachmentOwner,
        contentType: 'application/pdf',
      }],
    })

    console.log('✅ Email sent to OWNER:', ownerInfo.messageId)

    // 2️⃣ Send email to CUSTOMER without prices
    const customerInfo = await transporter.sendMail({
      from: `Kalakruthi Photography <${EMAIL_USER}>`,
      to: customerEmail,
      subject: subject || 'Quotation from Kalakruthi Photography',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #10b981; margin-bottom: 20px;">Hello ${customerName || 'Valued Customer'}! 📸</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for your interest in <strong>Kalakruthi Photography</strong>. We're excited to be a part of your special moments!
            </p>
            
            <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #065f46; font-size: 15px;">
                <strong>📋 Your Quotation Details:</strong><br>
                Event: ${eventType || 'N/A'}
              </p>
            </div>
            
            <p style="font-size: 15px; color: #555;">
              Please find your personalized quotation attached to this email. If you have any questions or would like to discuss the details further, feel free to reach out to us!
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <div style="text-align: center;">
              <p style="font-size: 14px; color: #666; margin: 10px 0;">
                <strong>Kalakruthi Photography</strong><br>
                Professional Photography & Videography Services
              </p>
              <p style="font-size: 13px; color: #888;">
                📞 Contact: +91-XXXXXXXXXX<br>
                ✉️ Email: ${EMAIL_USER}<br>
                🌐 Website: www.kalakruthi.com
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; color: #92400e; font-size: 13px;">
                💡 <strong>Tip:</strong> Book early to secure your preferred date!
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <p style="font-size: 11px; color: #999;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [{
        filename: `Quotation_${customerName?.replace(/\s+/g, '_') || 'customer'}.pdf`,
        content: attachmentCustomer,
        contentType: 'application/pdf',
      }],
    })

    console.log('✅ Email sent to CUSTOMER:', customerInfo.messageId)

    return NextResponse.json({ 
      success: true, 
      message: 'Emails sent successfully to both owner and customer!',
      ownerMessageId: ownerInfo.messageId,
      customerMessageId: customerInfo.messageId
    })

  } catch (error) {
    console.error('❌ Email error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
