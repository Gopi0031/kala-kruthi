"use client"
import React, { useState, useEffect, useCallback } from "react"
import "./dashboard.css"
import { requireAuth } from '@/lib/auth'

// Import all components
import HomeServices from './components/HomeServices'
import Toast from './components/Toast'
import Loading from './components/Loading'
import Sidebar from './components/Sidebar'
import DashboardStats from './components/DashboardStats'
import DashboardCharts from './components/DashboardCharts'
import Packages from './components/Packages'
import Quotation from './components/Quotation'
import Gallery from './components/Gallery'
import HeroSection from './components/HeroSection'
import Services from './components/Services'
import CustomerDetails from './components/CustomerDetails'
import B2BCustomer from './components/B2BCustomer' // Changed from B2BImages to B2BCustomer
import PricingList from './components/PricingList'

export default function AdminDashboard() {
  useEffect(() => {
    requireAuth();
  }, []);
  const [quotationPricing, setQuotationPricing] = useState({})

  const [active, setActive] = useState("Dashboard")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [homeServices, setHomeServices] = useState([])
  const [activeTab, setActiveTab] = useState('photography')

  // Hero Section State
  const [heroImages, setHeroImages] = useState([])
  const [heroFormData, setHeroFormData] = useState({
    title: 'Welcome to Kalakruthi',
    subtitle: 'Stories of Love & Joy of Memories.',
    order: 0
  })
  const [selectedHeroImage, setSelectedHeroImage] = useState(null)
  const [heroPreviewUrl, setHeroPreviewUrl] = useState('')

  // Customer State
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    amount: "",
    totalAmount: "",
    dueAmount: "",
    advances: [],
    hardDisk: "Hard Disk",
    hardDiskAmount: 5000,
  })

  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const [customerFilter, setCustomerFilter] = useState("All")
  const [customers, setCustomers] = useState([])
  const [galleryMedia, setGalleryMedia] = useState([])
  const [services, setServices] = useState([])
  const [serviceInput, setServiceInput] = useState("")
  const [openPaymentRowId, setOpenPaymentRowId] = useState(null)
  const [openAdvanceId, setOpenAdvanceId] = useState(null)
  const [selectedAdvanceCount, setSelectedAdvanceCount] = useState(0)
  
  // Quotation State
  // Quotation State
