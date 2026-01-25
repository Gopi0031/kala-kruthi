// QuotationPDF.js — MODIFIED FOR CUSTOMER PDF & RS SYMBOL
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"


const getEquipmentModelName = (equipmentId, equipmentList) => {
  const item = equipmentList.find(e => e.id === parseInt(equipmentId))
  if (!item) return ""
  return `${item.brand} ${item.model}`
}

const THEME_COLOR = [13, 148, 136]
const SAFE_MARGIN = 15
const CONTENT_WIDTH = 180
const PAGE_HEIGHT = 297

const HEADER_SAFE_START_Y = 70
// const FOOTER_SAFE_END_Y = 260
const FOOTER_SAFE_END_Y = 275
const formatCurrency = (amount = 0) =>
  `Rs ${Number(amount).toLocaleString("en-IN")}/-`


const addPageHeader = (doc) => {
  doc.addImage("/Quotation.jpeg", "JPEG", 0, 0, 210, PAGE_HEIGHT)
  
}


export const generateQuotationPDF = (
  quotation,
  calculateQuotationTotal,
  showPrices = true,
  equipmentList = []
) => {

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  })
  const PAGE_BOTTOM = doc.internal.pageSize.height - 15

  doc.setFont("helvetica", "normal")

  addPageHeader(doc)

  // const totals = calculateQuotationTotal()
  

  let equipmentActualTotal = 0
  let equipmentCustomerTotal = 0

  const itemsByEvent = {}

  // ✅ UPDATED: Extract equipment with quantity
  if (quotation.selectedEquipment) {
    Object.keys(quotation.selectedEquipment).forEach((eventType) => {
      const eventEquipment = quotation.selectedEquipment[eventType] || []

      const eventItems = []
      eventEquipment.forEach((eq) => {
        if (eq.selected && eq.equipmentId && eq.equipmentId !== "Not Selected") {
          const quantity = eq.quantity || 1
          const unitActualPrice = eq.unitActualPrice || 0
          const unitCustomerPrice = eq.unitCustomerPrice || 0
          
          const totalActual = unitActualPrice * quantity
          const totalCustomer = unitCustomerPrice * quantity

          equipmentActualTotal += totalActual
          equipmentCustomerTotal += totalCustomer

          const modelName = getEquipmentModelName(eq.equipmentId, equipmentList)
 
          eventItems.push({
           name: `${eq.category} - ${eq.timeSlot || "N/A"}${
  modelName ? `\n${modelName} × ${eq.quantity || 1}` : ""
}`,
            quantity: quantity,
            unitActualPrice: unitActualPrice,
            unitCustomerPrice: unitCustomerPrice,
            totalActual: totalActual,
            totalCustomer: totalCustomer,
          })
        }
      })

      if (eventItems.length > 0) {
        itemsByEvent[eventType] = eventItems
      }
    })
  }

  const sheetsQuantity = parseInt(quotation.sheetsCount) || 0
  const sheetsPricePerSheet = quotation.sheetsPricePerSheet || 0
  const sheetsActualPrice = quotation.sheetsActualPricePerSheet || 0
  const sheetsCustomerTotal = sheetsQuantity * sheetsPricePerSheet
  const sheetsActualTotal = sheetsQuantity * sheetsActualPrice

  const actualGrandTotal = equipmentActualTotal + sheetsActualTotal
  const customerGrandTotal = equipmentCustomerTotal + sheetsCustomerTotal

  const discountPercent = parseFloat(quotation.discount) || 0
  const discountAmount = Math.round((customerGrandTotal * discountPercent) / 100)
  const finalTotal = customerGrandTotal - discountAmount

  // QUOTATION TITLE
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...THEME_COLOR)
  // doc.text("QUOTATION", SAFE_MARGIN, 75)

  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(
    `Date: ${new Date().toLocaleDateString("en-IN")}`,
    210 - SAFE_MARGIN,
    60,
    { align: "right" }
  )

  // CUSTOMER INFORMATION BOX - EXTENDED HEIGHT
  const CUSTOMER_BOX_Y = 82
  doc.setDrawColor(...THEME_COLOR)
  doc.setLineWidth(0.6)
  doc.rect(SAFE_MARGIN, CUSTOMER_BOX_Y, CONTENT_WIDTH, 33) // ✅ Increased height

  doc.setFillColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, CUSTOMER_BOX_Y, CONTENT_WIDTH, 7, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text("CUSTOMER INFORMATION", SAFE_MARGIN + 3, CUSTOMER_BOX_Y + 5)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(0)

  doc.text(
    `Name: ${quotation.firstName} ${quotation.lastName || ""}`,
    SAFE_MARGIN + 3,
    CUSTOMER_BOX_Y + 13
  )
  doc.text(
    `Phone: ${quotation.customerPhone}`,
    SAFE_MARGIN + 3,
    CUSTOMER_BOX_Y + 18
  )
  doc.text(
    `Email: ${quotation.customerEmail}`,
    SAFE_MARGIN + 3,
    CUSTOMER_BOX_Y + 23
  )
  doc.text(
    `Location: ${quotation.location || 'Not specified'}`,
    SAFE_MARGIN + 3,
    CUSTOMER_BOX_Y + 28
  )

