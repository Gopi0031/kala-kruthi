"use client";
import { useState, useEffect } from "react";

export default function B2BCustomers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    studio: "", person: "", phone: "", date: "",
    camera: "", location: "", advance: "", total: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = "/api";

  // Camera options
  const cameras = ['Photo Camera', 'Video Camera', 'Candid Photo', 'Candid Video'];

  // Load customers from MongoDB
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching from:', `${API_BASE}/b2b-customers`);
      
      const response = await fetch(`${API_BASE}/b2b-customers`, {
        cache: 'no-store',
        method: 'GET'
      });

      console.log('📊 Response status:', response.status, 'ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Fetched data:', data);
      const sorted = Array.isArray(data)
  ? data.sort((a, b) => new Date(b._id) - new Date(a._id))
  : [];

setCustomers(sorted);

    } catch (err) {
      console.error('❌ Fetch customers error:', err);
      setError(err.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInput = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Save/Update customer
  const saveCustomer = async () => {
  if (!form.studio || !form.phone || !form.total) {
    alert("Fill: Studio, Phone, Total");
    return;
  }

  const customerData = {
    studio: form.studio,
    person: form.person,
    phone: form.phone,
    date: form.date,
    camera: form.camera,
    location: form.location,
    advance: parseFloat(form.advance) || 0,
    total: parseFloat(form.total) || 0,
  };

  try {
    setLoading(true);
    setError(null);

    const url = editingId
      ? `/api/b2b-customers/${editingId}`
      : `/api/b2b-customers`;

    const method = editingId ? "PUT" : "POST";

    console.log("🔍 PUT ID:", editingId); // 🔥 MUST PRINT A REAL _id

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    alert(editingId ? "✅ Updated!" : "✅ Saved!");

    resetForm();
    await fetchCustomers(); // single source of truth
  } catch (err) {
    console.error("❌ Save error:", err);
    alert(`Failed to update customer: ${err.message}`);
  } finally {
    setLoading(false);
  }
};


  // Edit customer - FIXED FOR MONGODB _id
  const editCustomer = (customer) => {
    setForm({
      studio: customer.studio || "",
      person: customer.person || "",
      phone: customer.phone || "",
      date: customer.date || "",
      camera: customer.camera || "",
      location: customer.location || "",
      advance: customer.advance?.toString() || "",
      total: customer.total?.toString() || ""
    });
    setEditingId(customer._id.toString()); // Use MongoDB _id
    setShowForm(true);
  };

  // Delete customer - FIXED FOR MONGODB _id
  const deleteCustomer = async (id) => {
    if (!confirm('Delete this customer?')) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting:', `${API_BASE}/b2b-customers/${id}`);
      
      const response = await fetch(`${API_BASE}/b2b-customers/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      setCustomers(customers.filter(c => c._id.toString() !== id));
      alert('✅ Deleted!');
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert(`Failed to delete customer: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      studio: "", person: "", phone: "", date: "",
      camera: "", location: "", advance: "", total: ""
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  // Balance calculation
  const balance = () => {
    return (parseFloat(form.total) || 0) - (parseFloat(form.advance) || 0);
  };

  // Error screen with retry
  if (error && customers.length === 0 && !showForm) {
    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          background: "#fee2e2",
          border: "2px solid #ef4444",
          borderRadius: "12px",
          padding: "30px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", color: "#dc2626", marginBottom: "10px" }}>⚠️</div>
          <h2 style={{ color: "#dc2626", margin: "0 0 15px 0", fontSize: "20px" }}>Connection Error</h2>
          <p style={{ color: "#991b1b", margin: "0 0 25px 0", fontSize: "16px" }}>
            {error}
          </p>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={fetchCustomers}
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: loading ? "#6b7280" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                minWidth: "140px"
              }}
            >
              🔄 Retry Load
            </button>
            <button 
              onClick={() => setShowForm(true)}
              style={{
                padding: "12px 24px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                minWidth: "140px"
              }}
            >
              ➕ Add First Customer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && customers.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading customers...</div>
      </div>
    );
  }

