import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const THEME_COLOR = [10, 150, 140]   // ✅ IMAGE-MATCHED TEAL

const SAFE_MARGIN = 20
const CONTENT_WIDTH = 170
const PAGE_HEIGHT = 297
const HEADER_SAFE_START_Y = 70
const FOOTER_SAFE_END_Y = 260

const addBillingBackground = (doc) => {
  doc.addImage("/Billing.jpeg", "JPEG", 0, 0, 210, PAGE_HEIGHT)
}

const formatCurrency = (amount) =>
  `Rs ${Number(amount || 0).toLocaleString("en-IN")}/-`

const formatDateDMY = (dateValue) => {
  if (!dateValue) return "N/A"

  const date = new Date(dateValue)
  if (isNaN(date)) return dateValue // fallback

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}



export const generateInvoicePDF = (customer, invoiceNumber) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  })

  addBillingBackground(doc)



  /* ---------------- DATE ---------------- */
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(60)
  doc.text(
    `Date: ${formatDateDMY(new Date())}`,
    210 - SAFE_MARGIN,
    52,
    { align: "right" }
  )
  /* ---------------- INVOICE NUMBER ---------------- */
doc.setFont("helvetica", "bold")
doc.setFontSize(10)
doc.setTextColor(40)
doc.text(
  `Invoice No: ${invoiceNumber}`,
  210 - SAFE_MARGIN,
    45,
    { align: "right" }
)


  let contentY = HEADER_SAFE_START_Y

  /* ---------------- CUSTOMER DETAILS ---------------- */
  doc.setDrawColor(...THEME_COLOR)
  doc.setLineWidth(0.7)
  doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 32)

  doc.setFillColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(255)
  doc.text(
  "CUSTOMER DETAILS",
  SAFE_MARGIN + CONTENT_WIDTH / 2,
  contentY + 5,
  { align: "center" }
)


  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(30)

  contentY += 12
doc.text(`Name : ${customer.name}`, SAFE_MARGIN + 3, contentY)


  contentY += 6
  doc.text(`Phone : ${customer.phone || "N/A"}`, SAFE_MARGIN + 3, contentY)
  contentY += 6
doc.text(
  `Event Date : ${formatDateDMY(customer.date)}`,
  SAFE_MARGIN + 3,
  contentY
)

  contentY += 12

  /* ---------------- PAYMENT CALCULATION ---------------- */
  const totalAmount = Number(customer.totalAmount || 0)
  const paidAmount = (customer.advances || []).reduce(
    (sum, a) => sum + Number(a.amount || 0),
    0
  )
  const dueAmount = totalAmount - paidAmount

  /* ---------------- PAYMENT SUMMARY TABLE ---------------- */
  

//   contentY = doc.lastAutoTable.finalY + 8

  /* ---------------- ADVANCE PAYMENTS ---------------- */
  if (customer.advances?.length && contentY < FOOTER_SAFE_END_Y - 40) {
    autoTable(doc, {
      startY: contentY,
      head: [["No", "Date", "Mode", "Amount"]],
      body: customer.advances.map((a, i) => [
        i + 1,
        formatDateDMY(a.date),
        a.paymentMode || "N/A",
        formatCurrency(a.amount),
      ]),
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    headStyles: {
  fillColor: THEME_COLOR,
  textColor: 255,
  fontStyle: "bold",
  halign: "center",
},

styles: {
  halign: "center",
  fontSize: 9,
  cellPadding: 3,
},

      margin: { left: SAFE_MARGIN, right: SAFE_MARGIN },
    })
  }

  contentY = doc.lastAutoTable.finalY + 8


  

/* ---------------- PAYMENT SUMMARY TABLE ---------------- */
autoTable(doc, {
  startY: contentY,
  head: [["Description", "Amount"]],
  body: [
    ["Total Amount", formatCurrency(totalAmount)],
    ["Paid Amount", formatCurrency(paidAmount)],
  ],
  theme: "grid",
  styles: {
    fontSize: 10,
    cellPadding: 4,
    textColor: 30,
  },
  headStyles: {
    fillColor: THEME_COLOR,
    textColor: 255,
    fontStyle: "bold",
    halign: "center",
  },
  styles: {
  fontSize: 10,
  cellPadding: 4,
  textColor: 30,
  halign: "center",
},

  margin: { left: SAFE_MARGIN, right: SAFE_MARGIN },
})


  /* ---------------- FINAL DUE HIGHLIGHT ---------------- */
const finalY = Math.min(
  doc.lastAutoTable?.finalY + 31 || contentY + 12,
  FOOTER_SAFE_END_Y
)

doc.setDrawColor(...THEME_COLOR)
doc.setLineWidth(0.8)
doc.rect(SAFE_MARGIN, finalY, CONTENT_WIDTH, 18) // ✅ increased height

doc.setFont("helvetica", "bold")
doc.setFontSize(11)
doc.setTextColor(...THEME_COLOR)
doc.text(
  "TOTAL DUE AMOUNT",
  SAFE_MARGIN + CONTENT_WIDTH / 2,
  finalY + 7, // ✅ top padding
  { align: "center" }
)

doc.setFontSize(13)
doc.setTextColor(220, 38, 38)
doc.text(
  formatCurrency(dueAmount),
  SAFE_MARGIN + CONTENT_WIDTH / 2,
  finalY + 13, // ✅ more space from top
  { align: "center" }
)


  /* ---------------- SAVE ---------------- */
  doc.save(`Invoice_${customer.name}.pdf`)
}