// doc.text(`Event Location: ${quotation.eventLocation || 'Not specified'}`, SAFE_MARGIN + 3, CUSTOMER_BOX_Y + 33)

  // EVENT TABLE
  let contentY = CUSTOMER_BOX_Y + 35

  // EVENT TABLE - UPDATED WITH LOCATION COLUMN
autoTable(doc, {
  startY: contentY,
  head: [["Event", "Schedule", "Event Location"]],
  body: quotation.selectedEvents.map((e) => [
    e,
    quotation.eventDates?.[e]?.date
      ? `${new Date(
          quotation.eventDates[e].date
        ).toLocaleDateString("en-IN")} (${quotation.eventDates[e].timeSlot || "TBD"})`
      : "To be scheduled",
    quotation.eventDates?.[e]?.location || "Not specified",
  ]),
  theme: "grid",
  headStyles: {
    fillColor: THEME_COLOR,
    textColor: 255,
    fontStyle: "bold",
    fontSize: 9,
  },
  bodyStyles: {
    fontSize: 8.5,
    cellPadding: 3,
  },
})


  contentY = doc.lastAutoTable.finalY + 10

  let equipmentHeaderPrinted = false

  Object.keys(itemsByEvent).forEach((eventType, eventIndex) => {
    const eventItems = itemsByEvent[eventType]
    const eventDate = quotation.eventDates?.[eventType]?.date
      ? new Date(quotation.eventDates[eventType].date).toLocaleDateString("en-IN")
      : "TBD"

    if (contentY + 20 > PAGE_BOTTOM) {
      doc.addPage()
      addPageHeader(doc)
      contentY = HEADER_SAFE_START_Y
      equipmentHeaderPrinted = false
    }

    if (!equipmentHeaderPrinted) {
      doc.setDrawColor(...THEME_COLOR)
      doc.setLineWidth(0.6)
      doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7)
      doc.setFillColor(...THEME_COLOR)
      doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text("EQUIPMENT BREAKDOWN", SAFE_MARGIN + 3, contentY + 5)
      contentY += 10
      equipmentHeaderPrinted = true
    }

    doc.setFillColor(240, 253, 244)
    doc.setDrawColor(...THEME_COLOR)
    doc.setLineWidth(0.5)
    doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 6, "F")
    doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 6)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...THEME_COLOR)
    doc.text(`${eventType} - ${eventDate}`, SAFE_MARGIN + 3, contentY + 4)

    contentY += 8

    // ✅ MODIFIED: Customer PDF - No Qty column, Owner PDF - With Qty column
    const tableHeaders = showPrices
      ? [["Item", "Qty", "Actual (Rs)", "Customer (Rs)"]]
      : [["Item", "Qty"]]

    // ✅ MODIFIED: Customer PDF table body (NO QTY column, just total price)
    const tableBody = eventItems.map((item) => {
      
     if (showPrices) {
    // ✅ OWNER PDF: Full details (unchanged)
    return [
      item.name,
      item.quantity.toString(),
      `Rs ${item.unitActualPrice.toLocaleString("en-IN")} × ${item.quantity} = Rs ${item.totalActual.toLocaleString("en-IN")}`,
      `Rs ${item.unitCustomerPrice.toLocaleString("en-IN")} × ${item.quantity} = Rs ${item.totalCustomer.toLocaleString("en-IN")}`,
    ]
  } else {
    // ✅ CUSTOMER PDF: Description + Quantity ONLY (NO prices in table)
    return [
      item.name,
      item.quantity.toString()
    ]
  }
})

    autoTable(doc, {
      startY: contentY,
      head: tableHeaders,
      body: tableBody,
      theme: "striped",
      headStyles: {
        fillColor: THEME_COLOR,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 2.5,
      },
      columnStyles: showPrices
        ? {
            0: { cellWidth: 60, halign: "left" },
            1: { cellWidth: 15, halign: "center" },
            2: { cellWidth: 50, halign: "right" },
            3: { cellWidth: 50, halign: "right" },
          }
        : {
            // ✅ CUSTOMER PDF: 2 columns - Description(85) + Qty(20)
        0: { cellWidth: 85, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
          },
      margin: { left: SAFE_MARGIN, right: SAFE_MARGIN },
      // pageBreak: "avoid",
    })

    contentY = doc.lastAutoTable.finalY + 6
  })

  if (sheetsQuantity > 0 && quotation.sheetsTypeId) {
    if (contentY + 20 > PAGE_BOTTOM) {
      doc.addPage()
      addPageHeader(doc)
      contentY = HEADER_SAFE_START_Y
    }

    doc.setDrawColor(...THEME_COLOR)
    doc.setLineWidth(0.6)
    doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7)

    doc.setFillColor(...THEME_COLOR)
    doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text("SHEETS", SAFE_MARGIN + 3, contentY + 5)

    contentY += 10

    // ✅ MODIFIED: Sheets table headers
    const sheetsTableHeaders = showPrices
      ? [["Description", "Qty", "Actual (Rs)", "Customer (Rs)"]]
        : [["Description", "Qty"]]  // ✅ Customer: Description + Quantity ONLY


    // ✅ MODIFIED: Sheets table body
    const sheetsTableBody = showPrices
      ? [
          [
            "Album Sheets",
            sheetsQuantity.toString(),
            `Rs ${sheetsActualPrice.toLocaleString("en-IN")} × ${sheetsQuantity} = Rs ${sheetsActualTotal.toLocaleString("en-IN")}`,
            `Rs ${sheetsPricePerSheet.toLocaleString("en-IN")} × ${sheetsQuantity} = Rs ${sheetsCustomerTotal.toLocaleString("en-IN")}`,
          ],
        ]
      : [
           // ✅ CUSTOMER PDF: Description + Quantity ONLY
      [
        "Album Sheets",
        sheetsQuantity.toString()
      ],
    ]


    autoTable(doc, {
      startY: contentY,
      head: sheetsTableHeaders,
      body: sheetsTableBody,
      theme: "striped",
      headStyles: {
        fillColor: THEME_COLOR,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 2.5,
      },
      columnStyles: showPrices
    ? {
        0: { cellWidth: 60, halign: "left" },
        1: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 50, halign: "right" },
        3: { cellWidth: 50, halign: "right" },
      }
    : {
        0: { cellWidth: 85, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
      },
      margin: { left: SAFE_MARGIN, right: SAFE_MARGIN },
      pageBreak: "avoid",
    })

    contentY = doc.lastAutoTable.finalY + 8
  }

  if (contentY > 220) {
    doc.addPage()
    addPageHeader(doc)
    contentY = HEADER_SAFE_START_Y
  }

  const summaryBoxHeight = showPrices ? 50 : 32

  doc.setDrawColor(...THEME_COLOR)
  doc.setLineWidth(0.6)
  doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, summaryBoxHeight)

  doc.setFillColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text("PAYMENT SUMMARY", SAFE_MARGIN + 3, contentY + 5)

  contentY += 11

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(0)

  const PRICE_RIGHT_X = SAFE_MARGIN + CONTENT_WIDTH - 10

  if (showPrices) {
    doc.setFont("helvetica", "bold")
    doc.setTextColor(220, 38, 38)
    doc.text("Actual Price Total:", SAFE_MARGIN + 3, contentY)
    doc.text(
      `Rs ${actualGrandTotal.toLocaleString("en-IN")}/-`,
      PRICE_RIGHT_X,
      contentY,
      { align: "right" }
    )
    contentY += 6

    doc.setFont("helvetica", "normal")
    doc.setTextColor(0)
  }

  doc.setFont("helvetica", "bold")
  doc.text("Customer Price Total:", SAFE_MARGIN + 3, contentY)
  doc.text(
    `Rs ${customerGrandTotal.toLocaleString("en-IN")}/-`,
    PRICE_RIGHT_X,
    contentY,
    { align: "right" }
  )
  contentY += 6

  if (discountPercent > 0) {
    doc.setFont("helvetica", "normal")
    doc.setTextColor(220, 38, 38)
    doc.text(`Discount (${discountPercent}%):`, SAFE_MARGIN + 3, contentY)
    doc.text(
      `-Rs ${discountAmount.toLocaleString("en-IN")}/-`,
      PRICE_RIGHT_X,
      contentY,
      { align: "right" }
    )
    contentY += 6
    doc.setTextColor(0)
  }

  doc.setDrawColor(...THEME_COLOR)
  doc.setLineWidth(0.4)
  doc.line(SAFE_MARGIN + 5, contentY, SAFE_MARGIN + CONTENT_WIDTH - 5, contentY)
  contentY += 5

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...THEME_COLOR)
  doc.text("FINAL AMOUNT:", SAFE_MARGIN + 3, contentY)
  doc.text(
    `Rs ${finalTotal.toLocaleString("en-IN")}/-`,
    PRICE_RIGHT_X,
    contentY,
    { align: "right" }
  )

  doc.addPage()
