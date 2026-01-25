// CustomerDetails.jsx
'use client'
import React, { useState } from 'react'
import { generateInvoicePDF } from "./InvoicePDF"


import { formatAmount } from './constants'

export default function CustomerDetails({
  customers,
  customerFilter,
  setCustomerFilter,
  isAdding,
  setIsAdding,
  editingId,
  formData,
  setFormData,
  selectedAdvanceCount,
  setSelectedAdvanceCount,
  openPaymentRowId,
  setOpenPaymentRowId,
  openAdvanceId,
  setOpenAdvanceId,
  handleTotalAmountChange,
  handleAdvanceCountChange,
  updateAdvance,
  handleSaveCustomer,
  handleEditCustomer,
  handleDeleteCustomer,
  handleDeleteAllCustomers,
  loading
}) {
 const [customerQuotations, setCustomerQuotations] = useState({})
const loadCustomerQuotations = async (customerId) => {
  if (!customerId) return

  try {
    const res = await fetch(`/api/quotations?customerId=${customerId}`)

    if (!res.ok) return

    const text = await res.text()
    if (!text) {
      setCustomerQuotations(prev => ({
        ...prev,
        [customerId]: []
      }))
      return
    }

    const data = JSON.parse(text)

    setCustomerQuotations(prev => ({
      ...prev,
      [customerId]: data
    }))
  } catch (err) {
    console.error("Failed to load quotations", err)
  }
}
  
const downloadBase64PDF = (base64, fileName) => {
  const link = document.createElement("a")
  link.href = `data:application/pdf;base64,${base64}`
  link.download = fileName
  link.click()
}

  const filteredCustomers = customers
  .filter((c) => {
    if (customerFilter === "All") return true
    return c.status === customerFilter
  })
  .slice()
  .sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0)
    const dateB = b.date ? new Date(b.date) : new Date(0)
    return dateB - dateA
  })

  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false

  return (
    <div style={{
      padding: "10px",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      {/* Filter and Action Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "Pending", "Paid"].map((filter) => (
            <button
              key={filter}
              onClick={() => setCustomerFilter(filter)}
              style={{
                padding: isMobile ? "8px 16px" : "10px 20px",
                background: customerFilter === filter ? "#10b981" : "#f3f4f6",
                color: customerFilter === filter ? "white" : "#4b5563",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: isMobile ? "12px" : "13px",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                minWidth: isMobile ? "70px" : "auto",
                textAlign: "center"
              }}
            >
              {filter} {filter === "All" && `(${customers.length})`}
              {filter === "Pending" && `(${customers.filter(c => c.status === "Pending").length})`}
              {filter === "Paid" && `(${customers.filter(c => c.status === "Paid").length})`}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {!isAdding && (
            <>
              <button
                onClick={() => {
                  setIsAdding(true)
                  setFormData({
                    name: "",
                    date: "",
                    amount: "",
                    totalAmount: "",
                    dueAmount: "",
                    advances: [],
                    hardDisk: "Hard Disk",
                    hardDiskAmount: 5000,
                    storageNo: "",
                    status: "Pending",
                  })
                }}
                style={{
                  padding: isMobile ? "10px 20px" : "12px 24px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: isMobile ? "13px" : "14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                ➕ Add Customer
              </button>
              {customers.length > 0 && (
                <button
                  onClick={handleDeleteAllCustomers}
                  disabled={loading}
                  style={{
                    padding: isMobile ? "10px 20px" : "12px 24px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: isMobile ? "13px" : "14px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    whiteSpace: "nowrap",
                    flexShrink: 0
                  }}
                >
                  🗑️ Delete All
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Form */}
      {isAdding && (
        <div style={{
          background: "white",
          padding: isMobile ? "20px 16px" : "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: isMobile ? "16px" : "20px",
          border: "2px solid #10b981",
          position: isMobile ? "fixed" : "relative",
          bottom: isMobile ? "0" : "auto",
          left: isMobile ? "0" : "auto",
          right: isMobile ? "0" : "auto",
          zIndex: isMobile ? "1000" : "auto",
          maxHeight: isMobile ? "80vh" : "auto",
          overflowY: isMobile ? "auto" : "visible",
        }}>
          <h3 style={{
            fontSize: isMobile ? "16px" : "18px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: isMobile ? "space-between" : "flex-start"
          }}>
            {editingId ? "✏️ Edit Customer" : "➕ Add New Customer"}
            {isMobile && (
              <button
                onClick={() => {
                  setIsAdding(false)
                  setFormData({
                    name: "",
                    date: "",
                    amount: "",
                    totalAmount: "",
                    dueAmount: "",
                    advances: [],
                    hardDisk: "Hard Disk",
                    hardDiskAmount: 5000,
                    storageNo: "",
                    status: "Pending",
                  })
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                ✕
              </button>
            )}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                Total Amount (₹) *
              </label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                required
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                💾 Storage Type
              </label>
              <select
                value={formData.hardDisk}
                onChange={(e) => setFormData({ ...formData, hardDisk: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="Hard Disk">Hard Disk</option>
                <option value="Pendrive">Pendrive</option>
                <option value="No Storage">No Storage</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>
                Storage Amount (₹)
              </label>
              <input
                type="number"
                value={formData.hardDiskAmount}
                onChange={(e) => setFormData({ ...formData, hardDiskAmount: Number(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Advance Payment Section */}
          <div style={{
            background: "#f9fafb",
            padding: isMobile ? "16px" : "20px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#1f2937", marginBottom: "12px" }}>
              💰 Number of Advances
            </label>
            <select
              value={selectedAdvanceCount}
              onChange={(e) => handleAdvanceCountChange(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              <option value={0}>No Advance</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => ( 
                <option key={num} value={num}>{num} Advance{num > 1 ? "s" : ""}</option>
              ))}
            </select>

            {formData.advances.map((adv, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  padding: isMobile ? "12px" : "16px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "12px" }}>
                  Advance #{index + 1}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px" }}>
                 <div>
  <label style={{ display: "block", fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
    Amount (₹)
  </label>

  <input
  type="number"
  value={adv.amount}
  onChange={(e) => {
    updateAdvance(index, "amount", e.target.value)
    updateAdvance(index, "isAuto", false)
  }}
  style={{
    width: "100%",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    background: adv.isAuto ? "#f0fdf4" : "white",
  }}
/>

{adv.isAuto && index < 3 && (
  <p style={{ fontSize: "10px", color: "#16a34a", marginTop: "4px" }}>
    Auto • 25% of Total
  </p>
)}

{!adv.isAuto && adv.amount && (
  <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
    Manual amount
  </p>
)}
</div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={adv.date}
                      onChange={(e) => updateAdvance(index, "date", e.target.value)}
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
  <label style={{ display: "block", fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
    Payment Mode
  </label>

  <select
    value={adv.paymentMode}
    onChange={(e) => updateAdvance(index, "paymentMode", e.target.value)}
    style={{
      width: "100%",
      padding: "8px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "13px",
      marginBottom: adv.paymentMode === "UPI" ? "8px" : "0",
    }}
  >
    <option value="">Select</option>
    <option value="Cash">Cash</option>
    <option value="UPI">UPI</option>
    <option value="Card">Card</option>
    <option value="Bank Transfer">Bank Transfer</option>
  </select>

  {/* UPI App Selection */}
  {adv.paymentMode === "UPI" && (
  <>
    <label style={{ display: "block", fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
      UPI App
    </label>

    <select
      value={adv.upiApp || ""}
      onChange={(e) => updateAdvance(index, "upiApp", e.target.value)}
      style={{
        width: "100%",
        padding: "8px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "13px",
        marginBottom: adv.upiApp === "Other" ? "6px" : "0",
      }}
    >
      <option value="">Select UPI App</option>
      <option value="GPay">GPay</option>
      <option value="PhonePe">PhonePe</option>
      <option value="Paytm">Paytm</option>
      <option value="Navi">Navi</option>
      <option value="Other">Other</option>
    </select>

    {/* Manual UPI input when Other is selected */}
    {adv.upiApp === "Other" && (
      <input
        type="text"
        placeholder="Enter UPI app name"
        value={adv.otherUpi || ""}
        onChange={(e) => updateAdvance(index, "otherUpi", e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "13px",
        }}
      />
    )}
  </>
)}

</div>

                </div>
              </div>
            ))}
          </div>

          {/* Due Amount Display */}
          <div style={{
            background: "#fef3c7",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #fbbf24",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#92400e" }}>
                💰 Due Amount:
              </span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#92400e" }}>
                ₹{formatAmount(formData.dueAmount)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleSaveCustomer}
              disabled={loading || !formData.name || !formData.totalAmount}
              style={{
                flex: 1,
                padding: "12px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading || !formData.name || !formData.totalAmount ? "not-allowed" : "pointer",
                opacity: loading || !formData.name || !formData.totalAmount ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : editingId ? "Update Customer" : "Save Customer"}
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setFormData({
                  name: "",
                  date: "",
                  amount: "",
                  totalAmount: "",
                  dueAmount: "",
                  advances: [],
                  hardDisk: "Hard Disk",
                  hardDiskAmount: 5000,
                  storageNo: "",
                  status: "Pending",
                })
              }}
              style={{
                flex: 1,
                padding: "12px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Customer List - MOBILE: Cards, DESKTOP: Table */}
      {!isAdding && (
        <div style={{
          marginBottom: isMobile ? "100px" : "0"
        }}>
          {filteredCustomers.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: isMobile ? "40px 16px" : "60px 20px",
              background: "#f9fafb",
              borderRadius: "12px",
            }}>
              <p style={{ fontSize: isMobile ? "14px" : "16px", color: "#6b7280" }}>
                {customerFilter === "All" 
                  ? "No customers found. Click 'Add Customer' to get started."
                  : `No ${customerFilter.toLowerCase()} customers found.`}
              </p>
            </div>
          ) : isMobile ? (
            // MOBILE: Card View
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredCustomers.map((customer) => {
                const customerId = customer._id
                const totalPaid = (customer.advances || []).reduce(
                  (sum, adv) => sum + (Number(adv.amount) || 0),
                  0
                )

                return (
                  <div
                    key={customerId}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {/* Card Header */}
                    <div style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      padding: "16px",
                      color: "white",
                    }}>
                  <h3
  onClick={() => {
    const isOpening = openPaymentRowId !== customerId
    setOpenPaymentRowId(isOpening ? customerId : null)
    setOpenAdvanceId(null)

    if (isOpening) {
      loadCustomerQuotations(customerId)
    }
  }}

  style={{
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "4px",
    cursor: "pointer",
  }}
>
  {customer.name}
</h3>

                      <p style={{ fontSize: "12px", opacity: 0.9 }}>
                        📅 {customer.date || "N/A"}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "16px" }}>
                      {/* Amount Details */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        marginBottom: "16px",
                      }}>
                        <div style={{
                          background: "#f3f4f6",
                          padding: "12px",
                          borderRadius: "8px",
                        }}>
                          <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
                            Total Amount
                          </p>
                          <p style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
                            ₹{formatAmount(customer.totalAmount)}
                          </p>
                        </div>

                        <div style={{
                          background: "#dcfce7",
                          padding: "12px",
                          borderRadius: "8px",
                        }}>
                          <p style={{ fontSize: "11px", color: "#065f46", marginBottom: "4px" }}>
                            Paid
                          </p>
                          <p style={{ fontSize: "16px", fontWeight: "700", color: "#10b981" }}>
                            ₹{formatAmount(totalPaid)}
                          </p>
                        </div>
                      </div>

                      {/* Due Amount */}
                      <div style={{
                        background: "#fef3c7",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        border: "1px solid #fbbf24",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "#92400e" }}>
                            💰 Due Amount
                          </span>
                          <span style={{ fontSize: "18px", fontWeight: "800", color: "#92400e" }}>
                            ₹{formatAmount(customer.dueAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Storage Info */}
                      <div style={{
                        background: "#f3f4f6",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                      }}>
                        <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
                          💾 Storage
                        </p>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937" }}>
                          {customer.hardDisk || "Hard Disk"} 
                          {customer.hardDisk !== "No Storage" && ` - ₹${formatAmount(customer.hardDiskAmount)}`}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                        {/* <button
                          onClick={() => {
                            setOpenPaymentRowId(openPaymentRowId === customerId ? null : customerId)
                            setOpenAdvanceId(null)
                          }}
                          style={{
                            padding: "10px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          {openPaymentRowId === customerId ? "Hide" : "View"}
                        </button> */}
                        <button
                          onClick={() => {
                            handleEditCustomer(customer)
                            setIsAdding(true)
                          }}
                          style={{
                            padding: "10px",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customerId)}
                          disabled={loading}
                          style={{
                            padding: "10px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                          }}
                        >
                          Delete
                        </button>
                      </div>

                      {/* Expandable Payment Details */}
                      {openPaymentRowId === customerId && (
                        <div style={{
                          borderTop: "2px solid #e5e7eb",
                          paddingTop: "16px",
                          marginTop: "12px",
                        }}>
                          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937", marginBottom: "12px" }}>
                            💰 Payment Details
                          </h4>
                          
                          {customer.advances && customer.advances.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {customer.advances.map((adv, advIdx) => (
                                <div
                                  key={advIdx}
                                  style={{
                                    background: "#f9fafb",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                  }}
                                >
                                  <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                  }}>
                                    <span style={{
                                      background: "#dbeafe",
                                      color: "#1e40af",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      fontWeight: "700",
                                    }}>
                                      Advance #{advIdx + 1}
                                    </span>
                                    <span style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
                                      ₹{formatAmount(adv.amount)}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280" }}>
                                    <span>📅 {adv.date || "N/A"}</span>
                                   <span>
                                    💳 {adv.paymentMode}
                                    {adv.paymentMode === "UPI" && (
                                      <>
                                        {" "}
                                        (
                                        {adv.upiApp === "Other"
                                          ? adv.otherUpi || "Other"
                                          : adv.upiApp}
                                        )
                                      </>
                                    )}
                                  </span>
                                  </div>
                                </div>
                              ))}

                              {/* Total Summary */}
                              <div style={{
                                background: "#dcfce7",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "2px solid #10b981",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#065f46" }}>
                                  Total Paid
                                </span>
                                <span style={{ fontSize: "18px", fontWeight: "800", color: "#065f46" }}>
                                  ₹{formatAmount(totalPaid)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              textAlign: "center",
                              padding: "20px",
                              background: "#f9fafb",
                              borderRadius: "8px",
                              border: "1px dashed #d1d5db",
                            }}>
                              <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                No advance payments recorded yet.
                              </p>
                            </div>

                          )}
                          {customerQuotations[customerId]?.length > 0 && (
  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
    <button
      onClick={() =>
        downloadBase64PDF(
          customerQuotations[customerId][0].pdfFiles.ownerPdf,
          `${customer.name}_Owner_Quotation.pdf`
        )
      }
      style={{
        flex: 1,
        padding: "10px",
        background: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      📥 Owner PDF
    </button>

    <button
      onClick={() =>
        downloadBase64PDF(
          customerQuotations[customerId][0].pdfFiles.customerPdf,
          `${customer.name}_Customer_Quotation.pdf`
        )
      }
      style={{
        flex: 1,
        padding: "10px",
        background: "#8b5cf6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      📄 Customer PDF
    </button>
  </div>
)}

                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // DESKTOP: Table View
            <div style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Name
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Date
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Total Amount
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Paid
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Due Amount
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Storage
                      </th>
                      <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => {
                      const customerId = customer._id
                      const totalPaid = (customer.advances || []).reduce(
                        (sum, adv) => sum + (Number(adv.amount) || 0),
                        0
                      )

                      return (
                        <React.Fragment key={customerId}>
                          <tr style={{
                            borderBottom: "1px solid #e5e7eb",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                          >
                            {/* <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                              {customer.name}
                            </td> */}
                            <td
  onClick={() => {
    const isOpening = openPaymentRowId !== customerId
    setOpenPaymentRowId(isOpening ? customerId : null)
    setOpenAdvanceId(null)

    if (isOpening) {
      loadCustomerQuotations(customerId)
    }
  }}

  style={{
    padding: "16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    cursor: "pointer",
  }}
>
  {customer.name}
</td>

                            <td style={{ padding: "16px", fontSize: "13px", color: "#6b7280" }}>
                              {customer.date || "N/A"}
                            </td>
                            <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#1f2937", textAlign: "right" }}>
                              ₹{formatAmount(customer.totalAmount)}
                            </td>
                            <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#10b981", textAlign: "right" }}>
                              ₹{formatAmount(totalPaid)}
                            </td>
                            <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#ef4444", textAlign: "right" }}>
                              ₹{formatAmount(customer.dueAmount)}
                            </td>
                            <td style={{ padding: "16px", textAlign: "center" }}>
                              <span style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: customer.hardDisk === "Hard Disk" ? "#dbeafe" : customer.hardDisk === "Pendrive" ? "#fecaca" : "#e0e7ff",
                                color: customer.hardDisk === "Hard Disk" ? "#1e40af" : customer.hardDisk === "Pendrive" ? "#7f1d1d" : "#3730a3",
                                whiteSpace: "nowrap",
                                display: "inline-block"
                              }}>
                                {customer.hardDisk || "Hard Disk"} {customer.hardDisk !== "No Storage" && `- ₹${formatAmount(customer.hardDiskAmount)}`}
                              </span>
                            </td>
                            <td style={{ padding: "16px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                                {/* <button
                                  onClick={() => {
                                    setOpenPaymentRowId(openPaymentRowId === customerId ? null : customerId)
                                    setOpenAdvanceId(null)
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {openPaymentRowId === customerId ? "Hide" : "View"}
                                </button> */}
                                <button
                                  onClick={() => {
                                    handleEditCustomer(customer)
                                    setIsAdding(true)
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    background: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(customerId)}
                                  disabled={loading}
                                  style={{
                                    padding: "6px 12px",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.6 : 1,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Payment Details */}
                          {openPaymentRowId === customerId && (
                            <tr>
                              <td colSpan={7} style={{ padding: 0, background: "#f9fafb" }}>
                                <div style={{ padding: "20px", borderTop: "2px solid #e5e7eb" }}>
                                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
                                    💰 Payment Details
                                  </h4>
                                  
                                  {customer.advances && customer.advances.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                      {customer.advances.map((adv, advIdx) => (
                                        <div
                                          key={advIdx}
                                          style={{
                                            background: "white",
                                            padding: "14px",
                                            borderRadius: "8px",
                                            border: "1px solid #e5e7eb",
                                            display: "grid",
                                            gridTemplateColumns: "auto 1fr auto auto",
                                            gap: "16px",
                                            alignItems: "center",
                                          }}
                                        >
                                          <div>
                                            <span style={{
                                              background: "#dbeafe",
                                              color: "#1e40af",
                                              padding: "6px 10px",
                                              borderRadius: "6px",
                                              fontSize: "12px",
                                              fontWeight: "700",
                                            }}>
                                              Advance #{advIdx + 1}
                                            </span>
                                          </div>
                                          <div style={{ display: "flex", gap: "20px" }}>
                                            <div>
                                              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Amount</p>
                                              <p style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937" }}>
                                                ₹{formatAmount(adv.amount)}
                                              </p>
                                            </div>
                                            <div>
                                              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Date</p>
                                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>
                                                {adv.date || "N/A"}
                                              </p>
                                            </div>
                                            <div>
                                              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Mode</p>
                                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>
                                                {adv.paymentMode === "UPI"
                                                  ? `UPI (${
                                                      adv.upiApp === "Other"
                                                        ? adv.otherUpi || "Other"
                                                        : adv.upiApp || "N/A"
                                                    })`
                                                  : adv.paymentMode || "N/A"}
                                              </p>

                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      {/* Summary */}
                                      <div style={{
                                        background: "#dcfce7",
                                        padding: "14px",
                                        borderRadius: "8px",
                                        border: "2px solid #10b981",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}>
                                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#065f46" }}>
                                          Total Paid
                                        </span>
                                        <span style={{ fontSize: "18px", fontWeight: "800", color: "#065f46" }}>
                                          ₹{formatAmount(totalPaid)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{
                                      textAlign: "center",
                                      padding: "30px",
                                      background: "white",
                                      borderRadius: "8px",
                                      border: "1px dashed #d1d5db",
                                    }}>
                                      <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                                        No advance payments recorded yet.
                                      </p>
                                    </div>
                                  )}
                                  {customerQuotations[customerId]?.length > 0 && (
  <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
 <button
  onClick={() => {
    const invoiceIndex =
      filteredCustomers.findIndex(c => c._id === customerId) + 1

    const invoiceNumber = `KAL ${String(invoiceIndex).padStart(3, "0")}`

    generateInvoicePDF(customer, invoiceNumber)
  }}
  style={{
    padding: "10px 16px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
  }}
>
  🧾 Invoice PDF
</button>



    <button
      onClick={() =>
        downloadBase64PDF(
          customerQuotations[customerId][0].pdfFiles.ownerPdf,
          `${customer.name}_Owner_Quotation.pdf`
        )
      }
      style={{
        padding: "10px 16px",
        background: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
      }}
    >
      📥 Owner PDF
    </button>

    <button
      onClick={() =>
        downloadBase64PDF(
             customerQuotations[customerId][0].pdfFiles.customerPdf,

          `${customer.name}_Customer_Quotation.pdf`
        )
      }
      style={{
        padding: "10px 16px",
        background: "#8b5cf6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
      }}
    >
      📄 Customer PDF
    </button>
  </div>
)}

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Mobile Backdrop when form is open */}
      {isAdding && isMobile && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 999,
        }}
        onClick={() => {
          setIsAdding(false)
          setFormData({
            name: "",
            date: "",
            amount: "",
            totalAmount: "",
            dueAmount: "",
            advances: [],
            hardDisk: "Hard Disk",
            hardDiskAmount: 5000,
            storageNo: "",
            status: "Pending",
          })
        }}
        />
      )}
    </div>
  )
}
