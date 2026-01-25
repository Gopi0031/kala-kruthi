'use client'
import React, { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function DashboardStats({ customers, setActive, setCustomerFilter }) {
  const barChartRef = useRef(null)
  const donutChartRef = useRef(null)
  const barChartInstance = useRef(null)
  const donutChartInstance = useRef(null)

  const calculateDashboardTotals = () => {
    let totalRevenue = 0
    let totalPaid = 0
    let totalDue = 0
    customers.forEach((customer) => {
      totalRevenue += parseInt(customer.totalAmount) || 0
      const paidFromAdvances = (customer.advances || []).reduce(
        (sum, adv) => sum + (parseInt(adv.amount) || 0),
        0
      )
      totalPaid += paidFromAdvances
      totalDue += parseInt(customer.dueAmount) || 0
    })
    return {
      totalRevenue,
      totalPaid,
      totalDue,
      totalRevenueFormatted: totalRevenue.toLocaleString("en-IN"),
      totalPaidFormatted: totalPaid.toLocaleString("en-IN"),
      totalDueFormatted: totalDue.toLocaleString("en-IN"),
    }
  }

  const dashboardTotals = calculateDashboardTotals()

  // Bar Chart - Clean & Simple
  useEffect(() => {
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext('2d')
      
      if (barChartInstance.current) {
        barChartInstance.current.destroy()
      }

      const isMobile = window.innerWidth < 640

      barChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Total Revenue', 'Collected', 'Pending'],
          datasets: [{
            data: [dashboardTotals.totalRevenue, dashboardTotals.totalPaid, dashboardTotals.totalDue],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderRadius: isMobile ? 4 : 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1f2937',
              titleColor: 'white',
              bodyColor: 'white',
              cornerRadius: 8,
              padding: isMobile ? 8 : 12,
              titleFont: { size: isMobile ? 11 : 13 },
              bodyFont: { size: isMobile ? 10 : 12 },
              callbacks: {
                label: context => `₹${context.parsed.y.toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => isMobile ? `₹${(value/1000)}K` : `₹${(value/1000).toLocaleString()}K`,
                color: '#6b7280',
                font: { size: isMobile ? 9 : 11 }
              },
              grid: { color: '#f3f4f6' }
            },
            x: {
              ticks: { 
                color: '#374151', 
                font: { weight: '600', size: isMobile ? 9 : 11 },
                maxRotation: 0,
                minRotation: 0
              },
              grid: { display: false }
            }
          }
        }
      })
    }

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy()
      }
    }
  }, [dashboardTotals])

  // Donut Chart - Clean & Simple
  useEffect(() => {
    if (donutChartRef.current) {
      const ctx = donutChartRef.current.getContext('2d')
      
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy()
      }

      const isMobile = window.innerWidth < 640

      donutChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Collected', 'Pending'],
          datasets: [{
            data: [dashboardTotals.totalPaid, dashboardTotals.totalDue],
            backgroundColor: ['#10b981', '#f59e0b'],
            borderWidth: 0,
            cutout: isMobile ? '60%' : '65%'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: isMobile ? 12 : 20,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { size: isMobile ? 10 : 12, weight: '600' }
              }
            },
            tooltip: {
              backgroundColor: '#1f2937',
              titleColor: 'white',
              bodyColor: 'white',
              cornerRadius: 8,
              padding: isMobile ? 8 : 12,
              titleFont: { size: isMobile ? 11 : 13 },
              bodyFont: { size: isMobile ? 10 : 12 },
              callbacks: {
                label: context => `₹${context.parsed.toLocaleString('en-IN')}`
              }
            }
          }
        }
      })
    }

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy()
      }
    }
  }, [dashboardTotals])

  return (
    <>
      <style>{`
        /* Stats Grid - Responsive */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        /* Tablet: Stats Grid - 2 columns */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }

        /* Mobile: Stats Grid - 1 column */
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          
          .stat-card {
            padding: 12px !important;
          }
          
          .stat-card .icon {
            font-size: 20px !important;
          }
          
          .stat-card .title {
            font-size: 10px !important;
          }
          
          .stat-card .value {
            font-size: 18px !important;
          }
        }

        /* Charts Grid - Responsive */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        /* Tablet & Mobile: Charts Stack vertically */
        @media (max-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        @media (max-width: 640px) {
          .charts-grid {
            gap: 12px !important;
          }
          
          .chart-card {
            padding: 14px !important;
          }
          
          .chart-card h3 {
            font-size: 14px !important;
          }
          
          .chart-card .icon {
            font-size: 18px !important;
          }
          
          .chart-container {
            height: 220px !important;
          }
        }

        /* Ensure canvas sizing */
        .chart-container canvas {
          max-width: 100%;
          height: auto !important;
        }
      `}</style>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="👥"
          title="Total Customers"
          value={customers.length}
          color="#3b82f6"
          onClick={() => {
            setActive("Customer Details")
            setCustomerFilter("All")
          }}
        />
        <StatCard
          icon="⏳"
          title="Pending"
          value={customers.filter((c) => c.status === "Pending").length}
          color="#f59e0b"
          onClick={() => {
            setActive("Customer Details")
            setCustomerFilter("Pending")
          }}
        />
        <StatCard
          icon="✅"
          title="Completed"
          value={customers.filter((c) => c.status === "Paid").length}
          color="#10b981"
          onClick={() => {
            setActive("Customer Details")
            setCustomerFilter("Paid")
          }}
        />
        <StatCard
          icon="⚡"
          title="Quick Access"
          value="Manage All"
          color="#8b5cf6"
          valueSize="16px"
          onClick={() => {
            setActive("Customer Details")
            setCustomerFilter("All")
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Bar Chart Card */}
        <div className="chart-card" style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          height: "340px"
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div className="icon" style={{ fontSize: '20px' }}>📈</div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937'
            }}>Revenue Breakdown</h3>
          </div>
          <div className="chart-container" style={{ height: '280px', position: 'relative' }}>
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="chart-card" style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          height: "340px"
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div className="icon" style={{ fontSize: '20px' }}>🍩</div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937'
            }}>Payment Status</h3>
          </div>
          <div className="chart-container" style={{ height: '280px', position: 'relative' }}>
            <canvas ref={donutChartRef}></canvas>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ icon, title, value, color, onClick, valueSize = "28px" }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.3s",
        borderLeft: `4px solid ${color}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 16px ${color}33`
        e.currentTarget.style.transform = "translateY(-4px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <div className="icon" style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <p className="title" style={{
        color: "#6b7280",
        fontSize: "11px",
        fontWeight: "600",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
        {title}
      </p>
      <h3 className="value" style={{
        fontSize: valueSize,
        fontWeight: "800",
        color: "#1f2937",
        margin: 0,
      }}>
        {value}
      </h3>
    </div>
  )
}