addPageHeader(doc)  // Optional: Add header if needed
doc.addImage("/Terms & Conditions.jpeg", "JPEG", 0, 0, 210, PAGE_HEIGHT)
  return doc
}

const buildServiceList = (eventEquipment = []) => {
  return eventEquipment
    .filter(eq => eq.selected && eq.equipmentId !== "Not Selected")
    .map(eq => {
      const qty = eq.quantity || 1
      return `${eq.category} - ${qty}`
    })
    .join("\n")
}
 
export const generateCustomerQuotationPDF = (
  quotation,
  calculateQuotationTotal
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  })

  addPageHeader(doc)
  doc.setFont("helvetica", "normal")

  const totals = calculateQuotationTotal()
  

 const customerGrandTotal =
  Number(totals.grandTotal?.replace(/,/g, "")) || 0

const discountPercent = Number(quotation.discount || 0)

const discountAmount = Math.round(
  (customerGrandTotal * discountPercent) / 100
)

const finalTotal = customerGrandTotal - discountAmount


  let contentY = HEADER_SAFE_START_Y

  /* ---------- TITLE ---------- */
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...THEME_COLOR)
  // doc.text("QUOTATION", SAFE_MARGIN, 75)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(
    `Date: ${new Date().toLocaleDateString("en-IN")}`,
    210 - SAFE_MARGIN,
    60,
    { align: "right" }
  )

  /* ---------- CUSTOMER INFO ---------- */
  const CUSTOMER_BOX_Y = 82
  doc.setDrawColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, CUSTOMER_BOX_Y, CONTENT_WIDTH, 33)

  doc.setFillColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, CUSTOMER_BOX_Y, CONTENT_WIDTH, 7, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(255)
  doc.text("CUSTOMER INFORMATION", SAFE_MARGIN + 3, CUSTOMER_BOX_Y + 5)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(30)

  doc.text(`Name: ${quotation.firstName} ${quotation.lastName || ""}`, SAFE_MARGIN + 3, CUSTOMER_BOX_Y + 13)
  doc.text(`Phone: ${quotation.customerPhone}`, SAFE_MARGIN + 3, CUSTOMER_BOX_Y + 18)
  doc.text(`Email: ${quotation.customerEmail}`, SAFE_MARGIN + 3, CUSTOMER_BOX_Y + 23)
  doc.text(`Location: ${quotation.location || "Not specified"}`, SAFE_MARGIN + 3, CUSTOMER_BOX_Y + 28)

  /* ---------- EVENTS TABLE ---------- */
  contentY = CUSTOMER_BOX_Y + 37

