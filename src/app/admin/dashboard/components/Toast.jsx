'use client'
import React from 'react'

export default function Toast({ toast }) {
  if (!toast.show) return null
  
  return (
    <div className={`dashboard-toast toast-${toast.type}`}>
      {toast.message}
    </div>
  )
}