const [quotation, setQuotation] = useState({
  firstName: "",
  lastName: "",
  customerPhone: "",
  customerEmail: "",
  location: "", // ✅ ADD THIS
  selectedEvents: [],
  eventDates: {},
  notes: "",
  eventServices: {},
  serviceAmounts: {},
  serviceTimes: {}, // ✅ ADD THIS
  selectedEquipment: {}, // ✅ ADD THIS - Required for equipment selection
  sheetsCount: 0, // ✅ ADD THIS
  sheetsCustomerPrice: 0, // ✅ ADD THIS
  additionalAmount: "",
  discount: "",
})

  const [activeRequirementTab, setActiveRequirementTab] = useState("")

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  // ✅ ADD fetchServices function
  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    }
  }

  // Hero Section Functions
  const fetchHeroImages = async () => {
    try {
      const res = await fetch('/api/hero')
      const data = await res.json()
      setHeroImages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching hero images:', error)
    }
  }

  const handleHeroImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const maxSize = 15 * 1024 * 1024
      if (file.size > maxSize) {
        showToast('Image size too large. Maximum size is 15MB.', 'error')
        e.target.value = ''
        return
      }
      setSelectedHeroImage(file)
      setHeroPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadHeroImage = async (e) => {
    e.preventDefault()
    if (!selectedHeroImage) {
      showToast('Please select an image', 'error')
      return
    }
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', heroFormData.title)
      formDataToSend.append('subtitle', heroFormData.subtitle)
      formDataToSend.append('image', selectedHeroImage)
      const res = await fetch('/api/hero', {
        method: 'POST',
        body: formDataToSend,
      })
      const result = await res.json()
      if (result.success) {
        showToast('Hero image uploaded successfully!', 'success')
        setHeroFormData({ title: 'Welcome to Kalakruthi', subtitle: 'Stories of Love & Joy of Memories.', order: 0 })
        setSelectedHeroImage(null)
        setHeroPreviewUrl('')
        fetchHeroImages()
      } else {
        showToast('Failed to upload hero image', 'error')
      }
    } catch (error) {
      console.error('Error uploading hero:', error)
      showToast('Error uploading hero image', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHeroImage = async (id) => {
    if (!confirm('Are you sure you want to delete this hero image?')) return
    try {
      const res = await fetch(`/api/hero?id=${id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        showToast('Hero image deleted successfully', 'success')
        fetchHeroImages()
      } else {
        showToast('Failed to delete hero image', 'error')
      }
    } catch (error) {
      console.error('Error deleting hero:', error)
      showToast('Error deleting hero image', 'error')
    }
  }

  const toggleHeroActive = async (hero) => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('id', hero._id)
      formDataToSend.append('title', hero.title)
      formDataToSend.append('subtitle', hero.subtitle)
      formDataToSend.append('isActive', !hero.isActive)
      formDataToSend.append('order', hero.order)
      const res = await fetch('/api/hero', {
        method: 'PATCH',
        body: formDataToSend,
      })
      const result = await res.json()
      if (result.success) {
        fetchHeroImages()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  

  // Customer Functions
const handleTotalAmountChange = (value) => {
  const totalAmount = Number(value) || 0
  const autoAmount = Math.round(totalAmount * 0.25)

  const updatedAdvances = formData.advances.map((adv, index) =>
    adv.isAuto && index < 3
      ? { ...adv, amount: autoAmount }
      : adv
  )

  const totalPaid = updatedAdvances.reduce(
    (sum, adv) => sum + (Number(adv.amount) || 0),
    0
  )

  setFormData((prev) => ({
    ...prev,
    totalAmount,
    advances: updatedAdvances,
    dueAmount: totalAmount - totalPaid,
  }))
}




const handleAdvanceCountChange = (count) => {
  setSelectedAdvanceCount(count)

  const totalAmount = Number(formData.totalAmount) || 0
  const autoAmount = Math.round(totalAmount * 0.25)

  const newAdvances = []

  for (let i = 0; i < count; i++) {
    const existing = formData.advances[i]

    const shouldAuto =
      i < 3 && (existing?.isAuto ?? true)

    newAdvances.push({
      ...existing,
      amount: shouldAuto
        ? autoAmount
        : existing?.amount || "",
      isAuto: shouldAuto,
      date: existing?.date || "",
      paymentMode: existing?.paymentMode || "",
      upiApp: existing?.upiApp || "",
      otherUpi: existing?.otherUpi || "",
    })
  }

  const totalPaid = newAdvances.reduce(
    (sum, adv) => sum + (Number(adv.amount) || 0),
    0
  )

  setFormData((prev) => ({
    ...prev,
    advances: newAdvances,
    dueAmount: totalAmount - totalPaid,
    status: totalAmount - totalPaid <= 0 ? "Paid" : "Pending",
  }))
}





  const updateAdvance = (index, field, value) => {
  setFormData(prev => {
    const newAdvances = [...prev.advances]

    newAdvances[index] = {
      ...newAdvances[index],
      [field]: value,
    }

    const totalPaid = newAdvances.reduce(
      (sum, adv) => sum + (Number(adv.amount) || 0),
      0
    )

    const totalAmount = Number(prev.totalAmount) || 0
    const dueAmount = totalAmount - totalPaid

    return {
      ...prev,
      advances: newAdvances,
      dueAmount,
      status: dueAmount <= 0 ? "Paid" : "Pending",
    }
  })
}


  const apiRequest = useCallback(async (url, options = {}) => {
    try {
      const headers = { ...options.headers }
      if (!options.body || !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json"
      }
      
      const res = await fetch(`/api/${url}`, { 
        ...options, 
        headers,
        cache: 'no-store'
      })
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error')
        console.error(`API Error [${res.status}]: /api/${url} - ${errorText}`)
        throw new Error(errorText || `HTTP ${res.status}`)
      }
      
      const data = await res.json().catch(() => null)
      return data || []
    } catch (error) {
      console.error(`Failed to fetch /api/${url}:`, error.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    const results = await Promise.allSettled([
      apiRequest("customers"),
      apiRequest("gallery"), 
      apiRequest("services"),
      apiRequest("home-services"),
    ])

    const customersData = results[0].status === 'fulfilled' && Array.isArray(results[0].value) 
      ? results[0].value : []
    
    const galleryData = results[1].status === 'fulfilled' ? results[1].value : { media: [] }
    const servicesData = results[2].status === 'fulfilled' && Array.isArray(results[2].value) 
      ? results[2].value : []
    const homeServicesData = results[3].status === 'fulfilled' && Array.isArray(results[3].value) 
      ? results[3].value : []

    const normalizedCustomers = customersData.map((c) => {
      const total = parseInt(c?.totalAmount) || 0
      const advances = Array.isArray(c?.advances) ? c.advances : []
      const paidFromAdvances = advances.reduce((sum, adv) => sum + (Number(adv?.amount) || 0), 0)
      const due = total - paidFromAdvances
      return { 
        ...c, 
        totalAmount: total, 
        advances, 
        dueAmount: due, 
        status: due <= 0 ? "Paid" : "Pending" 
      }
    })

    setCustomers(normalizedCustomers)
    setGalleryMedia(Array.isArray(galleryData.media) ? galleryData.media : [])
    setServices(servicesData)
    setHomeServices(homeServicesData)
  }, [apiRequest])

  useEffect(() => {
    refreshData()
    fetchHeroImages()
  }, [refreshData])

  const handleSaveCustomer = async () => {
    if (!formData.name || !formData.totalAmount) {
      showToast("Please fill required fields", "error")
      return
    }

    try {
      setLoading(true)
      
      const customerData = {
        name: formData.name,
        date: formData.date,
        totalAmount: parseInt(formData.totalAmount) || 0,
        hardDisk: formData.hardDisk || "Hard Disk",
        hardDiskAmount: parseInt(formData.hardDiskAmount) || 0,
        advances: formData.advances || [],
        dueAmount: parseInt(formData.dueAmount) || 0,
        status: formData.status || "Pending"
      }

      if (editingId) {
        customerData._id = editingId
      }

      const response = await fetch("/api/customers", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to save customer")
      }

      showToast(editingId ? "Customer updated successfully!" : "Customer added successfully!", "success")
      
      setIsAdding(false)
      setEditingId(null)
      setSelectedAdvanceCount(0)
      setFormData({
        name: "",
        date: "",
        totalAmount: "",
        dueAmount: "",
        advances: [],
        hardDisk: "Hard Disk",
        hardDiskAmount: 5000,
        status: "Pending"
      })

      await refreshData()

    } catch (error) {
      console.error("Save error:", error)
      showToast(`Error: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (customerData) => {
    try {
      setLoading(true)

      const { default: jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      const doc = new jsPDF()
      
      doc.setFillColor(16, 185, 129)
      doc.rect(0, 0, 210, 40, "F")
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont(undefined, "bold")
      doc.text("Kalakruthi Photography", 20, 20)
      
      doc.setFontSize(10)
      doc.text("Quotation Invoice", 20, 30)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.text(`Customer: ${customerData.name}`, 20, 60)
      doc.text(`Date: ${customerData.date || new Date().toLocaleDateString()}`, 20, 70)
      doc.text(`Total Amount: ₹${customerData.totalAmount}`, 20, 80)
      doc.text(`Due Amount: ₹${customerData.dueAmount}`, 20, 90)
      
      if (customerData.hardDisk) {
        doc.text(`Storage: ${customerData.hardDisk} (₹${customerData.hardDiskAmount})`, 20, 100)
      }

      const pdfBlob = doc.output("blob")

      const formData = new FormData()
      formData.append("pdf", pdfBlob, `quotation_${customerData.name}.pdf`)
      formData.append("to", customerData.email || "customer@example.com")
      formData.append("subject", `Quotation - ${customerData.name}`)
      formData.append("customerName", customerData.name)

      const response = await fetch("/api/send-quotation", {
        method: "POST",
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email")
      }

      showToast("Quotation sent successfully!", "success")

    } catch (error) {
      console.error("Email error:", error)
      showToast(`Error sending email: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleEditCustomer = (customer) => {
    const advCount = (customer.advances || []).length
    setEditingId(customer._id || customer.id)
    setSelectedAdvanceCount(advCount)
    setIsAdding(true)
    
    setFormData({
      name: customer.name || "",
      date: customer.date || "",
      totalAmount: customer.totalAmount || "",
      dueAmount: customer.dueAmount || "",
      advances: customer.advances || [],
      hardDisk: customer.hardDisk || "Hard Disk",
      hardDiskAmount: customer.hardDiskAmount || 5000,
      status: customer.status || "Pending",
    })
    
    setOpenPaymentRowId(null)
  }

  const handleDeleteCustomer = async (id) => {
    if (!confirm("Delete customer?")) return
    
    try {
      setLoading(true)
      const response = await fetch("/api/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete customer")
      }

      showToast("Customer deleted successfully!", "success")
      await refreshData()
    } catch (error) {
      console.error("Delete error:", error)
      showToast(`Error: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllCustomers = async () => {
    if (!confirm("Are you sure you want to delete ALL customers? This action cannot be undone!")) return
    
    try {
      setLoading(true)
      
      for (const customer of customers) {
        await fetch("/api/customers", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: customer._id || customer.id })
        })
      }
      
      showToast("All customers deleted successfully!", "success")
      await refreshData()
    } catch (error) {
      console.error("Delete all error:", error)
      showToast("Failed to delete all customers", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setLoading(true)
    const formDataUpload = new FormData()
    files.forEach((file) => formDataUpload.append("media", file))

    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      showToast(data.message, "success")
      e.target.value = ""
      await refreshData()
    } catch (error) {
      console.error("Upload error:", error)
      showToast(`Upload failed: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const deleteGalleryMedia = async (publicId) => {
    if (!publicId || !confirm("Delete this media from Cloudinary?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Delete failed")
      }

      showToast("Media deleted successfully!", "success")
      await refreshData()
    } catch (error) {
      console.error("Delete error:", error)
      showToast(`Delete failed: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const addService = async () => {
    if (!serviceInput.trim()) return

    try {
      setLoading(true)
      
      const serviceType = activeTab === 'videography' ? 'videography' : 'photography'
      
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: serviceInput, 
          images: [],
          type: serviceType
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add service")
      }

      showToast("Service added successfully!", "success")
      setServiceInput("")
      await refreshData()
    } catch (error) {
      console.error("Add service error:", error)
      showToast(`Failed to add service: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (serviceId) => {
    if (!serviceId) {
      showToast("Service ID required", "error");
      return;
    }

    if (!confirm("Are you sure you want to delete this service? This will also delete all images!")) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete service");
      }

      showToast("Service deleted successfully!", "success");
      await refreshData();
    } catch (error) {
      console.error("Delete service error:", error);
      showToast(`Failed to delete: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteServiceImage = async (serviceId, imageId) => {
    if (!confirm("Delete this service image?")) return

    try {
      setLoading(true)

      try {
        const cloudinaryResponse = await fetch("/api/cloudinary-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: imageId,
            resourceType: "image",
          }),
        })
        await cloudinaryResponse.json()
      } catch (cloudError) {
        console.warn("Cloudinary delete warning:", cloudError)
      }

      const response = await fetch("/api/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          serviceId: serviceId,
          imageId: imageId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete image")
      }

      showToast("Image deleted successfully!", "success")
      await refreshData()
    } catch (error) {
      console.error("Delete image error:", error)
      showToast(`Delete failed: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  // ✅ VIDEO URL UPLOAD HANDLER
  const handleVideoUrlUpload = async (serviceId, videoUrl, category) => {
    try {
      setLoading(true)
      
      console.log('📹 Uploading video URL:', { serviceId, videoUrl, category })
      
      const response = await fetch('/api/services/video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: serviceId,
          url: videoUrl,
          category: category || 'videography'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add video URL')
      }

      showToast('Video URL added successfully!', 'success')
      await refreshData()
    } catch (error) {
      console.error('Error adding video URL:', error)
      showToast('Error adding video URL: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectUpload = async (serviceId, event, category = 'photography') => {
    const files = Array.from(event.target.files)
    
    if (files.length === 0) return

    const oversizedFiles = files.filter(
      (file) => file.size / 1024 / 1024 > 15
    )

    if (oversizedFiles.length > 0) {
      showToast(
        `${oversizedFiles.length} file(s) exceed 15MB limit. Please compress them.`,
        "error"
      )
      event.target.value = ""
      return
    }

    setLoading(true)

    try {
      for (const file of files) {
        const formDataImg = new FormData()
        formDataImg.append("image", file)
        formDataImg.append("category", category)

        const response = await fetch(`/api/services/${serviceId}/upload`, {
          method: "POST",
          body: formDataImg,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload image")
        }
      }

      showToast(`${files.length} file(s) uploaded successfully!`, "success")
      await refreshData()
    } catch (error) {
      console.error("Upload error:", error)
      showToast(`Upload failed: ${error.message}`, "error")
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  return (
    
    <div className="dashboard-container">
      <Loading loading={loading} />
      <Toast toast={toast} />

      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setOpenPaymentRowId={setOpenPaymentRowId}
        setOpenAdvanceId={setOpenAdvanceId}
      />

      <main className="dashboard-main">
        <h1 className="dashboard-title">{active}</h1>

        {active === "Dashboard" && (
          <>
            <DashboardStats
              customers={customers}
              setActive={setActive}
              setCustomerFilter={setCustomerFilter}
            />
            <DashboardCharts customers={customers} />
          </>
        )}

        {active === "Packages" && <Packages />}

      {active === "Quotation" && (
  <Quotation
    quotation={quotation}
    setQuotation={setQuotation}
    quotationPricing={quotationPricing}
    activeRequirementTab={activeRequirementTab}
    setActiveRequirementTab={setActiveRequirementTab}
    newEventName={newEventName}
    setNewEventName={setNewEventName}
    loading={loading}
    setLoading={setLoading}
    showToast={showToast}
    refreshCustomers={refreshData}   // ✅ ADD THIS
  />
)}


        {/* ✅ ADDED: Pricing List Section */}
        {active === "Pricing List" && (
         <PricingList
  quotationPricing={quotationPricing}
  setQuotationPricing={setQuotationPricing}
/>

        )}

        {active === "Gallery" && (
          <Gallery
            galleryMedia={galleryMedia}
            handleGalleryUpload={handleGalleryUpload}
            deleteGalleryMedia={deleteGalleryMedia}
            loading={loading}
          />
        )}

        {active === "Hero Section" && (
          <HeroSection
            heroImages={heroImages}
            heroFormData={heroFormData}
            setHeroFormData={setHeroFormData}
            selectedHeroImage={selectedHeroImage}
            heroPreviewUrl={heroPreviewUrl}
            handleHeroImageSelect={handleHeroImageSelect}
            handleUploadHeroImage={handleUploadHeroImage}
            handleDeleteHeroImage={handleDeleteHeroImage}
            toggleHeroActive={toggleHeroActive}
            loading={loading}
            showToast={showToast}
          />
        )}

        {active === "Services" && (
          <Services
            services={services}
            serviceInput={serviceInput}
            setServiceInput={setServiceInput}
            addService={addService}
            deleteService={deleteService}
            handleDirectUpload={handleDirectUpload}
            handleVideoUrlUpload={handleVideoUrlUpload}
            deleteServiceImage={deleteServiceImage}
            loading={loading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {active === "Home Services" && (
          <HomeServices
            homeServices={homeServices}
            setHomeServices={setHomeServices}
            loading={loading}
            setLoading={setLoading}
            showToast={showToast}
            refreshData={refreshData}
          />
        )}

        {active === "B2B Customer" && ( // Changed from "B2B Images" to "B2B Customer"
          <B2BCustomer
            // Removed b2bImages prop as we don't have B2B images anymore
            loading={loading}
            showToast={showToast}
            refreshData={refreshData}
          />
        )}

        {active === "Customer Details" && (
          <CustomerDetails
            customers={customers}
            customerFilter={customerFilter}
            setCustomerFilter={setCustomerFilter}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            selectedAdvanceCount={selectedAdvanceCount}
            setSelectedAdvanceCount={setSelectedAdvanceCount}
            openPaymentRowId={openPaymentRowId}
            setOpenPaymentRowId={setOpenPaymentRowId}
            openAdvanceId={openAdvanceId}
            setOpenAdvanceId={setOpenAdvanceId}
            handleTotalAmountChange={handleTotalAmountChange}
            handleAdvanceCountChange={handleAdvanceCountChange}
            updateAdvance={updateAdvance}
            handleSaveCustomer={handleSaveCustomer}
            handleEditCustomer={handleEditCustomer}
            handleDeleteCustomer={handleDeleteCustomer}
            handleDeleteAllCustomers={handleDeleteAllCustomers}
            loading={loading}
          />
        )}
      </main>
    </div>
  )
}