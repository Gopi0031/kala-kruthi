import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📧 Received data:', body);

    const { name, email, phone, startDate, endDate, notes, events = [] } = body;

    // Validate required fields
    if (!name || !phone || !email || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Please fill all required fields' },
        { status: 400 }
      );
    }

    // Check email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials missing');
      console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'MISSING');
      console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
      return NextResponse.json(
        { success: false, message: "Email configuration missing in .env.local" },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    console.log('🔍 Testing SMTP connection...');
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError.message);
      return NextResponse.json(
        { success: false, message: `SMTP Error: ${verifyError.message}` },
        { status: 500 }
      );
    }

    // Format events HTML
    const eventsHtml = events && events.length > 0
      ? events
          .map(
            (event, i) => `
              <div style="margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
                <h4 style="margin: 0 0 10px 0; color: #10b981;">📸 Event ${i + 1}: ${event.name || "Not specified"}</h4>
                ${
                  event.requirements && event.requirements.length > 0
                    ? `<p style="margin: 5px 0 8px 0; color: #374151; font-weight: 600;">Requirements:</p>
                       <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                         ${event.requirements.map((req) => `<li style="margin: 5px 0;">${req}</li>`).join("")}
                       </ul>`
                    : "<p style='margin: 0; color: #9ca3af; font-style: italic;'>No specific requirements selected</p>"
                }
              </div>
            `
          )
          .join("")
      : "<p style='color: #9ca3af;'>No events specified</p>";

    // Send email to admin
    const mailOptionsAdmin = {
      from: `"Kalakruthi Photography" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Quotation Request from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px; text-align: center;">
                📩 New Quotation Request
              </h1>
            </div>
            
            <!-- Customer Details -->
            <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                👤 Customer Information
              </h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600; width: 140px;">Name:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-size: 16px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Email:</td>
                  <td style="padding: 10px 0;">
                    <a href="mailto:${email}" style="color: #10b981; text-decoration: none; font-weight: 600;">
                      ${email}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Phone:</td>
                  <td style="padding: 10px 0;">
                    <a href="tel:+91${phone}" style="color: #10b981; text-decoration: none; font-weight: 600; font-size: 16px;">
                      +91 ${phone}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Event Dates:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-size: 16px;">
                    <strong>${startDate}</strong> to <strong>${endDate}</strong>
                  </td>
                </tr>
              </table>
            </div>
            
            ${notes ? `
              <div style="background: #fef3c7; border-left: 5px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e; font-size: 16px;">📝 Additional Notes:</p>
                <p style="margin: 0; color: #78350f; line-height: 1.6; white-space: pre-wrap; font-size: 15px;">${notes}</p>
              </div>
            ` : ''}
            
            <!-- Event Details -->
            <div style="margin-top: 30px;">
              <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                📸 Event Requirements
              </h2>
              ${eventsHtml}
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                This quotation request was sent from your website
              </p>
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Please contact <strong style="color: #10b981;">${name}</strong> at 
                <a href="tel:+91${phone}" style="color: #10b981; text-decoration: none;">+91 ${phone}</a> or
                <a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a> to discuss the quotation
              </p>
            </div>
            
          </div>
        </div>
      `,
    };

    // Send email to customer
    const mailOptionsCustomer = {
      from: `"Kalakruthi Photography" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Your Quotation Request Received - Kalakruthi Photography",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px; text-align: center;">
                ✅ Request Received!
              </h1>
            </div>
            
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
              Hi <strong>${name}</strong>,
            </p>
            
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
              Thank you for requesting a quotation from <strong>Kalakruthi Wedding Photography</strong>! We have received your inquiry and will review your event details shortly.
            </p>
            
            <div style="background: #f0fdf4; border-left: 5px solid #10b981; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #10b981;">📋 Your Details:</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> +91 ${phone}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong>Event Dates:</strong> ${startDate} to ${endDate}</p>
            </div>
            
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
              Our team will contact you within <strong>24-48 hours</strong> to discuss your photography needs and provide a customized quotation.
            </p>
            
            <div style="background: #fef3c7; border-left: 5px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #92400e; font-size: 15px;">
                <strong>📞 In the meantime, feel free to reach out:</strong><br>
                <a href="tel:+919876543210" style="color: #10b981; text-decoration: none;">+91 98765 43210</a><br>
                <a href="mailto:contact@kalakruthi.com" style="color: #10b981; text-decoration: none;">contact@kalakruthi.com</a>
              </p>
            </div>
            
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong style="color: #10b981;">Kalakruthi Wedding Photography Team</strong>
            </p>
            
            <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © 2026 Kalakruthi Wedding Photography. All rights reserved.
            </p>
            
          </div>
        </div>
      `,
    };

    // Send emails
    console.log('📤 Sending emails...');
    await transporter.sendMail(mailOptionsAdmin);
    console.log('✅ Admin email sent to:', process.env.EMAIL_USER);

    await transporter.sendMail(mailOptionsCustomer);
    console.log('✅ Customer email sent to:', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Quotation request sent successfully! We will contact you soon.' 
    });

  } catch (error) {
    console.error("❌ Email error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Error: ${error.message}` 
      },
      { status: 500 }
    );
  }
}
