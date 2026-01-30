import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import nodemailer from "nodemailer"

export async function GET() {
  const client = await clientPromise
  const db = client.db("kalakruthi")

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split("T")[0]

  const events = await db
    .collection("calendar-events")
    .find({ date: dateStr })
    .toArray()

  if (!events.length) {
    return NextResponse.json({ message: "No reminders today" })
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  for (const ev of events) {
    await transporter.sendMail({
      from: `"Kalakruthi Photography" <${process.env.EMAIL_USER}>`,
      to: ev.customerEmail,
      subject: `📸 Event Reminder – ${ev.title}`,
      html: `
        <h3>Event Reminder</h3>
        <p><b>Event:</b> ${ev.title}</p>
        <p><b>Date:</b> ${ev.date}</p>
        <p><b>Location:</b> ${ev.location}</p>
      `,
    })
  }

  return NextResponse.json({ success: true })
}