const downloadCustomerPDF = async (customer) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF("p", "mm", "a4");

  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  

  const MARGIN = 20;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  const ROW_H = 10;
  const THEME = [16, 185, 129];

  /* ---------- BACKGROUND ---------- */
  doc.addImage("/letterhead.jpeg", "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  let y = 30;

  /* ---------- HEADER ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("B2B CUSTOMER DETAILS", PAGE_WIDTH / 2, y, { align: "center" });

  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Business to Business Transaction Summary",
    PAGE_WIDTH / 2,
    y,
    { align: "center" }
  );

  y += 30;

  /* ---------- CUSTOMER DETAILS HEADER ---------- */
  doc.setFillColor(...THEME);
  doc.rect(MARGIN, y, CONTENT_WIDTH+15, 8, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CUSTOMER DETAILS", PAGE_WIDTH / 2, y + 5.5, { align: "center" });

  y += 8;

  /* ---------- CUSTOMER DETAILS TABLE ---------- */
  doc.setDrawColor(...THEME);
  doc.rect(MARGIN, y, CONTENT_WIDTH +15, 30);

  doc.setTextColor(0);
  doc.setFontSize(11);

  const leftX = MARGIN + 4;
  const rightX = PAGE_WIDTH / 2 + 4;

  const row = (x, label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", x + 40, y + 7);
  };

  row(leftX, "Name :", customer.person);
  row(rightX, "Date :", customer.date || "-");

  y += ROW_H;
  row(leftX, "Phone :", customer.phone);
  row(rightX, "Camera :", customer.camera);

  y += ROW_H;
  row(leftX, "Studio :", customer.studio);
  row(rightX, "Location :", customer.location);

  y += 26;

  /* ---------- PAYMENT TABLE HEADER ---------- */
  doc.setFillColor(...THEME);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 8, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.text("Description", MARGIN + 6, y + 5.5);
  doc.text("Amount", PAGE_WIDTH - MARGIN - 6, y + 5.5, { align: "right" });

  y += 8;

  /* ---------- PAYMENT TABLE BODY ---------- */
  const tableRow = (label, value) => {
    doc.setDrawColor(200);
    doc.rect(MARGIN, y, CONTENT_WIDTH, ROW_H);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(label, MARGIN + 6, y + 6.5);
    doc.text(value, PAGE_WIDTH - MARGIN - 6, y + 6.5, { align: "right" });
    y += ROW_H;
  };

  const formatAmount = (v) =>
    `Rs ${Number(v || 0).toLocaleString("en-IN")}/-`;

  const balance =
    (parseFloat(customer.total) || 0) -
    (parseFloat(customer.advance) || 0);

  tableRow("Total Amount", formatAmount(customer.total));
  tableRow("Paid Amount", formatAmount(customer.advance));

  y += 16;

  /* ---------- TOTAL DUE AMOUNT BOX ---------- */
  doc.setDrawColor(...THEME);
  doc.setLineWidth(1);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...THEME);
  doc.text("TOTAL DUE AMOUNT", PAGE_WIDTH / 2, y + 8, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text(formatAmount(balance), PAGE_WIDTH / 2, y + 15, {
    align: "center",
  });

  doc.save(`B2B-${customer.studio}-${Date.now()}.pdf`);
};





  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#1f2937" }}>
          🏢 B2B Customers {error && <span style={{color: "#ef4444", fontSize: "14px", marginLeft: "10px"}}>⚠️ {error}</span>}
        </h1>
        {!showForm && !loading && (
          <button onClick={() => setShowForm(true)} style={{ 
            padding: "10px 20px", 
            background: "#10b981", 
            color: "white", 
            border: "none", 
            borderRadius: "8px", 
            fontWeight: "600", 
            cursor: "pointer" 
          }}>
            ➕ Add Customer
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
          marginBottom: "20px" 
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
            {editingId ? "✏️ Edit Customer" : "➕ Add New Customer"}
          </h2>
          
          {/* Form Grid - Responsive */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "15px", 
            marginBottom: "20px" 
          }}>
            <Input label="Studio Name *" value={form.studio} onChange={e => handleInput('studio', e.target.value)} />
            <Input label="Person Name" value={form.person} onChange={e => handleInput('person', e.target.value)} />
            <Input label="Phone *" value={form.phone} onChange={e => handleInput('phone', e.target.value)} />
            <Input label="Date" type="date" value={form.date} onChange={e => handleInput('date', e.target.value)} />
            
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                Camera Type
              </label>
              <select 
                value={form.camera} 
                onChange={e => handleInput('camera', e.target.value)} 
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  border: "1px solid #d1d5db", 
                  borderRadius: "6px", 
                  fontSize: "14px",
                  background: "white"
                }}
              >
                <option value="">Select Camera</option>
                {cameras.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <Input label="Location" value={form.location} onChange={e => handleInput('location', e.target.value)} />
            <Input label="Total Amount *" type="number" value={form.total} onChange={e => handleInput('total', e.target.value)} placeholder="₹" />
            <Input label="Advance" type="number" value={form.advance} onChange={e => handleInput('advance', e.target.value)} placeholder="₹" />
          </div>

          {/* Balance Display */}
          <div style={{ 
            background: balance() === 0 ? "#d1fae5" : "#fef3c7", 
            padding: "15px", 
            borderRadius: "8px", 
            marginBottom: "20px", 
            border: `2px solid ${balance() === 0 ? "#10b981" : "#f59e0b"}` 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600", color: balance() === 0 ? "#065f46" : "#92400e" }}>
                {balance() === 0 ? "✅ Fully Paid" : "💰 Balance Due"}
              </span>
              <span style={{ fontSize: "22px", fontWeight: "800", color: balance() === 0 ? "#065f46" : "#92400e" }}>
                ₹{balance().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              onClick={saveCustomer} 
              disabled={loading || !form.studio || !form.phone || !form.total}
              style={{ 
                flex: 1, 
                padding: "12px", 
                background: loading ? "#6b7280" : "#10b981", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                fontWeight: "600", 
                cursor: loading ? "not-allowed" : "pointer",
                minWidth: "120px"
              }}
            >
              {loading ? "Saving..." : (editingId ? "Update" : "Save")}
            </button>
            <button 
              onClick={resetForm} 
              disabled={loading}
              style={{ 
                flex: 1, 
                padding: "12px", 
                background: "#6b7280", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                fontWeight: "600", 
                cursor: loading ? "not-allowed" : "pointer",
                minWidth: "120px"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Customer List */}
      {customers.length === 0 && !showForm && !loading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px", 
          background: "white", 
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "20px" }}>
            No customers found. Add your first customer.
          </p>
          <button 
            onClick={() => setShowForm(true)} 
            style={{ 
              padding: "12px 24px", 
              background: "#10b981", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "600", 
              cursor: "pointer" 
            }}
          >
            ➕ Add Your First Customer
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table" style={{ 
            background: "white", 
            borderRadius: "12px", 
            overflow: "hidden", 
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Studio</th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Person</th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Phone</th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Camera</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Total</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Advance</th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Balance</th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const bal = (parseFloat(c.total) || 0) - (parseFloat(c.advance) || 0);
                  return (
                    <tr key={c._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "16px", fontWeight: "600" }}>{c.studio}</td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>{c.person || "-"}</td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>{c.phone}</td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>{c.camera || "-"}</td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "600" }}>₹{parseFloat(c.total).toLocaleString()}</td>
                      <td style={{ padding: "16px", textAlign: "right", color: "#10b981", fontWeight: "600" }}>₹{(c.advance || 0).toLocaleString()}</td>
                      <td style={{ padding: "16px", textAlign: "right", color: bal === 0 ? "#10b981" : "#ef4444", fontWeight: "600" }}>
                        ₹{bal.toLocaleString()}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          
                          <button 
                            onClick={() => editCustomer(c)} 
                            disabled={loading}
                            style={{ 
                              padding: "6px 12px", 
                              background: loading ? "#6b7280" : "#3b82f6", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "5px", 
                              fontSize: "12px", 
                              cursor: loading ? "not-allowed" : "pointer" 
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteCustomer(c._id.toString())} 
                            disabled={loading}
                            style={{ 
                              padding: "6px 12px", 
                              background: loading ? "#6b7280" : "#ef4444", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "5px", 
                              fontSize: "12px", 
                              cursor: loading ? "not-allowed" : "pointer" 
                            }}
                          >
                            Delete
                          </button>
                          <button
  onClick={() => downloadCustomerPDF(c)}
  style={{
    padding: "6px 12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "12px",
    cursor: "pointer",
  }}
>
  PDF
</button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-cards" style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "15px"
          }}>
            {customers.map(c => {
              const bal = (parseFloat(c.total) || 0) - (parseFloat(c.advance) || 0);
              return (
                <div key={c._id} style={{ 
                  background: "white", 
                  borderRadius: "12px", 
                  padding: "16px", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", margin: "0 0 4px 0" }}>{c.studio}</h3>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>{c.person || "No contact"}</p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>📞 {c.phone}</p>
                    </div>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: bal === 0 ? "#d1fae5" : "#fee2e2", 
                      color: bal === 0 ? "#065f46" : "#dc2626",
                      borderRadius: "12px", 
                      fontSize: "11px", 
                      fontWeight: "600" 
                    }}>
                      {bal === 0 ? "Paid" : "Pending"}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>
                      📅 {c.date || "No date"} | 📍 {c.location || "No location"}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                      📷 {c.camera || "No camera"}
                    </p>
                  </div>

                  {/* Amounts */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(3, 1fr)", 
                    gap: "8px", 
                    marginBottom: "16px",
                    textAlign: "center"
                  }}>
                    <div>
                      <p style={{ fontSize: "10px", color: "#6b7280", margin: "0 0 4px 0" }}>Total</p>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937", margin: 0 }}>₹{parseFloat(c.total).toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", color: "#6b7280", margin: "0 0 4px 0" }}>Advance</p>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#10b981", margin: 0 }}>₹{(c.advance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", color: "#6b7280", margin: "0 0 4px 0" }}>Balance</p>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: bal === 0 ? "#10b981" : "#ef4444", margin: 0 }}>₹{bal.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => editCustomer(c)} 
                      disabled={loading}
                      style={{ 
                        flex: 1, 
                        padding: "8px", 
                        background: loading ? "#6b7280" : "#3b82f6", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "6px", 
                        fontWeight: "600", 
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "13px"
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCustomer(c._id.toString())} 
                      disabled={loading}
                      style={{ 
                        flex: 1, 
                        padding: "8px", 
                        background: loading ? "#6b7280" : "#ef4444", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "6px", 
                        fontWeight: "600", 
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "13px"
                      }}
                    >
                      Delete
                    </button>
                    <button
  onClick={() => downloadCustomerPDF(c)}
  style={{
    flex: 1,
    padding: "8px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  }}
>
  PDF
</button>

                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Mobile Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: grid !important; }
        }
        @media (min-width: 769px) {
          .desktop-table { display: block !important; }
          .mobile-cards { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// Input Component
const Input = ({ label, type = "text", value, onChange, placeholder, ...props }) => (
  <div>
    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
      {label}
    </label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      style={{ 
        width: "100%", 
        padding: "10px", 
        border: "1px solid #d1d5db", 
        borderRadius: "6px", 
        fontSize: "14px",
        boxSizing: "border-box"
      }} 
      {...props} 
    />
  </div>
);
