'use client'
import React from 'react'

export default function Loading({ loading }) {
  if (!loading) return null
  
  return <div className="dashboard-loading">Processing...</div>
}