contentY = CUSTOMER_BOX_Y + 37

autoTable(doc, {
  startY: contentY,
  head: [[
    "Event",
    "Schedule",
    "Event Location",
    "Services / Equipment"
  ]],
  body: quotation.selectedEvents.map((e) => [
    e,
    quotation.eventDates?.[e]?.date
      ? `${new Date(
          quotation.eventDates[e].date
        ).toLocaleDateString("en-IN")} (${quotation.eventDates[e].timeSlot || "TBD"})`
      : "To be scheduled",
    quotation.eventDates?.[e]?.location || "Not specified",
    buildServiceList(quotation.selectedEquipment?.[e]),
  ]),
  theme: "grid",

  headStyles: {
    fillColor: THEME_COLOR,
    textColor: 255,
    fontStyle: "bold",
    fontSize: 9,
    halign: "center",
    valign: "middle",
  },

  bodyStyles: {
    fontSize: 8.5,
    cellPadding: 3,
    halign: "center",
    valign: "middle",
    textColor: 30,
  },

  columnStyles: {
    0: { cellWidth: 30 },
    1: { cellWidth: 45 },
    2: { cellWidth: 45 },
    3: { cellWidth: 60 },
  },

  margin: { left: SAFE_MARGIN, right: SAFE_MARGIN },
})



  contentY = doc.lastAutoTable.finalY +2

  /* ---------- ALBUM SHEETS ---------- */
  if (quotation.sheetsCount > 0) {
  doc.setFillColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(255)

  // Left label
  doc.text(
    "ALBUM SHEETS",
    SAFE_MARGIN + 3,
    contentY + 5
  )

  // Centered value
  doc.text(
    String(quotation.sheetsCount),
    SAFE_MARGIN + CONTENT_WIDTH / 2,
    contentY + 5,
    { align: "center" }
  )

  contentY += 14
}

