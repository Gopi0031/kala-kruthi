'use client'
import React, { useState, useEffect } from 'react'

const SAFE_TOP_Y = 95;

export default function PricingList({ quotationPricing, setQuotationPricing }) {
  const [activePricingLayout, setActivePricingLayout] = useState('Quotation')
  const [showSubmittedMessage, setShowSubmittedMessage] = useState(false)
  const [submittedPrices, setSubmittedPrices] = useState({})
  const [isLoadingItems, setIsLoadingItems] = useState(true)

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // ✅ UPDATED: 4 separate camera categories
  const categories = [
    'Traditional Photo Camera',
    'Traditional Video Camera', 
    'Candid Photo Camera',
    'Candid Video Camera',
    'Net Live',
    'Drone',
    'LED Wall',
    'Sheets'
  ]
  
  const sheetQualities = ['Premium', 'Standard', 'Normal']
  const brands = ['Sony', 'Canon', 'Nikon', 'Panasonic', 'DJI', 'Samsung', 'LG', 'Other']

  const [items, setItems] = useState([])

  const [newItem, setNewItem] = useState({
    category: 'Traditional Photo Camera',
    brand: 'Sony',
    model: '',
    actualPriceHalfDay: 0,
    customerPriceHalfDay: 0,
    actualPriceFullDay: 0,
    customerPriceFullDay: 0,
    quality: 'Premium'
  })

  const [b2bForm, setB2bForm] = useState({
    studioName: '',
    personName: '',
    phoneNumber: '',
    selectedItems: [],
    location: '',
    timeSlot: 'Half Day',
    totalPrice: 0,
    advance: 0,
    balance: 0
  })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  useEffect(() => {
    loadItemsFromDb()
  }, [])

  const loadItemsFromDb = async () => {
    try {
      setIsLoadingItems(true)
      const response = await fetch('/api/quotation-pricing')
      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        setItems(data.items)
        console.log('✅ Loaded items from DB:', data.items.length)
        showToast('✅ Items loaded successfully', 'success')
      } else {
        const defaultItems = [
          { 
            id: 1, 
            category: 'Traditional Photo Camera', 
            brand: 'Sony', 
            model: '7R III', 
            actualPriceHalfDay: 15000, 
            customerPriceHalfDay: 25000,
            actualPriceFullDay: 25000,
            customerPriceFullDay: 40000
          },
          { 
            id: 2, 
            category: 'Candid Video Camera', 
            brand: 'Sony', 
            model: 'FX3', 
            actualPriceHalfDay: 20000, 
            customerPriceHalfDay: 30000,
            actualPriceFullDay: 35000,
            customerPriceFullDay: 50000
          }
        ]
        setItems(defaultItems)
        console.log('ℹ️ No items in DB, using defaults')
        showToast('ℹ️ Using default items', 'info')
      }
    } catch (error) {
      console.error('Load error:', error)
      showToast('❌ Failed to load items', 'error')
      const defaultItems = [
        { 
          id: 1, 
          category: 'Traditional Photo Camera', 
          brand: 'Sony', 
          model: '7R III', 
          actualPriceHalfDay: 15000, 
          customerPriceHalfDay: 25000,
          actualPriceFullDay: 25000,
          customerPriceFullDay: 40000
        }
      ]
      setItems(defaultItems)
    } finally {
      setIsLoadingItems(false)
    }
  }

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: field.includes('Price') ? (parseInt(value) || 0) : value } : item
    ))
  }

  const deleteItem = (id) => {
    if (items.length === 1) {
      showToast('❌ You must have at least one item!', 'error')
      return
    }
    if (confirm('Delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== id))
      showToast('✅ Item deleted successfully', 'success')
    }
  }

  const addItem = () => {
    if (newItem.category !== 'Sheets' && !newItem.model.trim()) {
      showToast('❌ Please enter model/description', 'error')
      return
    }

    const itemToAdd = {
      ...newItem,
      id: Date.now()
    }

    if (newItem.category === 'Sheets') {
      itemToAdd.model = `${newItem.quality} Quality`
      itemToAdd.brand = newItem.quality
      itemToAdd.actualPriceFullDay = 0
      itemToAdd.customerPriceFullDay = 0
    }

    setItems(prev => [...prev, itemToAdd])
    setNewItem({ 
      category: 'Traditional Photo Camera', 
      brand: 'Sony', 
      model: '', 
      actualPriceHalfDay: 0, 
      customerPriceHalfDay: 0,
      actualPriceFullDay: 0,
      customerPriceFullDay: 0,
      quality: 'Premium'
    })
    showToast('✅ Item added successfully!', 'success')
  }

  const saveItemsToDb = async () => {
    try {
      const response = await fetch('/api/quotation-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      if (!response.ok) throw new Error('Save failed')
      showToast('✅ Items saved to database!', 'success')
    } catch (error) {
      console.error('Save error:', error)
      showToast('❌ Failed to save items', 'error')
    }
  }

  const submitQuotationPrices = () => {
    const newSubmittedPrices = {}
    items.forEach(item => {
      const key = `${item.category} - ${item.brand} ${item.model}`
      newSubmittedPrices[key] = {
        halfDay: item.customerPriceHalfDay,
        fullDay: item.customerPriceFullDay
      }
    })
    setSubmittedPrices(newSubmittedPrices)
    setShowSubmittedMessage(true)
    setTimeout(() => setShowSubmittedMessage(false), 3000)
    showToast('✅ Prices submitted to Quotation section!', 'success')
  }

  const handleB2bInputChange = (field, value) => {
    setB2bForm(prev => {
      let newForm = { ...prev }
      if (field === 'totalPrice') {
        newForm.totalPrice = Math.max(0, parseInt(value) || 0)
      } else if (field === 'advance') {
        newForm.advance = Math.max(0, parseInt(value) || 0)
      } else {
        newForm[field] = value
      }
      newForm.balance = Math.max(0, newForm.totalPrice - newForm.advance)
      return newForm
    })
  }

  const downloadB2BPdf = async () => {
    try {
      if (!b2bForm.studioName || !b2bForm.phoneNumber || b2bForm.totalPrice <= 0) {
        showToast('❌ Please fill Studio Name, Phone, and Total Amount', 'error')
        return
      }

      const payload = {
        id: Date.now().toString(),
        studio: b2bForm.studioName,
        person: b2bForm.personName,
        phone: b2bForm.phoneNumber,
        date: new Date().toISOString().split('T')[0],
        items: b2bForm.selectedItems,
        location: b2bForm.location,
        total: b2bForm.totalPrice,
        advance: b2bForm.advance,
        balance: b2bForm.totalPrice - b2bForm.advance,
        status: b2bForm.totalPrice - b2bForm.advance === 0 ? 'Paid' : 'Pending'
      }

      const saveRes = await fetch('/api/b2b-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!saveRes.ok) throw new Error('MongoDB save failed')

      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true })
      doc.addImage("/letterhead.jpeg", "JPEG", 0, 0, 210, 297)
      
      doc.setProperties({
        title: 'B2B Order Form',
        subject: 'Equipment Rental Order',
        author: 'Kalakruthi Photography',
        creator: 'Kalakruthi Admin Dashboard'
      })

      doc.setTextColor(0, 0, 0)
      const date = new Date().toLocaleDateString('en-IN')
      let yPosition = SAFE_TOP_Y

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Date: ${date}`, 190, yPosition, { align: "right" })
      yPosition += 10

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Order Details", 14, yPosition)
      yPosition += 12

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Studio Information:', 14, yPosition)
      yPosition += 7

      doc.setFont('helvetica', 'normal')
      doc.text(`Studio Name: ${b2bForm.studioName}`, 20, yPosition)
      yPosition += 7
      doc.text(`Contact Person: ${b2bForm.personName || 'Not Provided'}`, 20, yPosition)
      yPosition += 7
      doc.text(`Phone: ${b2bForm.phoneNumber}`, 20, yPosition)
      yPosition += 7

      yPosition += 3
      doc.setFont('helvetica', 'bold')
      doc.text('Equipment Details:', 14, yPosition)
      yPosition += 7

      doc.setFont('helvetica', 'normal')
      b2bForm.selectedItems.forEach(item => {
        doc.text(`• ${item}`, 20, yPosition)
        yPosition += 6
      })
      yPosition += 4

      doc.setFont('helvetica', 'bold')
      doc.text('Event Details:', 14, yPosition)
      yPosition += 7

      doc.setFont('helvetica', 'normal')
      doc.text(`Location: ${b2bForm.location || 'Not Provided'}`, 20, yPosition)
      yPosition += 7
      doc.text(`Time Slot: ${b2bForm.timeSlot}`, 20, yPosition)
      yPosition += 7

      yPosition += 3
      doc.setFont('helvetica', 'bold')
      doc.text('Payment Details:', 14, yPosition)
      yPosition += 7

      const paymentData = [
        ['Total Amount', `Rs. ${b2bForm.totalPrice.toLocaleString('en-IN')}`],
        ['Advance Paid', `Rs. ${b2bForm.advance.toLocaleString('en-IN')}`],
        ['Balance Due', `Rs. ${b2bForm.balance.toLocaleString('en-IN')}`]
      ]

      doc.setFont('helvetica', 'normal')
      paymentData.forEach(row => {
        doc.text(row[0], 20, yPosition)
        doc.text(row[1], 150, yPosition)
        yPosition += 7
      })

      yPosition += 15
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text('This is a computer-generated document. No signature required.', 105, yPosition, { align: 'center' })

      doc.save(`B2B-Order-${b2bForm.studioName}-${Date.now()}.pdf`)
      showToast('✅ PDF downloaded & B2B customer saved!', 'success')

    } catch (error) {
      console.error('❌ PDF Download ERROR:', error)
      showToast('❌ Failed to generate PDF', 'error')
    }
  }

  const formInputStyle = {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    background: '#fafbfc',
    fontWeight: '500',
    minHeight: '48px'
  }

  const selectInputStyle = {
    padding: '12px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '13px',
    background: '#fafbfc',
    fontWeight: '500',
    minHeight: '44px',
    width: '100%'
  }

  const priceInputStyleActual = {
    padding: '12px 12px',
    border: '2px solid #f59e0b',
    borderRadius: '10px',
    background: '#fef3c7',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: '14px',
    minHeight: '44px',
    width: '100%'
  }

  const priceInputStyleCustomer = {
    padding: '12px 12px',
    border: '2px solid #10b981',
    borderRadius: '10px',
    background: '#d1fae5',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: '14px',
    minHeight: '44px',
    width: '100%'
  }

  if (isLoadingItems) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Loading Pricing Data...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '16px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      <style>{`
        .pricing-tabs {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          max-width: 700px;
          margin: 0 auto 20px;
        }
        
        .pricing-tab {
          padding: 14px 20px;
          border: none;
          borderRadius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8fafc;
          color: #64748b;
        }
        
        .pricing-tab.active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .pricing-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
          border: 1px solid #f1f5f9;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .b2b-form-container {
          padding: 0 24px 24px;
        }

        .category-badge {
          display: inline-block;
          padding: 1px 20px;
          radius:"10px"
          background: #e0e7ff;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
          color: #4338ca;
          text-transform: uppercase;
          
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 24px;
          borderRadius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          z-index: 9999;
          display: flex;
          alignItems: center;
          gap: 12px;
          fontWeight: 600;
          fontSize: 14px;
          animation: slideIn 0.3s ease-out;
          max-width: 400px;
        }

        .toast.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .toast.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .toast.info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .toast {
            right: 10px;
            left: 10px;
            max-width: calc(100% - 20px);
          }

          .pricing-card-header {
            padding: 16px !important;
          }
          
          .grid-header {
            display: none !important;
          }
          
          .grid-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 16px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            margin-bottom: 12px !important;
            background: #f8fafc !important;
          }
          
          .mobile-label {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #64748b !important;
            margin-bottom: 6px !important;
            display: block !important;
          }

          .pricing-grid-container {
            grid-template-columns: 1fr !important;
          }
        }

        @media (min-width: 768px) {
          .pricing-tabs { flex-direction: row; }
          .pricing-tab { flex: 1; font-size: 16px; }
          .mobile-label { display: none !important; }
        }

        @media (max-width: 480px) {
          .pricing-card { border-radius: 12px; }
          .pricing-tabs { padding: 16px; }
          .pricing-tab { padding: 12px 16px; font-size: 13px; }
          .b2b-form-container { padding: 0 16px 20px; }
        }
      `}</style>

      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <span style={{ fontSize: '20px' }}>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="pricing-tabs">
        <button className={`pricing-tab ${activePricingLayout === 'Quotation' ? 'active' : ''}`}
          onClick={() => setActivePricingLayout('Quotation')}>
          👤 Quotation Pricing
        </button>
        <button className={`pricing-tab ${activePricingLayout === 'B2B' ? 'active' : ''}`}
          onClick={() => setActivePricingLayout('B2B')}>
          💼 B2B Orders
        </button>
      </div>

      {activePricingLayout === 'Quotation' ? (
        <div className="pricing-card">
          <div className="pricing-card-header" style={{
            textAlign: 'center',
            padding: '20px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', borderRadius: '16px 16px 0 0'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>👤 Quotation Pricing (Half Day & Full Day)</h2>
          </div>

          <div style={{ padding: '24px', background: '#f0fdf4', borderBottom: '2px solid #10b981' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div>
                  <label className="mobile-label">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    style={formInputStyle}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {newItem.category === 'Sheets' ? (
                  <div>
                    <label className="mobile-label">Quality *</label>
                    <select
                      value={newItem.quality}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quality: e.target.value, brand: e.target.value }))}
                      style={formInputStyle}
                    >
                      {sheetQualities.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="mobile-label">Brand *</label>
                    <select
                      value={newItem.brand}
                      onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                      style={formInputStyle}
                    >
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="mobile-label">Model/Description {newItem.category !== 'Sheets' && '*'}</label>
                  <input
                    placeholder={newItem.category === 'Sheets' ? 'Auto-generated' : 'Model/Description'}
                    value={newItem.category === 'Sheets' ? `${newItem.quality} Quality` : newItem.model}
                    onChange={(e) => setNewItem(prev => ({ ...prev, model: e.target.value }))}
                    style={{
                      ...formInputStyle,
                      background: newItem.category === 'Sheets' ? '#e5e7eb' : '#fafbfc',
                      cursor: newItem.category === 'Sheets' ? 'not-allowed' : 'text'
                    }}
                    readOnly={newItem.category === 'Sheets'}
                  />
                </div>
              </div>

              {newItem.category === 'Sheets' ? (
                <div style={{ 
                  background: '#e0f2fe', 
                  padding: '16px', 
                  borderRadius: '10px',
                  border: '2px solid #0ea5e9'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#075985' }}>
                    📄 Price Per Sheet
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="mobile-label">Actual Price (Per Sheet)</label>
                      <input
                        type="number"
                        placeholder="Your cost per sheet"
                        value={newItem.actualPriceHalfDay}
                        onChange={(e) => setNewItem(prev => ({ ...prev, actualPriceHalfDay: parseInt(e.target.value) || 0 }))}
                        style={{ ...formInputStyle, background: '#fef3c7' }}
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="mobile-label">Customer Price (Per Sheet)</label>
                      <input
                        type="number"
                        placeholder="Customer price per sheet"
                        value={newItem.customerPriceHalfDay}
                        onChange={(e) => setNewItem(prev => ({ ...prev, customerPriceHalfDay: parseInt(e.target.value) || 0 }))}
                        style={{ ...formInputStyle, background: '#d1fae5' }}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="pricing-grid-container" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px' 
                  }}>
                    <div style={{ 
                      background: '#eff6ff', 
                      padding: '12px', 
                      borderRadius: '8px',
                      border: '2px solid #3b82f6'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: '#1e40af', textAlign: 'left' }}>
                        🌅 Half Day
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                            Actual
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.actualPriceHalfDay}
                            onChange={(e) => setNewItem(prev => ({ ...prev, actualPriceHalfDay: parseInt(e.target.value) || 0 }))}
                            style={{ 
                              padding: '8px', 
                              border: '1px solid #f59e0b', 
                              borderRadius: '6px', 
                              background: '#fef3c7',
                              textAlign: 'right',
                              fontWeight: '600',
                              fontSize: '13px',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                            Customer
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.customerPriceHalfDay}
                            onChange={(e) => setNewItem(prev => ({ ...prev, customerPriceHalfDay: parseInt(e.target.value) || 0 }))}
                            style={{ 
                              padding: '8px', 
                              border: '1px solid #10b981', 
                              borderRadius: '6px', 
                              background: '#d1fae5',
                              textAlign: 'right',
                              fontWeight: '600',
                              fontSize: '13px',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#fef3c7', 
                      padding: '12px', 
                      borderRadius: '8px',
                      border: '2px solid #f59e0b'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: '#92400e', textAlign: 'left' }}>
                        ☀️ Full Day
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                            Actual
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.actualPriceFullDay}
                            onChange={(e) => setNewItem(prev => ({ ...prev, actualPriceFullDay: parseInt(e.target.value) || 0 }))}
                            style={{ 
                              padding: '8px', 
                              border: '1px solid #f59e0b', 
                              borderRadius: '6px', 
                              background: '#fef3c7',
                              textAlign: 'right',
                              fontWeight: '600',
                              fontSize: '13px',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                            Customer
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.customerPriceFullDay}
                            onChange={(e) => setNewItem(prev => ({ ...prev, customerPriceFullDay: parseInt(e.target.value) || 0 }))}
                            style={{ 
                              padding: '8px', 
                              border: '1px solid #10b981', 
                              borderRadius: '6px', 
                              background: '#d1fae5',
                              textAlign: 'right',
                              fontWeight: '600',
                              fontSize: '13px',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <button
            onClick={addItem}
            style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              minHeight: "48px",
              width: "100%",
              maxWidth: "150px",   // 👈 desktop size
            }}
          >
            Add Item
          </button>
        </div>

            </div>
          </div>
          
          <div className="grid-header" style={{
            display: 'grid', 
            gridTemplateColumns: '0.7fr 0.8fr 1.2fr 0.9fr 0.9fr 0.9fr 0.9fr 80px', 
            gap: '10px',
            padding: '16px 24px', 
            background: '#f8fafc', 
            fontWeight: '600', 
            color: '#1e293b', 
            fontSize: '12px',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <div>Category</div>
            <div>Brand</div>
            <div>Model</div>
            <div style={{ textAlign: 'center' }}>Actual Rs.<br/>(Half/Per)</div>
            <div style={{ textAlign: 'center' }}>Customer Rs.<br/>(Half/Per)</div>
            <div style={{ textAlign: 'center' }}>Actual Rs.<br/>(Full)</div>
            <div style={{ textAlign: 'center' }}>Customer Rs.<br/>(Full)</div>
            <div style={{ textAlign: 'center' }}>Delete</div>
          </div>

          <div style={{ padding: '16px 24px 24px' }}>
            {items.map((item) => (
              <div key={item.id} className="grid-row" style={{
                display: 'grid', 
                gridTemplateColumns: '0.7fr 0.8fr 1.2fr 0.9fr 0.9fr 0.9fr 0.9fr 80px', 
                gap: '10px', 
                alignItems: 'center',
                padding: '12px 0', 
                borderBottom: '1px solid #f1f5f9'
              }}>
               <div>
  <label className="mobile-label">Category</label>

  <select
    style={selectInputStyle}
    value={item.category}
    onChange={(e) => updateItem(item.id, 'category', e.target.value)}
  >
    {categories.map(cat => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
</div>

                
                <div>
                  <label className="mobile-label">Brand</label>
                  {item.category === 'Sheets' ? (
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>
                      {item.quality || item.brand}
                    </span>
                  ) : (
                    <select
                      style={selectInputStyle}
                      value={item.brand}
                      onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                    >
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="mobile-label">Model/Description</label>
                  <input
                    style={formInputStyle}
                    value={item.model}
                    onChange={(e) => updateItem(item.id, 'model', e.target.value)}
                    placeholder="Model/Description"
                  />
                </div>
                
                <div>
                  <label className="mobile-label">
                    Actual Price ({item.category === 'Sheets' ? 'Per Sheet' : 'Half Day'})
                  </label>
                  <input
                    type="number"
                    value={item.actualPriceHalfDay || 0}
                    onChange={(e) => updateItem(item.id, 'actualPriceHalfDay', e.target.value)}
                    style={priceInputStyleActual}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="mobile-label">
                    Customer Price ({item.category === 'Sheets' ? 'Per Sheet' : 'Half Day'})
                  </label>
                  <input
                    type="number"
                    value={item.customerPriceHalfDay || 0}
                    onChange={(e) => updateItem(item.id, 'customerPriceHalfDay', e.target.value)}
                    style={priceInputStyleCustomer}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="mobile-label">Actual Price (Full Day)</label>
                  {item.category === 'Sheets' ? (
                    <div style={{ 
                      padding: '12px',
                      background: '#f3f4f6',
                      borderRadius: '10px',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      N/A
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={item.actualPriceFullDay || 0}
                      onChange={(e) => updateItem(item.id, 'actualPriceFullDay', e.target.value)}
                      style={priceInputStyleActual}
                      placeholder="0"
                      min="0"
                    />
                  )}
                </div>

                <div>
                  <label className="mobile-label">Customer Price (Full Day)</label>
                  {item.category === 'Sheets' ? (
                    <div style={{ 
                      padding: '12px',
                      background: '#f3f4f6',
                      borderRadius: '10px',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      N/A
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={item.customerPriceFullDay || 0}
                      onChange={(e) => updateItem(item.id, 'customerPriceFullDay', e.target.value)}
                      style={priceInputStyleCustomer}
                      placeholder="0"
                      min="0"
                    />
                  )}
                </div>

                <div>
                  <label className="mobile-label">Delete</label>
                  <button onClick={() => deleteItem(item.id)}
                    style={{
                      padding: '10px',
                      background: '#fee2e2',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderTop: '2px solid #10b981',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
              {items.length} Items Listed
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={submitQuotationPrices}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  whiteSpace: 'nowrap'
                }}
              >
                📤 Submit
              </button>

              <button onClick={saveItemsToDb}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  whiteSpace: 'nowrap'
                }}
              >
                💾 Save to DB
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="pricing-card">
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center',
            padding: '20px 24px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white', borderRadius: '16px 16px 0 0', textAlign: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>💼 B2B Order Form</h2>
            <div style={{ fontSize: '24px', fontWeight: '800' }}>
              Rs. {b2bForm.totalPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="b2b-form-container">
            <div style={{ display: 'grid', gap: '16px', paddingTop: '24px' }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <input placeholder="🏢 Studio Name *" 
                  value={b2bForm.studioName}
                  onChange={(e) => handleB2bInputChange('studioName', e.target.value)}
                  style={formInputStyle} />
                <input placeholder="👤 Person Name" 
                  value={b2bForm.personName}
                  onChange={(e) => handleB2bInputChange('personName', e.target.value)}
                  style={formInputStyle} />
              </div>

              <input placeholder="📱 Phone Number *" 
                value={b2bForm.phoneNumber}
                onChange={(e) => handleB2bInputChange('phoneNumber', e.target.value)}
                style={formInputStyle} />

              <div style={{ 
                padding: '20px', background: '#f8fafc', borderRadius: '10px', 
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '16px', color: '#1f2937' }}>
                  📦 Select Equipment
                </div>
                
                {categories.map(category => {
                  const categoryItems = items.filter(item => item.category === category)
                  if (categoryItems.length === 0) return null
                  
                  return (
                    <div key={category} style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
                        {category}
                      </div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {categoryItems.map(item => (
                          <label key={item.id} style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px', background: 'white', borderRadius: '6px',
                            border: '1px solid #e2e8f0', cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                const itemName = item.category === 'Sheets' 
                                  ? `${item.model} (Rs. ${item.customerPriceHalfDay}/sheet)`
                                  : `${item.category} - ${item.brand} ${item.model} (Half: Rs. ${item.customerPriceHalfDay.toLocaleString('en-IN')}, Full: Rs. ${item.customerPriceFullDay.toLocaleString('en-IN')})`
                                if (e.target.checked) {
                                  handleB2bInputChange('selectedItems', [...b2bForm.selectedItems, itemName])
                                } else {
                                  handleB2bInputChange('selectedItems', b2bForm.selectedItems.filter(i => i !== itemName))
                                }
                              }}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>
                              {item.brand} {item.model} - 
                              {item.category === 'Sheets' 
                                ? ` Rs. ${item.customerPriceHalfDay.toLocaleString('en-IN')}/sheet`
                                : ` Half: Rs. ${item.customerPriceHalfDay.toLocaleString('en-IN')}, Full: Rs. ${item.customerPriceFullDay.toLocaleString('en-IN')}`
                              }
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <input placeholder="📍 Location" 
                value={b2bForm.location}
                onChange={(e) => handleB2bInputChange('location', e.target.value)}
                style={formInputStyle} />

              <select
                value={b2bForm.timeSlot}
                onChange={(e) => handleB2bInputChange('timeSlot', e.target.value)}
                style={formInputStyle}
              >
                <option value="Half Day">🌅 Half Day</option>
                <option value="Full Day">☀️ Full Day</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="number"
                  placeholder="💰 Total Amount *"
                  value={b2bForm.totalPrice}
                  onChange={(e) => handleB2bInputChange('totalPrice', e.target.value)}
                  style={formInputStyle}
                  min="0"
                />
                <input
                  type="number"
                  placeholder="💵 Advance Paid"
                  value={b2bForm.advance}
                  onChange={(e) => handleB2bInputChange('advance', e.target.value)}
                  style={formInputStyle}
                  min="0"
                />
              </div>

              <div style={{ 
                padding: '16px', 
                background: '#f0fdf4', 
                borderRadius: '10px',
                border: '2px solid #10b981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700' }}>
                  <span style={{ color: '#065f46' }}>Balance Due:</span>
                  <span style={{ color: '#059669' }}>Rs. {b2bForm.balance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={downloadB2BPdf}
                style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                📥 Download PDF & Save Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
