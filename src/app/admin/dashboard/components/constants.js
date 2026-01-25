export const SERVICE_TO_CAMERA_MAP = {
  "Traditional Photography": "Photo Camera",
  "Traditional Videography": "Video Camera",
  "Candid Photography": "Candid Photo",
  "Candid Videography": "Candid Video",
}

export const SERVICES_BY_EVENT = {
  "Birthday": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  "Mature Function": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  "PrePost Wedding": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  "Engagement": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  "Marriage": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  "Reception": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  "Vratham": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  "Formalties": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
  ],
  // ⭐⭐⭐ CRITICAL: ADD THIS "Other" CATEGORY FOR CUSTOM EVENTS ⭐⭐⭐
  "Other": [
    { name: "Traditional Photography", amount: 15000 },
    { name: "Traditional Videography", amount: 15000 },
    { name: "Candid Photography", amount: 12000 },
    { name: "Candid Videography", amount: 12000 },
    { name: "Drone", amount: 8000 },
    { name: "Live Streaming", amount: 10000 },
    { name: "LED Walls", amount: 20000 },
    // You can add more default services here
  ]
}

export const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0"
  return parseInt(amount).toLocaleString("en-IN")
}