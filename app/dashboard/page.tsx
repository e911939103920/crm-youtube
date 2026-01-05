'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Target, Plus, Upload, Workflow } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { NotificationContainer } from '@/components/Notification'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE']

export default function DashboardPage() {
  const router = useRouter()
  const { leads, pipelines, isAuthenticated, fetchLeads, fetchPipelines } = useStore()
  const { notifications, dismissNotification } = useNotifications()
  const { theme } = useTheme()
  const { loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchLeads()
      fetchPipelines()
    }
  }, [authLoading, isAuthenticated, fetchLeads, fetchPipelines])

  if (authLoading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-sm text-[#666666] dark:text-[#999999]">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  // Calculate KPIs
  const totalLeads = leads.length
  const convertedLeads = leads.filter((l) => l.stage === 'Won').length
  const lostLeads = leads.filter((l) => l.stage === 'Lost').length
  const pipelineValue = leads.reduce((sum, lead) => sum + lead.value, 0)

  // Pipeline distribution data
  const pipelineData = pipelines.map((pipeline) => ({
    name: pipeline.title,
    value: leads.filter((l) => l.stage === pipeline.title).length,
  })).filter(p => p.value > 0)

  // Conversion over time (mock data for now)
  const conversionData = [
    { month: 'Jan', converted: 12, lost: 3 },
    { month: 'Feb', converted: 19, lost: 5 },
    { month: 'Mar', converted: 15, lost: 4 },
    { month: 'Apr', converted: 22, lost: 6 },
    { month: 'May', converted: 18, lost: 4 },
    { month: 'Jun', converted: 25, lost: 7 },
  ]

  const kpiCards = [
    { label: 'Total Leads', value: totalLeads, icon: Users },
    { label: 'Converted', value: convertedLeads, icon: Target },
    { label: 'Lost', value: lostLeads, icon: TrendingUp },
    { label: 'Pipeline Value', value: `$${pipelineValue.toLocaleString()}`, icon: DollarSign },
  ]

  return (
    <div className="min-h-screen pt-14">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-xl sm:text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Dashboard</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">Overview of your sales performance</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8 lg:mb-12 flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push('/leads?new=true')}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push('/leads?upload=true')}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push('/pipeline')}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
          >
            <Workflow className="w-4 h-4" />
            View Pipeline
          </motion.button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8 lg:mb-12">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
                </div>
                <div className="text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">{kpi.value}</div>
                <div className="text-sm text-[#666666] dark:text-[#999999]">{kpi.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-12">
          {/* Pipeline Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-4 sm:p-6 lg:p-8"
          >
            <h3 className="text-base font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Pipeline Distribution</h3>
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => {
                    const colors = ['#000000', '#666666', '#999999', '#CCCCCC', '#E5E5E5']
                    const darkColors = ['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333']
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={theme === 'dark' 
                          ? darkColors[index % darkColors.length] 
                          : colors[index % colors.length]} 
                      />
                    )
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Conversion Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-4 sm:p-6 lg:p-8"
          >
            <h3 className="text-base font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Conversion Over Time</h3>
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="converted"
                  stroke={theme === 'dark' ? '#FFFFFF' : '#000000'}
                  strokeWidth={2}
                  name="Converted"
                />
                <Line
                  type="monotone"
                  dataKey="lost"
                  stroke={theme === 'dark' ? '#999999' : '#666666'}
                  strokeWidth={2}
                  name="Lost"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-4 sm:p-6 lg:p-8"
        >
          <h3 className="text-base font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Recent Leads</h3>
          <div className="space-y-0">
            {leads.slice(0, 5).map((lead, index) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 border-b border-[#E5E5E5] dark:border-[#2A2A2A] last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">{lead.name}</div>
                    <div className="text-xs text-[#666666] dark:text-[#999999]">{lead.company}</div>
                  </div>
                </div>
                <div className="text-sm text-[#666666] dark:text-[#999999]">${lead.value.toLocaleString()}</div>
              </div>
            ))}
            {leads.length === 0 && (
              <div className="text-center py-12 text-sm text-[#666666] dark:text-[#999999]">
                No leads yet. Add your first lead to get started!
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}