contentY += 24   // 👈 adds vertical space

  /* ---------- PAYMENT SUMMARY ---------- */
  doc.setDrawColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 32)

  doc.setFillColor(...THEME_COLOR)
  doc.rect(SAFE_MARGIN, contentY, CONTENT_WIDTH, 7, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(255)
  doc.text("PAYMENT SUMMARY", SAFE_MARGIN + 3, contentY + 5)

  contentY += 12
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(30)

 doc.text("Customer Price Total:", SAFE_MARGIN + 3, contentY)
doc.text(
  formatCurrency(customerGrandTotal),
  SAFE_MARGIN + CONTENT_WIDTH - 3,
  contentY,
  { align: "right" }
)

contentY += 6

if (discountPercent > 0) {
  doc.setTextColor(220, 38, 38)
  doc.text(`Discount (${discountPercent}%):`, SAFE_MARGIN + 3, contentY)
  doc.text(
    `- ${formatCurrency(discountAmount)}`,
    SAFE_MARGIN + CONTENT_WIDTH - 3,
    contentY,
    { align: "right" }
  )
  contentY += 6
}

doc.setDrawColor(...THEME_COLOR)
doc.line(
  SAFE_MARGIN + 5,
  contentY,
  SAFE_MARGIN + CONTENT_WIDTH - 5,
  contentY
)

contentY += 6

doc.setFont("helvetica", "bold")
doc.setFontSize(11)
doc.setTextColor(...THEME_COLOR)
doc.text("FINAL AMOUNT:", SAFE_MARGIN + 3, contentY)
doc.text(
  formatCurrency(finalTotal),
  SAFE_MARGIN + CONTENT_WIDTH - 3,
  contentY,
  { align: "right" }
)



  /* ---------- TERMS PAGE ---------- */
  doc.addPage()
  addPageHeader(doc)
  doc.addImage("/Terms & Conditions.jpeg", "JPEG", 0, 0, 210, PAGE_HEIGHT)

  return doc
}

