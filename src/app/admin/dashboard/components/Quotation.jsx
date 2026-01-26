'use client'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { 
  generateQuotationPDF,
  generateCustomerQuotationPDF
} from './QuotationPDF'

import { SERVICES_BY_EVENT, SERVICE_TO_CAMERA_MAP } from './constants'

export default function Quotation({ 
  quotation, 
  setQuotation, 
  quotationPricing, 
  activeRequirementTab, 
  setActiveRequirementTab,
  newEventName,
  setNewEventName,
  loading,
  setLoading,
  showToast ,
  refreshCustomers   // ✅ ADD THIS

}) {
  const scrollRef = useRef(null)
  const [showCustomEventInput, setShowCustomEventInput] = useState(false)
  
  const [equipmentList, setEquipmentList] = useState([])
  const [loadingEquipment, setLoadingEquipment] = useState(true)

  useEffect(() => {
    loadEquipmentFromPricingList()
  }, [])

  const loadEquipmentFromPricingList = async () => {
    try {
      const response = await fetch('/api/quotation-pricing')
      const data = await response.json()
      if (data.items && data.items.length > 0) {
        setEquipmentList(data.items)
        console.log('✅ Loaded equipment:', data.items.length)
      }
    } catch (error) {
      console.error('Failed to load equipment:', error)
      showToast('Failed to load equipment list', 'error')
    } finally {
      setLoadingEquipment(false)
    }
  }

  // const scrollToTop = useCallback(() => {
  //   scrollRef.current?.scrollIntoView({ 
  //     behavior: 'smooth', 
  //     block: 'start' 
  //   })
  //   window.scrollTo({ top: 0, behavior: 'smooth' })
  // }, [])

  const isCustomEvent = (eventType) => {
    return !Object.keys(SERVICES_BY_EVENT).includes(eventType)
  }

  // ✅ UPDATED: Calculate total WITH QUANTITY
  const calculateQuotationTotal = () => {
    let equipmentActualTotal = 0
    let equipmentCustomerTotal = 0

    if (quotation.selectedEquipment) {
      Object.keys(quotation.selectedEquipment).forEach(eventType => {
        const eventEquipment = quotation.selectedEquipment[eventType] || []
        eventEquipment.forEach(eq => {
          if (eq.selected && eq.equipmentId && eq.equipmentId !== 'Not Selected') {
            const quantity = eq.quantity || 1
            const unitActualPrice = eq.unitActualPrice || 0
            const unitCustomerPrice = eq.unitCustomerPrice || 0
            
            equipmentActualTotal += unitActualPrice * quantity
            equipmentCustomerTotal += unitCustomerPrice * quantity
          }
        })
      })
    }

    const sheetsQuantity = parseInt(quotation.sheetsCount) || 0
    const sheetsPricePerSheet = quotation.sheetsPricePerSheet || 0
    const sheetsActualPricePerSheet = quotation.sheetsActualPricePerSheet || 0
    const sheetsCustomerTotal = sheetsQuantity * sheetsPricePerSheet
    const sheetsActualTotal = sheetsQuantity * sheetsActualPricePerSheet

    const actualGrandTotal = equipmentActualTotal + sheetsActualTotal
    const customerGrandTotal = equipmentCustomerTotal + sheetsCustomerTotal

    const discountPercent = parseFloat(quotation.discount) || 0
    const discountAmount = Math.round((customerGrandTotal * discountPercent) / 100)

    const finalTotal = customerGrandTotal - discountAmount

    const formatNumber = (num) =>
      Math.round(num)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return {
      equipmentActualTotal: formatNumber(equipmentActualTotal),
      equipmentTotal: formatNumber(equipmentCustomerTotal),
      sheetsActualTotal: formatNumber(sheetsActualTotal),
      sheetsTotal: formatNumber(sheetsCustomerTotal),
      actualGrandTotal: formatNumber(actualGrandTotal),
      grandTotal: formatNumber(customerGrandTotal),
      discountAmount: formatNumber(discountAmount),
      discountPercent,
      total: formatNumber(finalTotal)
    }
  }

  const toggleEventSelection = (eventType) => {
    setQuotation((prev) => {
      const isSelected = prev.selectedEvents.includes(eventType)
      
      if (isSelected) {
        const newEventDates = { ...prev.eventDates }
        delete newEventDates[eventType]
        
        const newSelectedEquipment = { ...(prev.selectedEquipment || {}) }
        delete newSelectedEquipment[eventType]
        
        return {
          ...prev,
          selectedEvents: prev.selectedEvents.filter((e) => e !== eventType),
          eventDates: newEventDates,
          selectedEquipment: newSelectedEquipment
        }
      } else {
        const categories = [
          'Traditional Photography',
          'Traditional Videography',
          'Candid Photography',
          'Candid Videography',
          'Drone',
          'Live Streaming',
          'LED Walls'
        ]
        
        const initialEquipment = categories.map((category, idx) => ({
          id: `${eventType}-${idx}`,
          category: category,
          selected: false,
          equipmentId: 'Not Selected',
          timeSlot: 'Not Selected',
          quantity: 1,
          unitActualPrice: 0,
          unitCustomerPrice: 0
        }))
        
        return {
          ...prev,
          selectedEvents: [...prev.selectedEvents, eventType],
          eventDates: {
            ...prev.eventDates,
            [eventType]: { date: "", timeSlot: "" }
          },
          selectedEquipment: {
            ...(prev.selectedEquipment || {}),
            [eventType]: initialEquipment
          }
        }
      }
    })
    
    // setTimeout(() => {
    //   scrollToTop()
    //   if (!quotation.selectedEvents.includes(eventType)) {
    //     setActiveRequirementTab(eventType)
    //   }
    // }, 100)
  }

  const cancelEvent = (eventType) => {
    setQuotation((prev) => {
      const newEventDates = { ...prev.eventDates }
      delete newEventDates[eventType]
      
      const newSelectedEquipment = { ...(prev.selectedEquipment || {}) }
      delete newSelectedEquipment[eventType]
      
      return {
        ...prev,
        selectedEvents: prev.selectedEvents.filter((e) => e !== eventType),
        eventDates: newEventDates,
        selectedEquipment: newSelectedEquipment
      }
    })
    
    // setTimeout(() => {
    //   scrollToTop()
    //   const remainingEvents = quotation.selectedEvents.filter(e => e !== eventType)
    //   if (remainingEvents.length > 0) {
    //     setActiveRequirementTab(remainingEvents[0])
    //   } else {
    //     setActiveRequirementTab('')
    //   }
    // }, 100)
  }

  const handleAddCustomEvent = () => {
    const trimmed = newEventName.trim()
    if (!trimmed) return

    if (quotation.selectedEvents.includes(trimmed)) {
      // scrollToTop()
      setActiveRequirementTab(trimmed)
      setNewEventName("")
      setShowCustomEventInput(false)
      return
    }

    const categories = [
      'Traditional Photography',
      'Traditional Videography',
      'Candid Photography',
      'Candid Videography',
      'Drone',
      'Live Streaming',
      'LED Walls'
    ]
    
    const initialEquipment = categories.map((category, idx) => ({
      id: `${trimmed}-${idx}`,
      category: category,
      selected: false,
      equipmentId: 'Not Selected',
      timeSlot: 'Not Selected',
      quantity: 1,
      unitActualPrice: 0,
      unitCustomerPrice: 0
    }))

    setQuotation((prev) => ({
      ...prev,
      selectedEvents: [...prev.selectedEvents, trimmed],
      eventDates: {
        ...prev.eventDates,
        [trimmed]: { date: "", timeSlot: "" }
      },
      selectedEquipment: {
        ...(prev.selectedEquipment || {}),
        [trimmed]: initialEquipment
      }
    }))

    // scrollToTop()
    setActiveRequirementTab(trimmed)
    setNewEventName("")
    setShowCustomEventInput(false)
  }

  const toggleCategorySelection = (eventType, categoryIndex) => {
    setQuotation(prev => {
      const currentSelectedEquipment = prev.selectedEquipment || {}
      const currentEventEquipment = currentSelectedEquipment[eventType] || []
      
      const updatedEquipment = currentEventEquipment.map((eq, idx) => {
        if (idx === categoryIndex) {
          return { 
            ...eq, 
            selected: !eq.selected,
            equipmentId: !eq.selected ? eq.equipmentId : 'Not Selected',
            timeSlot: !eq.selected ? eq.timeSlot : 'Not Selected',
            quantity: !eq.selected ? (eq.quantity || 1) : 1,
            unitActualPrice: !eq.selected ? eq.unitActualPrice : 0,
            unitCustomerPrice: !eq.selected ? eq.unitCustomerPrice : 0
          }
        }
        return eq
      })

      return {
        ...prev,
        selectedEquipment: {
          ...currentSelectedEquipment,
          [eventType]: updatedEquipment
        }
      }
    })
  }

  const updateTimeSlot = (eventType, categoryIndex, timeSlot) => {
    setQuotation(prev => {
      const currentSelectedEquipment = prev.selectedEquipment || {}
      const currentEventEquipment = currentSelectedEquipment[eventType] || []
      
      const updatedEquipment = currentEventEquipment.map((eq, idx) => {
        if (idx === categoryIndex) {
          const selectedItem = equipmentList.find(item => item.id === parseInt(eq.equipmentId))
          
          let unitActualPrice = eq.unitActualPrice
          let unitCustomerPrice = eq.unitCustomerPrice
          
          if (selectedItem && timeSlot !== 'Not Selected') {
            if (timeSlot === 'Half Day') {
              unitActualPrice = selectedItem.actualPriceHalfDay || 0
              unitCustomerPrice = selectedItem.customerPriceHalfDay || 0
            } else if (timeSlot === 'Full Day') {
              unitActualPrice = selectedItem.actualPriceFullDay || 0
              unitCustomerPrice = selectedItem.customerPriceFullDay || 0
            }
          } else {
            unitActualPrice = 0
            unitCustomerPrice = 0
          }
          
          return { 
            ...eq, 
            timeSlot,
            unitActualPrice,
            unitCustomerPrice
          }
        }
        return eq
      })

      return {
        ...prev,
        selectedEquipment: {
          ...currentSelectedEquipment,
          [eventType]: updatedEquipment
        }
      }
    })
  }

  const handleGlobalTimeSlotChange = (eventType, globalTimeSlot) => {
    setQuotation(prev => {
      const currentSelectedEquipment = prev.selectedEquipment || {}
      const currentEventEquipment = currentSelectedEquipment[eventType] || []
      
      const updatedEquipment = currentEventEquipment.map(eq => {
        const selectedItem = equipmentList.find(item => item.id === parseInt(eq.equipmentId))
        
        let unitActualPrice = eq.unitActualPrice
        let unitCustomerPrice = eq.unitCustomerPrice
        
        if (selectedItem && globalTimeSlot !== '' && eq.equipmentId !== 'Not Selected') {
          if (globalTimeSlot === 'Half Day') {
            unitActualPrice = selectedItem.actualPriceHalfDay || 0
            unitCustomerPrice = selectedItem.customerPriceHalfDay || 0
          } else if (globalTimeSlot === 'Full Day') {
            unitActualPrice = selectedItem.actualPriceFullDay || 0
            unitCustomerPrice = selectedItem.customerPriceFullDay || 0
          }
        } else if (globalTimeSlot === '') {
          unitActualPrice = 0
          unitCustomerPrice = 0
        }
        
        return {
          ...eq,
          timeSlot: globalTimeSlot || 'Not Selected',
          unitActualPrice,
          unitCustomerPrice
        }
      })

      return {
        ...prev,
        eventDates: {
          ...prev.eventDates,
          [eventType]: {
            ...prev.eventDates[eventType],
            timeSlot: globalTimeSlot
          }
        },
        selectedEquipment: {
          ...currentSelectedEquipment,
          [eventType]: updatedEquipment
        }
      }
    })
  }

  const updateCameraModel = (eventType, categoryIndex, modelId) => {
    const selectedItem = equipmentList.find(item => item.id === parseInt(modelId))
    
    setQuotation(prev => {
      const currentSelectedEquipment = prev.selectedEquipment || {}
      const currentEventEquipment = currentSelectedEquipment[eventType] || []
      
      const updatedEquipment = currentEventEquipment.map((eq, idx) => {
        if (idx === categoryIndex) {
          if (modelId === 'Not Selected') {
            return { 
              ...eq, 
              equipmentId: 'Not Selected',
              unitActualPrice: 0,
              unitCustomerPrice: 0
            }
          } else if (selectedItem) {
            const currentTimeSlot = eq.timeSlot || 'Not Selected'
            let unitActualPrice = 0
            let unitCustomerPrice = 0
            
            if (currentTimeSlot === 'Half Day') {
              unitActualPrice = selectedItem.actualPriceHalfDay || 0
              unitCustomerPrice = selectedItem.customerPriceHalfDay || 0
            } else if (currentTimeSlot === 'Full Day') {
              unitActualPrice = selectedItem.actualPriceFullDay || 0
              unitCustomerPrice = selectedItem.customerPriceFullDay || 0
            } else {
              unitActualPrice = selectedItem.actualPriceHalfDay || 0
              unitCustomerPrice = selectedItem.customerPriceHalfDay || 0
            }
            
            return { 
              ...eq, 
              equipmentId: selectedItem.id,
              unitActualPrice,
              unitCustomerPrice
            }
          }
        }
        return eq
      })

      return {
        ...prev,
        selectedEquipment: {
          ...currentSelectedEquipment,
          [eventType]: updatedEquipment
        }
      }
    })
  }

  // ✅ NEW: Update Actual Price (now editable)
  const updateActualPrice = (eventType, categoryIndex, price) => {
    setQuotation(prev => {
      const currentSelectedEquipment = prev.selectedEquipment || {}
      const currentEventEquipment = currentSelectedEquipment[eventType] || []
      
      const updatedEquipment = currentEventEquipment.map((eq, idx) => {
        if (idx === categoryIndex) {
          return { ...eq, unitActualPrice: parseInt(price) || 0 }
        }
        return eq
      })

      return {
        ...prev,
        selectedEquipment: {
          ...currentSelectedEquipment,
          [eventType]: updatedEquipment
        }
      }
    })
  }

  const updateCustomerPrice = (eventType, categoryIndex, price) => {
    setQuotation(prev => {
      const currentSelectedEquipment = prev.selectedEquipment || {}
      const currentEventEquipment = currentSelectedEquipment[eventType] || []
      
      const updatedEquipment = currentEventEquipment.map((eq, idx) => {
        if (idx === categoryIndex) {
          return { ...eq, unitCustomerPrice: parseInt(price) || 0 }
        }
        return eq
      })

      return {
        ...prev,
        selectedEquipment: {
          ...currentSelectedEquipment,
          [eventType]: updatedEquipment
        }
      }
    })
  }

  // ✅ NEW: Update Quantity
  const updateQuantity = (eventType, categoryIndex, quantity) => {
    setQuotation(prev => {
      const currentSelectedEquipment = prev.selectedEquipment || {}
      const currentEventEquipment = currentSelectedEquipment[eventType] || []
      
      const updatedEquipment = currentEventEquipment.map((eq, idx) => {
        if (idx === categoryIndex) {
          return { ...eq, quantity: Math.max(1, parseInt(quantity) || 1) }
        }
        return eq
      })

      return {
        ...prev,
        selectedEquipment: {
          ...currentSelectedEquipment,
          [eventType]: updatedEquipment
        }
      }
    })
  }

  // ✅ UPDATED: Category mapping for 4 camera types
  const getCamerasForCategory = (category) => {
    const categoryMap = {
      'Traditional Photography': 'Traditional Photo Camera',
      'Traditional Videography': 'Traditional Video Camera',
      'Candid Photography': 'Candid Photo Camera',
      'Candid Videography': 'Candid Video Camera',
      'Drone': 'Drone',
      'Live Streaming': 'Net Live',
      'LED Walls': 'LED Wall'
    }
    
    const equipmentCategory = categoryMap[category]
    return equipmentList.filter(item => item.category === equipmentCategory)
  }

  const getSheetTypes = () => {
    return equipmentList.filter(item => item.category === 'Sheets')
  }

  const handleSheetTypeChange = (sheetId) => {
    const selectedSheet = equipmentList.find(item => item.id === parseInt(sheetId))
    
    if (selectedSheet) {
      setQuotation({
        ...quotation,
        sheetsTypeId: selectedSheet.id,
        sheetsPricePerSheet: selectedSheet.customerPriceHalfDay || 0,
        sheetsActualPricePerSheet: selectedSheet.actualPriceHalfDay || 0
      })
    } else {
      setQuotation({
        ...quotation,
        sheetsTypeId: null,
        sheetsPricePerSheet: 0,
        sheetsActualPricePerSheet: 0
      })
    }
  }

 // Update these functions in Quotation.jsx

const sendQuotationEmail = async () => {
  if (!quotation.customerEmail) {
    showToast("Please enter customer email", "error")
    return
  }
  if (!quotation.firstName || !quotation.customerPhone) {
    showToast("Please fill customer details", "error")
    return
  }
  try {
    setLoading(true)
    
    // 🆕 Pass equipmentList to PDF generators
    const pdfWithPrices = generateQuotationPDF(
      quotation,
      calculateQuotationTotal,
      true,
      equipmentList // 🆕 Add equipment list
    )

    const pdfWithoutPrices = generateCustomerQuotationPDF(
      quotation,
      calculateQuotationTotal,
      equipmentList // 🆕 Add equipment list
    )
    
    const pdfOwnerBlob = pdfWithPrices.output("blob")
    const pdfCustomerBlob = pdfWithoutPrices.output("blob")
    
    const formData = new FormData()
    formData.append("pdfOwner", pdfOwnerBlob, "quotation_owner.pdf")
    formData.append("pdfCustomer", pdfCustomerBlob, "quotation_customer.pdf")
    formData.append("customerEmail", quotation.customerEmail)
    formData.append("subject", `Quotation from Kalakruthi Photography - ${quotation.selectedEvents.join(", ")}`)
    formData.append("customerName", `${quotation.firstName} ${quotation.lastName || ''}`)
    formData.append("eventType", quotation.selectedEvents.join(", "))

    const response = await fetch("/api/send-quotation", {
      method: "POST",
      body: formData,
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || "Failed to send email")
    }
    
    showToast("Quotation sent successfully!", "success")
  } catch (error) {
    console.error("Email error:", error)
    showToast(`Error: ${error.message}`, "error")
  } finally {
    setLoading(false)
  }
}

const downloadQuotationPDF = () => {
  // 🆕 Pass equipmentList to PDF generator
  const pdf = generateQuotationPDF(
    quotation,
    calculateQuotationTotal,
    true,
    equipmentList // 🆕 Add equipment list
  )
  pdf.save(`Quotation_${quotation.firstName}${quotation.lastName || ''}.pdf`)
  showToast("PDF downloaded!", "success")
}

const downloadCustomerPDF = () => {
  // 🆕 Pass equipmentList to PDF generator
  const pdf = generateCustomerQuotationPDF(
    quotation,
    calculateQuotationTotal,
    equipmentList // 🆕 Add equipment list
  )
  pdf.save(`Quotation_Customer_${quotation.firstName}${quotation.lastName || ''}.pdf`)
  showToast("Customer PDF downloaded!", "success")
}

  const totals = calculateQuotationTotal()

  const eventTypes = [
    'Birthday',
    'Mature Function', 
    'Engagement',
    'Haldi',
    'Sangeeth',
    'Formalties',
    'Marriage',
    'Reception',
    'Vratham',
    'PrePost Wedding', 
  ]

  const timeSlots = ["Half Day", "Full Day"]

  
// ✅ ADD THIS FUNCTION IN Quotation.jsx (before the return statement)

// Updated saveQuotationToCustomer function for Quotation.jsx

const saveQuotationToCustomer = async () => {
  if (!quotation.customerEmail) {
    showToast("Please enter customer email", "error")
    return
  }
  if (!quotation.firstName || !quotation.customerPhone) {
    showToast("Please fill customer details", "error")
    return
  }

  try {
    setLoading(true)

    // 🆕 Pass equipmentList to PDF generators
    const pdfWithPrices = generateQuotationPDF(
      quotation,
      calculateQuotationTotal,
      true,
      equipmentList // 🆕 Add equipment list
    )

    const pdfWithoutPrices = generateCustomerQuotationPDF(
      quotation,
      calculateQuotationTotal,
      equipmentList // 🆕 Add equipment list
    )

    const ownerPdfBase64 = pdfWithPrices.output("dataurlstring").split(",")[1]
    const customerPdfBase64 = pdfWithoutPrices.output("dataurlstring").split(",")[1]

    const totals = calculateQuotationTotal()
    const fileName = `Quotation_${quotation.firstName}_${Date.now()}`
    const cleanTotal = Number(totals.total.replace(/,/g, ""))

    // Step 1: Get or create customer
    let customerId = null

    try {
      const customersRes = await fetch("/api/customers")
      const customers = await customersRes.json()

      const existingCustomer = customers.find(
        c => c.phone === quotation.customerPhone
      )

      if (existingCustomer) {
        customerId = existingCustomer._id
        console.log("✅ Found existing customer:", customerId)
      } else {
        const createRes = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${quotation.firstName} ${quotation.lastName || ""}`,
            email: quotation.customerEmail,
            phone: quotation.customerPhone,
            location: quotation.location || "",
            date: new Date().toISOString().split("T")[0],
            totalAmount: cleanTotal,
            amount: 0,
            dueAmount: cleanTotal,
            advances: [],
            hardDisk: "Hard Disk",
            hardDiskAmount: 5000,
            status: "Pending",
          }),
        })

        if (!createRes.ok) {
          throw new Error("Failed to create customer")
        }

        const created = await createRes.json()
        customerId = created._id || created.id
        console.log("✅ Created new customer:", customerId)
      }
    } catch (customerError) {
      console.error("❌ Customer fetch error:", customerError)
      showToast("Error fetching customer data", "error")
      return
    }

    if (!customerId) {
      showToast("Failed to get customer ID", "error")
      return
    }

    // Step 2: Save quotation with PDFs
    try {
      const quotationRes = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          quotationData: {
            ...quotation,
            events: quotation.selectedEvents,
            equipment: quotation.selectedEquipment,
          },
          pdfData: {
            ownerPdfBase64,
            customerPdfBase64,
            fileName,
          },
          totals,
        }),
      })

      if (!quotationRes.ok) {
        const errorText = await quotationRes.text()
        console.error("❌ Quotation save failed:", errorText)
        throw new Error("Failed to save quotation")
      }

      const quotationResult = await quotationRes.json()
      console.log("✅ Quotation saved:", quotationResult)

      showToast("✅ Quotation saved to customer details!", "success")
      if (typeof refreshCustomers === "function") {
  await refreshCustomers()
}
      






      // Reset form after successful save
      setTimeout(() => {
        setQuotation({
          firstName: "",
          lastName: "",
          customerEmail: "",
          customerPhone: "",
          location: "",
          selectedEvents: [],
          eventDates: {},
          selectedEquipment: {},
          sheetsCount: 0,
          sheetsPricePerSheet: 0,
          sheetsActualPricePerSheet: 0,
          discount: 0,
        })
      }, 500)

    } catch (quotationError) {
      console.error("❌ Quotation error:", quotationError)
      showToast(`Error: ${quotationError.message}`, "error")
    }

  } catch (err) {
    console.error("❌ Unexpected error:", err)
    showToast("Failed to save quotation", "error")
  } finally {
    setLoading(false)
  }
}


  return (
    <div ref={scrollRef}>
      <style>{`
        .quotation-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cancel-event-btn {
          background: #f59e0b !important;
          color: white !important;
          padding: 4px 8px !important;
          font-size: 11px !important;
          border-radius: 4px !important;
          margin-left: 4px !important;
          min-width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .cancel-event-btn:hover {
          background: #d97706 !important;
        }

        .requirement-row {
          display: grid;
          grid-template-columns: 30px 150px 180px 110px 70px 110px 110px;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .equipment-header {
          display: grid;
          grid-template-columns: 30px 150px 180px 110px 70px 110px 110px;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 2px solid #e5e7eb;
          font-weight: 600;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .equipment-header {
            display: none !important;
          }
          
          .requirement-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            padding: 16px !important;
            background: #f9fafb !important;
            border-radius: 8px !important;
            border: 1px solid #e5e7eb !important;
            margin-bottom: 12px !important;
          }

          .quotation-section {
            padding: 16px !important;
            margin-bottom: 12px !important;
          }

          .section-title {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }

          .form-group {
            gap: 12px !important;
          }

          .form-input,
          .form-select {
            padding: 8px !important;
            font-size: 13px !important;
          }

          .event-buttons-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }

          .mobile-label {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #64748b !important;
            margin-bottom: 6px !important;
            display: block !important;
          }
        }

        @media (min-width: 769px) { 
          .mobile-label {
            display: none !important;
          }
        }
      `}</style>

      <div className="quotation-container">
        {/* Customer Details Section */}
        <div className="quotation-section" style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          
        }}>
          <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "700",textAlign:"left", color: "#1f2937", marginBottom: "16px" }}>
            📋 Customer Details
          </h3>
          <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                Name
              </label>
              <input
                type="text"
                value={quotation.firstName || ""}
                onChange={(e) => setQuotation({ ...quotation, firstName: e.target.value })}
                className="form-input"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

         

            <div>
              <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={quotation.customerPhone || ""}
                onChange={(e) => setQuotation({ ...quotation, customerPhone: e.target.value })}
                className="form-input"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
            
            <div>
              <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={quotation.customerEmail || ""}
                onChange={(e) => setQuotation({ ...quotation, customerEmail: e.target.value })}
                className="form-input"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
                  <div>
              <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                📍 Location
              </label>
              <input
                type="text"
                placeholder="Enter Customer location"
                value={quotation.location || ""}
                onChange={(e) => setQuotation({ ...quotation, location: e.target.value })}
                className="form-input"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Event Selection */}
        <div className="quotation-section" style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "700",textAlign:"left", color: "#1f2937", marginBottom: "16px" }}>
            🎉 Select Event Types
          </h3>
          <div className="event-buttons-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "16px" }}>
            {eventTypes.map((eventType) => (
              <button
                key={eventType}
                onClick={() => toggleEventSelection(eventType)}
                className="event-button"
                style={{
                  padding: "12px",
                  border: quotation.selectedEvents.includes(eventType)
                    ? "2px solid #10b981"
                    : "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: quotation.selectedEvents.includes(eventType) ? "#d1fae5" : "white",
                  color: quotation.selectedEvents.includes(eventType) ? "#065f46" : "#4b5563",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {quotation.selectedEvents.includes(eventType) ? "✓ " : ""}{eventType}
              </button>
            ))}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setShowCustomEventInput(!showCustomEventInput)}
              style={{
                padding: "10px 20px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              + Add Custom Event
            </button>
            {showCustomEventInput && (
              <>
                <input
                  type="text"
                  placeholder="Enter custom event name..."
                  value={newEventName || ""}
                  onChange={(e) => setNewEventName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCustomEvent()}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={handleAddCustomEvent}
                  style={{
                    padding: "10px 16px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </>
            )}
          </div>
        </div>

        {/* SELECT REQUIREMENTS */}
        {quotation.selectedEvents.length > 0 && (
          <div className="quotation-section" style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "700",textAlign:"left", color: "#1f2937", marginBottom: "16px" }}>
              📸 Select Requirements
            </h3>
            
            <div className="event-tabs" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {quotation.selectedEvents.map((eventType) => (
                <div key={eventType} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    onClick={() => {
                      // scrollToTop()
                      setActiveRequirementTab(eventType)
                    }}
                    className="event-tab-button"
                    style={{
                      padding: "10px 16px",
                      background: activeRequirementTab === eventType ? "#10b981" : "#f3f4f6",
                      color: activeRequirementTab === eventType ? "white" : "#4b5563",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {eventType}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      cancelEvent(eventType)
                    }}
                    className="cancel-event-btn"
                    title="Cancel this event"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {activeRequirementTab && (
              <>
                {/* Event Date & Global Time Slot */}
                <div className="event-dates-display" style={{
                  background: "#f9fafb",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                        📅 Event Date
                      </label>
                      <input
                        type="date"
                        value={quotation.eventDates[activeRequirementTab]?.date || ""}
                        onChange={(e) =>
                          setQuotation({
                            ...quotation,
                            eventDates: {
                              ...quotation.eventDates,
                              [activeRequirementTab]: {
                                ...quotation.eventDates[activeRequirementTab],
                                date: e.target.value,
                              },
                            },
                          })
                        }
                        className="date-input"
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                       <div>
              <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                📍 Event Location
              </label>
             <input
  type="text"
  placeholder="Enter event location"
  value={quotation.eventDates[activeRequirementTab]?.location || ""}
  onChange={(e) =>
    setQuotation({
      ...quotation,
      eventDates: {
        ...quotation.eventDates,
        [activeRequirementTab]: {
          ...quotation.eventDates[activeRequirementTab],
          location: e.target.value,
        },
      },
    })
  }
  className="form-input"
  style={{
    width: "100%",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
  }}
/>

            </div>
                    <div>
                      <label className="form-label" style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                        ⏰ Apply Time Slot to All (Optional)
                      </label>
                      <select
                        value={quotation.eventDates[activeRequirementTab]?.timeSlot || ""}
                        onChange={(e) => handleGlobalTimeSlotChange(activeRequirementTab, e.target.value)}
                        className="form-select"
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #3b82f6",
                          borderRadius: "6px",
                          fontSize: "13px",
                          background: "white",
                          fontWeight: "600"
                        }}
                      >
                        <option value="">Quick fill all...</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Equipment List */}
                <div style={{ marginBottom: "16px" }}>
                  {loadingEquipment ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                      Loading equipment...
                    </div>
                  ) : (
                    <>
                      {/* Desktop Header */}
                      <div className="equipment-header">
                        <div></div>
                        <div>Category</div>
                        <div>Equipment</div>
                        <div>Time Slot</div>
                        <div style={{ textAlign: 'center' }}>Qty</div>
                        <div style={{ textAlign: 'right' }}>Actual (₹)</div>
                        <div style={{ textAlign: 'right' }}>Customer (₹)</div>
                      </div>

                      {quotation.selectedEquipment?.[activeRequirementTab]?.map((equipment, idx) => {
                        const availableCameras = getCamerasForCategory(equipment.category)
                        const quantity = equipment.quantity || 1
                        const totalActual = (equipment.unitActualPrice || 0) * quantity
                        const totalCustomer = (equipment.unitCustomerPrice || 0) * quantity
                        
                        return (
                          <div key={idx} className="requirement-row">
                            <input
                              type="checkbox"
                              checked={equipment.selected || false}
                              onChange={() => toggleCategorySelection(activeRequirementTab, idx)}
                              style={{
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                                accentColor: "#10b981"
                              }}
                            />

                            <div>
                              <label className="mobile-label">Category</label>
                              <div style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>
                                {equipment.category}
                              </div>
                            </div>

                            <div>
                              <label className="mobile-label">Equipment</label>
                              <select
                                value={equipment.equipmentId || 'Not Selected'}
                                disabled={!equipment.selected}
                                onChange={(e) => updateCameraModel(activeRequirementTab, idx, e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  background: equipment.selected ? "white" : "#f3f4f6",
                                  cursor: equipment.selected ? "pointer" : "not-allowed",
                                }}
                              >
                                <option value="Not Selected">Not Selected</option>
                                {availableCameras.map(camera => (
                                  <option key={camera.id} value={camera.id}>
                                    {camera.brand} {camera.model}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mobile-label">Time Slot</label>
                              <select
                                value={equipment.timeSlot || 'Not Selected'}
                                disabled={!equipment.selected}
                                onChange={(e) => updateTimeSlot(activeRequirementTab, idx, e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "2px solid #3b82f6",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  background: equipment.selected ? "white" : "#f3f4f6",
                                  cursor: equipment.selected ? "pointer" : "not-allowed",
                                  fontWeight: "600"
                                }}
                              >
                                <option value="Not Selected">Not Selected</option>
                                <option value="Half Day">Half Day</option>
                                <option value="Full Day">Full Day</option>
                              </select>
                            </div>

                            {/* ✅ QUANTITY INPUT */}
                            <div>
                              <label className="mobile-label">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={equipment.quantity || 1}
                                disabled={!equipment.selected}
                                onChange={(e) => updateQuantity(activeRequirementTab, idx, e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "2px solid #8b5cf6",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  textAlign: "center",
                                  background: equipment.selected ? "#f3e8ff" : "#f3f4f6",
                                  fontWeight: "600",
                                  cursor: equipment.selected ? "text" : "not-allowed"
                                }}
                              />
                            </div>

                            {/* ✅ ACTUAL PRICE (EDITABLE, shows total) */}
                            <div>
                              <label className="mobile-label">Actual Price (Total)</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <input
                                  type="number"
                                  value={equipment.unitActualPrice || 0}
                                  disabled={!equipment.selected}
                                  onChange={(e) => updateActualPrice(activeRequirementTab, idx, e.target.value)}
                                  placeholder="Unit price"
                                  style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "2px solid #f59e0b",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    textAlign: "right",
                                    background: equipment.selected ? "#fef3c7" : "#f3f4f6",
                                    fontWeight: "600",
                                    cursor: equipment.selected ? "text" : "not-allowed"
                                  }}
                                />
                                {quantity > 1 && (
                                  <div style={{ fontSize: '11px', color: '#f59e0b', textAlign: 'right', fontWeight: '600' }}>
                                    Total: ₹{totalActual.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ✅ CUSTOMER PRICE (EDITABLE, shows total) */}
                            <div>
                              <label className="mobile-label">Customer Price (Total)</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <input
                                  type="number"
                                  value={equipment.unitCustomerPrice || 0}
                                  disabled={!equipment.selected}
                                  onChange={(e) => updateCustomerPrice(activeRequirementTab, idx, e.target.value)}
                                  placeholder="Unit price"
                                  style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "2px solid #10b981",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    textAlign: "right",
                                    background: equipment.selected ? "#d1fae5" : "#f3f4f6",
                                    fontWeight: "600",
                                    cursor: equipment.selected ? "text" : "not-allowed"
                                  }}
                                />
                                {quantity > 1 && (
                                  <div style={{ fontSize: '11px', color: '#10b981', textAlign: 'right', fontWeight: '600' }}>
                                    Total: ₹{totalCustomer.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* SHEETS INFORMATION SECTION */}
        {quotation.selectedEvents.length > 0 && (
          <div className="quotation-section" style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "700",textAlign:"left", color: "#1f2937", marginBottom: "16px" }}>
              📄 Sheets Information
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                  Sheet Type/Quality
                </label>
                <select
                  value={quotation.sheetsTypeId || ''}
                  onChange={(e) => handleSheetTypeChange(e.target.value)}
                  className="form-select"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    background: "white"
                  }}
                >
                  <option value="">Select Sheet Type</option>
                  {getSheetTypes().map(sheet => (
                    <option key={sheet.id} value={sheet.id}>
                      {sheet.brand} - {sheet.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                  No. of Sheets
                </label>
                <input
                  type="number"
                  min="0"
                  value={quotation.sheetsCount || 0}
                  onChange={(e) => setQuotation({ ...quotation, sheetsCount: e.target.value })}
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                  Price per Sheet (Customer)
                </label>
                <input
                  type="number"
                  value={quotation.sheetsPricePerSheet || 0}
                  onChange={(e) => setQuotation({ ...quotation, sheetsPricePerSheet: parseInt(e.target.value) || 0 })}
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #10b981",
                    borderRadius: "6px",
                    fontSize: "14px",
                    background: "#d1fae5",
                    fontWeight: "600",
                    textAlign: "right"
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* DISCOUNT SECTION */}
       {quotation.selectedEvents.length > 0 && (
 <div
  className="quotation-section"
  style={{
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // 👈 key
      width: "100%",
    }}
  >
    {/* Left label */}
    <label
      className="form-label"
      style={{
        fontSize: "14px",
        fontWeight: "900",
        color: "#000000",
        whiteSpace: "nowrap",
      }}
    >
      Discount (%)
    </label>

    {/* Right input group */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={quotation.discount || ""}
        onChange={(e) =>
          setQuotation({
            ...quotation,
            discount: e.target.value.replace(/\D/g, ""),
          })
        }
        style={{
          width: "80px",
          padding: "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          textAlign: "right",
        }}
        placeholder="0"
      />

      <span
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        %
      </span>
    </div>
  </div>
</div>

)}

        {/* TOTALS SECTION */}
        {quotation.selectedEvents.length > 0 && (
          <div className="quotation-section" style={{ background: "#f0fdf4", border: "2px solid #10b981", padding: "24px", borderRadius: "12px" }}>
            <h3 className="section-title" style={{ color: "#065f46", fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
              💵 Price Summary
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ fontWeight: "600", color: "#6b7280" }}>Equipment Total (Actual):</span>
                <span style={{ fontWeight: "700", color: "#f59e0b" }}>₹ {totals.equipmentActualTotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ fontWeight: "600", color: "#6b7280" }}>Equipment Total (Customer):</span>
                <span style={{ fontWeight: "700", color: "#10b981" }}>₹ {totals.equipmentTotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ fontWeight: "600", color: "#6b7280" }}>Sheets Total (Actual):</span>
                <span style={{ fontWeight: "700", color: "#f59e0b" }}>₹ {totals.sheetsActualTotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ fontWeight: "600", color: "#6b7280" }}>Sheets Total (Customer):</span>
                <span style={{ fontWeight: "700", color: "#10b981" }}>₹ {totals.sheetsTotal}</span>
              </div>
              <div style={{ height: "1px", background: "#d1d5db", margin: "8px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}>
                <span style={{ fontWeight: "700", color: "#065f46" }}>Grand Total (Actual):</span>
                <span style={{ fontWeight: "800", color: "#f59e0b", fontSize: "18px" }}>₹ {totals.actualGrandTotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}>
                <span style={{ fontWeight: "700", color: "#065f46" }}>Grand Total (Customer):</span>
                <span style={{ fontWeight: "800", color: "#10b981", fontSize: "18px" }}>₹ {totals.grandTotal}</span>
              </div>
              {totals.discountPercent > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ fontWeight: "600", color: "#ef4444" }}>Discount ({totals.discountPercent}%):</span>
                    <span style={{ fontWeight: "700", color: "#ef4444" }}>- ₹ {totals.discountAmount}</span>
                  </div>
                  <div style={{ height: "2px", background: "#10b981", margin: "8px 0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                    <span style={{ fontWeight: "800", color: "#065f46" }}>Final Total:</span>
                    <span style={{ fontWeight: "900", color: "#059669", fontSize: "22px" }}>₹ {totals.total}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        {quotation.selectedEvents.length > 0 && (
          <div className="quotation-section" style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <button
  onClick={saveQuotationToCustomer}
  disabled={loading}
  style={{
    flex: 1,
    padding: "14px 24px",
    background: loading ? "#d1d5db" : "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: loading ? "not-allowed" : "pointer",
    minWidth: "200px"
  }}
>
  {loading ? "Saving..." : "💾 Save to Customer Details"}
</button>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={sendQuotationEmail}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: loading ? "#d1d5db" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                  minWidth: "200px"
                }}
              >
                {loading ? "Sending..." : "📧 Send Quotation Email"}
              </button>
              <button
                onClick={downloadQuotationPDF}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  minWidth: "200px"
                }}
              >
                📥 Download Owner PDF
              </button>
              <button
                onClick={downloadCustomerPDF}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  minWidth: "200px"
                }}
              >
                📄 Download Customer PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
