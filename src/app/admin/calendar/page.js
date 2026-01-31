'use client'

import { useEffect, useState, useRef, useCallback } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState("view")
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchText, setSearchText] = useState("")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const calendarRef = useRef(null)

  const [editForm, setEditForm] = useState({
    _id: "",
    title: "",
    date: "",
    status: "Pending",
    customerName: "",
    customerPhone: "",
    location: "",
  })

  const colors = {
    Pending: "#f59e0b",
    Confirmed: "#10b981",
    Completed: "#3b82f6",
    Cancelled: "#ef4444",
  }

  const filteredEvents = useCallback(() => {
    return events.filter(ev => {
      const statusOk = statusFilter === "All" || ev.extendedProps.status === statusFilter
      const text = searchText.trim().toLowerCase()
      if (!text) return statusOk
      const searchOk = ev.extendedProps.customerName?.toLowerCase().includes(text)
      return statusOk && searchOk
    })
  }, [events, statusFilter, searchText])

  const showToastMessage = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    fetch("/api/calendar-events")
      .then(res => res.json())
      .then(data => {
        const today = new Date().toISOString().split("T")[0]
        data.forEach(ev => {
         if (ev.date === today && Notification.permission === "granted") {
           new Notification("📸 Event Today", {
             body: `${ev.title} – ${ev.customerName}`,
           })
         }
        })

        setEvents(data.map(ev => ({
         id: ev._id,
         title: ev.title,
         start: ev.start || ev.date,
         backgroundColor: colors[ev.status] || "#6b7280",
         borderColor: colors[ev.status] || "#6b7280",
         extendedProps: ev,
        })))
      })
  }, [])

  useEffect(() => {
    if (!searchText || !calendarRef.current) return
    const filtered = filteredEvents()
    if (filtered.length > 0) {
      const match = filtered[0]
      setTimeout(() => calendarRef.current?.getApi().gotoDate(match.start), 100)
    }
  }, [searchText, filteredEvents])

  const updateStatus = async (eventId, newStatus) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/calendar-events`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          _id: eventId,
          status: newStatus 
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setEvents(prev => prev.map(ev => 
        ev.extendedProps._id === eventId 
          ? {
              ...ev,
              backgroundColor: colors[newStatus],
              borderColor: colors[newStatus],
              extendedProps: { ...ev.extendedProps, status: newStatus }
            }
          : ev
      ))
      showToastMessage(`Status updated to ${newStatus} ✅`, "success")
    } catch (err) {
      console.error("Status update error:", err)
      showToastMessage("Status update failed ❌", "error")
    } finally {
      setSaving(false)
    }
  }

  const saveEvent = async (e) => {
    e?.preventDefault()
    setSaving(true)
    
    console.log("🔄 Saving:", editForm)
    
    try {
      const method = editForm._id ? "PUT" : "POST"
      
      const saveData = {
        _id: editForm._id || undefined,
        title: editForm.title.trim(),
        date: editForm.date,
        status: editForm.status,
        customerName: editForm.customerName.trim(),
        customerPhone: editForm.customerPhone?.trim() || "",
        location: editForm.location?.trim() || "",
      }
      
      console.log("📤 Sending:", saveData)
      
      const res = await fetch("/api/calendar-events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      })
      
      const data = await res.json()
      console.log("📥 Response:", data)
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      
      const freshData = await fetch("/api/calendar-events").then(r => r.json())
      setEvents(freshData.map(ev => ({
        id: ev._id,
        title: ev.title,
        start: ev.start || ev.date,
        backgroundColor: colors[ev.status] || "#6b7280",
        borderColor: colors[ev.status] || "#6b7280",
        extendedProps: ev,
      })))
      
      showToastMessage(
        editForm._id ? "Event updated! ✅" : "Event created! ✅", 
        "success"
      )
      setShowModal(false)
      setSearchText("")
    } catch (err) {
      console.error("❌ Save error:", err)
      showToastMessage(`Save failed: ${err.message} ❌`, "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteCalendarEvent = async (id) => {
    if (!confirm("Delete this event?")) return
    try {
      const res = await fetch(`/api/calendar-events?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.extendedProps._id !== id))
        setShowModal(false)
        showToastMessage("Event deleted! ✅", "success")
      }
    } catch (err) {
      showToastMessage("Delete failed ❌", "error")
    }
  }

  const renderFormFields = () => (
    <>
      <input
        required
        placeholder="Event title *"
        value={editForm.title || ""}
        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
        style={{ 
          width: "100%", 
          marginBottom: "12px", 
          padding: "12px", 
          border: "1px solid #d1d5db", 
          borderRadius: "6px", 
          fontSize: "14px" 
        }}
      />
      <input
        required
        placeholder="Customer name *"
        value={editForm.customerName || ""}
        onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
        style={{ 
          width: "100%", 
          marginBottom: "12px", 
          padding: "12px", 
          border: "1px solid #d1d5db", 
          borderRadius: "6px", 
          fontSize: "14px" 
        }}
      />
      <input
        placeholder="Phone"
        value={editForm.customerPhone || ""}
        onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
        style={{ 
          width: "100%", 
          marginBottom: "12px", 
          padding: "12px", 
          border: "1px solid #d1d5db", 
          borderRadius: "6px", 
          fontSize: "14px" 
        }}
      />
      <input
        placeholder="Location"
        value={editForm.location || ""}
        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
        style={{ 
          width: "100%", 
          marginBottom: "12px", 
          padding: "12px", 
          border: "1px solid #d1d5db", 
          borderRadius: "6px", 
          fontSize: "14px" 
        }}
      />
      <input
        required
        type="date"
        value={editForm.date || ""}
        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
        style={{ 
          width: "100%", 
          marginBottom: "12px", 
          padding: "12px", 
          border: "1px solid #d1d5db", 
          borderRadius: "6px", 
          fontSize: "14px" 
        }}
      />
      <select
        required
        value={editForm.status || "Pending"}
        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
        style={{ 
          width: "100%", 
          marginBottom: "20px", 
          padding: "12px", 
          border: "1px solid #d1d5db", 
          borderRadius: "6px", 
          fontSize: "14px" 
        }}
      >
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </>
  )

  const formatDateDMY = (dateStr) => {
   if (!dateStr) return ""
   const [year, month, day] = dateStr.split("-")
   return `${day}-${month}-${year}`
  }

  return (
    <>
      <style jsx global>{`
        /* --- Mobile Responsiveness Fixes --- */
        @media (max-width: 768px) {
          .calendar-container {
            padding: 10px !important;
            max-width: 100% !important;
            overflow-x: hidden;
          }

          /* 1. Header Toolbar Fixes */
          .fc-header-toolbar {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          
          .fc-toolbar-chunk {
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
            margin: 2px 0 !important;
          }
          
          /* Title sizing */
          .fc-toolbar-title {
            font-size: 1.25rem !important;
            text-align: center;
          }
          
          /* Button sizing */
          .fc-button {
            padding: 8px 12px !important;
            font-size: 13px !important;
            height: auto !important;
          }

          /* 2. Modal / Bottom Sheet Fixes */
          .modal-container {
            padding: 0 !important;
            align-items: flex-end !important; /* Bottom sheet style */
          }
          
          .modal-content {
            margin: 0 !important;
            border-radius: 20px 20px 0 0 !important;
            padding: 24px 20px 40px 20px !important; /* Extra bottom padding for safety */
            width: 100% !important;
            max-width: 100% !important;
            max-height: 85vh !important; /* Prevent it going off screen */
            overflow-y: auto !important; /* Enable internal scrolling */
            display: flex;
            flex-direction: column;
          }

          /* Adjust internal modal elements */
          .event-details-card {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }
          
          .status-buttons {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .status-button {
            width: 100% !important;
            padding: 12px !important;
          }
          
          .action-buttons, .form-buttons {
            flex-direction: column !important;
            gap: 10px !important;
            width: 100%;
          }
          
          .action-button, .form-button {
            width: 100% !important;
            padding: 14px !important;
            margin: 0 !important;
          }

          /* Filter Inputs */
          .filter-search-container {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .filter-select, .filter-search-input {
            width: 100% !important;
            padding: 12px !important;
          }
        }

        /* Specific fix for very small screens (Image 2 issue with black buttons) */
        @media (max-width: 480px) {
           .fc-toolbar-chunk:last-child .fc-button-group {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
           }
           .fc-toolbar-chunk:last-child .fc-button {
              flex: 1 1 45%; /* Wrap buttons if names are too long */
              margin: 2px !important;
              font-size: 11px !important;
           }
        }
      `}</style>
      
      <div className="calendar-container" style={{ 
        padding: "16px", 
        maxWidth: "1400px", 
        margin: "auto", 
        position: "relative" 
      }}>
        <h2 className="calendar-title" style={{ 
          fontSize: "22px", 
          fontWeight: "800", 
          marginBottom: "12px" 
        }}>
          📅 Event Calendar
        </h2>

        <div className="filter-search-container" suppressHydrationWarning style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "10px", 
          marginBottom: "16px" 
        }}>
          <select 
            className="filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            style={{ 
              padding: "8px", 
              borderRadius: "6px",
              border: "1px solid #d1d5db"
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            className="filter-search-input"
            placeholder="🔍 Search by customer name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}
          />
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={filteredEvents()}
          eventClick={(info) => {
            const eventData = info.event.extendedProps
            setSelectedEvent(eventData)
            setEditForm({
              _id: eventData._id,
              title: eventData.title || "",
              date: eventData.date || "",
              status: eventData.status || "Pending",
              customerName: eventData.customerName || "",
              customerPhone: eventData.customerPhone || "",
              location: eventData.location || "",
            })
            setMode("view")
            setShowModal(true)
          }}
          dateClick={(info) => {
            setSelectedEvent(null)
            setEditForm({
              _id: "",
              title: "",
              date: info.dateStr,
              status: "Pending",
              customerName: "",
              customerPhone: "",
              location: "",
            })
            setMode("create")
            setShowModal(true)
          }}
        />

        {toast.show && (
          <div style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10000,
            fontWeight: "600",
            fontSize: "14px",
            maxWidth: "90vw",
            wordWrap: "break-word",
          }}>
            {toast.message}
          </div>
        )}

        {showModal && (
          <div
            className="modal-container"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="modal-content"
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                maxWidth: "450px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="modal-title" style={{ 
                fontWeight: "800", 
                marginBottom: "20px", 
                fontSize: "20px",
                color: mode === "create" ? "#10b981" : "#1f2937"
              }}>
                {mode === "create" ? "➕ Create New Event" : 
                 mode === "edit" ? "✏️ Edit Event" : "📸 Event Details"}
              </h3>

              {mode === "view" && selectedEvent && (
                <>
                  <div className="event-details-card" style={{ 
                    fontSize: "14px", 
                    lineHeight: "1.7", 
                    marginBottom: "20px", 
                    padding: "20px", 
                    background: "#f8fafc", 
                    borderRadius: "8px",
                    borderLeft: `4px solid ${colors[selectedEvent.status]}`
                  }}>
                    <div style={{ marginBottom: "10px" }}><b>📝 Event:</b> {selectedEvent.title}</div>
                    <div style={{ marginBottom: "10px" }}>
                      <b>📅 Date:</b> {formatDateDMY(selectedEvent.date)}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <b>🏷️ Status:</b> 
                      <span style={{ 
                        color: "white",
                        background: colors[selectedEvent.status],
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        marginLeft: "8px"
                      }}>
                        {selectedEvent.status}
                      </span>
                    </div>
                    <div style={{ marginBottom: "10px" }}><b>👤 Customer:</b> {selectedEvent.customerName}</div>
                    <div style={{ marginBottom: "10px" }}><b>📞 Phone:</b> {selectedEvent.customerPhone}</div>
                    <div><b>📍 Location:</b> {selectedEvent.location}</div>
                  </div>

                  <div className="status-buttons-container" style={{ 
                    marginBottom: "20px", 
                    padding: "16px", 
                    background: "#f1f5f9", 
                    borderRadius: "8px", 
                    border: "1px solid #e2e8f0" 
                  }}>
                    <div style={{ 
                      fontWeight: "600", 
                      marginBottom: "12px", 
                      color: "#475569", 
                      fontSize: "14px" 
                    }}>
                      Quick Status Update:
                    </div>
                    <div className="status-buttons" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["Pending", "Confirmed", "Completed", "Cancelled"].map(status => (
                        <button
                          key={status}
                          className="status-button"
                          onClick={() => updateStatus(selectedEvent._id, status)}
                          disabled={saving || selectedEvent.status === status}
                          style={{
                            padding: "10px 16px",
                            background: selectedEvent.status === status ? colors[status] : "#e2e8f0",
                            color: selectedEvent.status === status ? "white" : "#475569",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.7 : 1,
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="action-buttons" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      className="action-button"
                      onClick={() => {
                        setEditForm({
                          _id: selectedEvent._id,
                          title: selectedEvent.title || "",
                          date: selectedEvent.date || "",
                          status: selectedEvent.status || "Pending",
                          customerName: selectedEvent.customerName || "",
                          customerPhone: selectedEvent.customerPhone || "",
                          location: selectedEvent.location || "",
                        })
                        setMode("edit")
                      }}
                      style={{
                        flex: "1", 
                        minWidth: "100px", 
                        background: "#3b82f6", 
                        color: "white",
                        padding: "12px 16px", 
                        borderRadius: "8px", 
                        border: "none",
                        fontWeight: "600", 
                        cursor: "pointer"
                      }}
                    >
                      ✏️ Full Edit
                    </button>
                    <button
                      className="action-button"
                      onClick={() => deleteCalendarEvent(selectedEvent._id)}
                      style={{
                        flex: "1", 
                        minWidth: "100px", 
                        background: "#ef4444", 
                        color: "white",
                        padding: "12px 16px", 
                        borderRadius: "8px", 
                        border: "none",
                        fontWeight: "600", 
                        cursor: "pointer"
                      }}
                    >
                      🗑️ Delete
                    </button>
                    <button
                      className="action-button"
                      onClick={() => setShowModal(false)}
                      style={{
                        flex: "1", 
                        minWidth: "100px", 
                        background: "transparent", 
                        color: "#6b7280",
                        padding: "12px 16px", 
                        borderRadius: "8px", 
                        border: "1px solid #d1d5db",
                        fontWeight: "600", 
                        cursor: "pointer"
                      }}
                    >
                      ❌ Close
                    </button>
                  </div>
                </>
              )}

              {(mode === "edit" || mode === "create") && (
                <form onSubmit={saveEvent} style={{ marginBottom: "20px" }}>
                  {renderFormFields()}
                  <div className="form-buttons" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      className="form-button"
                      type="submit"
                      disabled={saving}
                      style={{
                        flex: 1,
                        background: saving ? "#9ca3af" : "#10b981",
                        color: "white",
                        padding: "14px 20px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "15px",
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      {saving ? "💾 Saving..." : mode === "edit" ? "💾 Update Event" : "💾 Create Event"}
                    </button>
                    <button
                      className="form-button"
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setMode("view")
                      }}
                      disabled={saving}
                      style={{
                        flex: 1,
                        background: "transparent",
                        color: "#6b7280",
                        padding: "14px 20px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontWeight: "600",
                        fontSize: "15px",
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      {mode === "edit" ? "❌ Cancel" : "❌ Close"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}