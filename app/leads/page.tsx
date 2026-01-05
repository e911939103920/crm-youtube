'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Upload, X, Edit2, Trash2, Download, List } from 'lucide-react'
import { useStore, Lead } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { NotificationContainer } from '@/components/Notification'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import Papa from 'papaparse'

export default function LeadsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { leads, isAuthenticated, addLead, updateLead, deleteLead, undoDeleteLead, importLeads, fetchLeads, savedLists, fetchSavedLists, addSavedList, deleteSavedList } = useStore()
  const { notifications, success, error, dismissNotification } = useNotifications()
  const { loading: authLoading } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [showMapping, setShowMapping] = useState(false)
  const [isSavedListsOpen, setIsSavedListsOpen] = useState(false)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchLeads()
      fetchSavedLists()
    }
  }, [authLoading, isAuthenticated, fetchLeads, fetchSavedLists])

  if (authLoading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-sm text-[#666666] dark:text-[#999999]">Loading...</div>
      </div>
    )
  }

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true)
      setSelectedLead(null)
    }
    if (searchParams.get('upload') === 'true') {
      setIsUploadOpen(true)
    }
  }, [searchParams])

  if (!isAuthenticated) {
    return null
  }

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase()
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query)
    )
  })

  const handleSaveLead = async (leadData: Partial<Lead>) => {
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, leadData)
        success('Lead updated successfully')
      } else {
        await addLead({
          name: leadData.name || '',
          company: leadData.company || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          value: leadData.value || 0,
          stage: leadData.stage || 'New',
          tags: leadData.tags || [],
          notes: leadData.notes || '',
        })
        success('Lead created successfully')
      }
      setIsModalOpen(false)
      setSelectedLead(null)
    } catch (err) {
      error('Failed to save lead')
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      try {
        await deleteLead(leadId)
        success('Lead deleted. Undo?', 10000, async () => {
          try {
            await undoDeleteLead()
            success('Lead restored')
          } catch (err) {
            error('Failed to restore lead')
          }
        })
      } catch (err) {
        error('Failed to delete lead')
      }
    }
  }


  const handleFileSelect = (file: File) => {
    setUploadFile(file)
    setShowMapping(false)
    setColumnMapping({})
    setCsvHeaders([])
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 1,
      complete: (results) => {
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields)
          setShowMapping(true)
          // Auto-map common fields
          const autoMap: Record<string, string> = {}
          results.meta.fields.forEach((header: string) => {
            const lower = header.toLowerCase()
            if (lower.includes('name') && !lower.includes('company')) autoMap[header] = 'name'
            else if (lower.includes('company')) autoMap[header] = 'company'
            else if (lower.includes('email')) autoMap[header] = 'email'
            else if (lower.includes('phone')) autoMap[header] = 'phone'
            else if (lower.includes('value') || lower.includes('amount')) autoMap[header] = 'value'
            else if (lower.includes('stage') || lower.includes('status')) autoMap[header] = 'stage'
            else if (lower.includes('tag')) autoMap[header] = 'tags'
            else if (lower.includes('note')) autoMap[header] = 'notes'
          })
          setColumnMapping(autoMap)
        }
      },
    })
  }

  const handleCSVImport = async () => {
    if (!uploadFile) return

    setUploadProgress(0)
    Papa.parse(uploadFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const importedLeads = results.data
            .map((row: any) => {
              const mapped: any = {}
              Object.entries(columnMapping).forEach(([csvHeader, field]) => {
                if (field && row[csvHeader] !== undefined) {
                  if (field === 'tags') {
                    mapped[field] = String(row[csvHeader]).split(',').map((t: string) => t.trim()).filter(Boolean)
                  } else if (field === 'value') {
                    mapped[field] = parseFloat(String(row[csvHeader])) || 0
                  } else {
                    mapped[field] = String(row[csvHeader])
                  }
                }
              })
              
              // Ensure required fields
              if (!mapped.name || !mapped.email) return null
              
              const lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'user_id'> = {
                name: mapped.name || '',
                company: mapped.company || '',
                email: mapped.email || '',
                value: mapped.value || 0,
                stage: mapped.stage || 'New',
                tags: mapped.tags || [],
              }
              
              // Add optional fields only if they have values
              if (mapped.phone) lead.phone = mapped.phone
              if (mapped.notes) lead.notes = mapped.notes
              
              return lead
            })
            .filter((lead): lead is Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'user_id'> => lead !== null)

          await importLeads(importedLeads)
          setUploadProgress(100)
          setTimeout(() => {
            success(`Successfully imported ${importedLeads.length} leads`)
            setIsUploadOpen(false)
            setUploadFile(null)
            setUploadProgress(0)
            setShowMapping(false)
            setColumnMapping({})
            setCsvHeaders([])
          }, 500)
        } catch (err) {
          error('Failed to import leads')
        }
      },
      error: (error) => {
        error('Failed to read CSV file')
      },
    })
  }

  const exportCSV = () => {
    const csv = Papa.unparse(leads)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads-export.csv'
    a.click()
    success('Leads exported successfully')
  }

  return (
    <div className="min-h-screen pt-14 bg-white dark:bg-[#0A0A0A]">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Leads</h1>
            <p className="text-sm text-[#666666] dark:text-[#999999]">Manage your leads and contacts</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setIsSavedListsOpen(true)}
              className="btn-secondary px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Saved Lists</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={exportCSV}
              className="btn-secondary px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setIsUploadOpen(true)}
              className="btn-secondary px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setSelectedLead(null)
                setIsModalOpen(true)
              }}
              className="btn-primary px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" />
              New Lead
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
        </div>

        {/* Leads Table - Desktop */}
        <div className="hidden md:block card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
                  <th className="text-left p-4 text-sm font-medium text-[#666666] dark:text-[#999999]">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-[#666666] dark:text-[#999999]">Company</th>
                  <th className="text-left p-4 text-sm font-medium text-[#666666] dark:text-[#999999]">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-[#666666] dark:text-[#999999]">Stage</th>
                  <th className="text-left p-4 text-sm font-medium text-[#666666] dark:text-[#999999]">Value</th>
                  <th className="text-right p-4 text-sm font-medium text-[#666666] dark:text-[#999999]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#E5E5E5] dark:border-[#2A2A2A] hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">{lead.name}</div>
                          {lead.phone && (
                            <div className="text-xs text-[#666666] dark:text-[#999999]">{lead.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#0A0A0A] dark:text-[#FAFAFA]">{lead.company}</td>
                    <td className="p-4 text-sm text-[#666666] dark:text-[#999999]">{lead.email}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999]">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
                      ${lead.value.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead)
                            setIsModalOpen(true)
                          }}
                          className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-sm text-[#666666] dark:text-[#999999]">
                {searchQuery ? 'No leads found' : 'No leads yet. Add your first lead to get started!'}
              </div>
            )}
          </div>
        </div>

        {/* Leads Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-sm font-medium flex-shrink-0">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA] truncate">{lead.name}</div>
                    <div className="text-xs text-[#666666] dark:text-[#999999] truncate">{lead.company}</div>
                    {lead.phone && (
                      <div className="text-xs text-[#666666] dark:text-[#999999]">{lead.phone}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedLead(lead)
                      setIsModalOpen(true)
                    }}
                    className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] dark:border-[#2A2A2A]">
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-[#666666] dark:text-[#999999]">Email</div>
                  <div className="text-xs text-[#0A0A0A] dark:text-[#FAFAFA] truncate">{lead.email}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-[#666666] dark:text-[#999999]">Value</div>
                  <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
                    ${lead.value.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs px-2 py-1 bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999]">
                  {lead.stage}
                </span>
              </div>
            </motion.div>
          ))}
          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-sm text-[#666666] dark:text-[#999999]">
              {searchQuery ? 'No leads found' : 'No leads yet. Add your first lead to get started!'}
            </div>
          )}
        </div>
      </div>

      {/* Lead Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <LeadModal
            lead={selectedLead}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedLead(null)
            }}
            onSave={handleSaveLead}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            file={uploadFile}
            progress={uploadProgress}
            csvHeaders={csvHeaders}
            columnMapping={columnMapping}
            showMapping={showMapping}
            onFileSelect={handleFileSelect}
            onMappingChange={setColumnMapping}
            onImport={handleCSVImport}
            onClose={() => {
              setIsUploadOpen(false)
              setUploadFile(null)
              setUploadProgress(0)
              setShowMapping(false)
              setColumnMapping({})
              setCsvHeaders([])
            }}
          />
        )}
      </AnimatePresence>

      {/* Saved Lists Modal */}
      <AnimatePresence>
        {isSavedListsOpen && (
          <SavedListsModal
            savedLists={savedLists}
            leads={leads}
            onClose={() => setIsSavedListsOpen(false)}
            onCreateList={async (name, description, leadIds) => {
              try {
                await addSavedList({ name, description, lead_ids: leadIds })
                success('List created successfully')
                setIsSavedListsOpen(false)
              } catch (err) {
                error('Failed to create list')
              }
            }}
            onDeleteList={async (id) => {
              if (confirm('Are you sure you want to delete this list? This will not delete the leads inside.')) {
                try {
                  await deleteSavedList(id)
                  success('List deleted successfully')
                } catch (err) {
                  error('Failed to delete list')
                }
              }
            }}
            onViewList={(leadIds) => {
              setSelectedLeadIds(leadIds)
              setIsSavedListsOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}

function LeadModal({
  lead,
  onClose,
  onSave,
}: {
  lead: Lead | null
  onClose: () => void
  onSave: (data: Partial<Lead>) => void
}) {
  const { pipelines } = useStore()
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    value: lead?.value || 0,
    stage: lead?.stage || 'New',
    tags: lead?.tags?.join(', ') || '',
    notes: lead?.notes || '',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md h-full overflow-y-auto"
      >
        <div className="sticky top-0 card border-b border-[#E5E5E5] dark:border-[#2A2A2A] p-4 sm:p-6 flex items-center justify-between bg-white dark:bg-[#0F0F0F]">
          <h3 className="text-base sm:text-lg font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
            {lead ? 'Edit Lead' : 'New Lead'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Company *</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Deal Value</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.title}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="hot, enterprise, follow-up"
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                onSave({
                  ...formData,
                  tags: formData.tags
                    ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
                })
              }}
              className="flex-1 py-2.5 btn-primary"
            >
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onClose}
              className="flex-1 py-2.5 btn-secondary"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SavedListsModal({
  savedLists,
  leads,
  onClose,
  onCreateList,
  onDeleteList,
  onViewList,
}: {
  savedLists: any[]
  leads: Lead[]
  onClose: () => void
  onCreateList: (name: string, description: string, leadIds: string[]) => Promise<void>
  onDeleteList: (id: string) => Promise<void>
  onViewList: (leadIds: string[]) => void
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [listName, setListName] = useState('')
  const [listDescription, setListDescription] = useState('')
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])

  const handleCreate = async () => {
    if (!listName.trim()) return
    await onCreateList(listName, listDescription, selectedLeadIds)
    setIsCreating(false)
    setListName('')
    setListDescription('')
    setSelectedLeadIds([])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md h-full overflow-y-auto"
      >
        <div className="sticky top-0 card border-b border-[#E5E5E5] dark:border-[#2A2A2A] p-4 sm:p-6 flex items-center justify-between bg-white dark:bg-[#0F0F0F]">
          <h3 className="text-base sm:text-lg font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">Saved Lists</h3>
          <div className="flex items-center gap-2">
            {!isCreating && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsCreating(true)}
                className="btn-primary px-3 py-1.5 text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                New List
              </motion.button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {isCreating ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">List Name *</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="e.g., High-value clients"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Description</label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Select Leads</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {leads.map((lead) => (
                    <label key={lead.id} className="flex items-center gap-2 p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadIds([...selectedLeadIds, lead.id])
                          } else {
                            setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id))
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[#0A0A0A] dark:text-[#FAFAFA]">{lead.name} - {lead.company}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCreate}
                  disabled={!listName.trim()}
                  className="flex-1 py-2.5 btn-primary disabled:opacity-50"
                >
                  Create List
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setIsCreating(false)
                    setListName('')
                    setListDescription('')
                    setSelectedLeadIds([])
                  }}
                  className="flex-1 py-2.5 btn-secondary"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {savedLists.map((list) => {
                const listLeads = leads.filter(l => list.lead_ids.includes(l.id))
                return (
                  <div key={list.id} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">{list.name}</h4>
                        {list.description && (
                          <p className="text-xs text-[#666666] dark:text-[#999999] mt-1">{list.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteList(list.id)}
                        className="p-1.5 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#666666] dark:text-[#999999]">{listLeads.length} leads</span>
                      <button
                        onClick={() => onViewList(list.lead_ids)}
                        className="text-xs text-black dark:text-white hover:underline"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                )
              })}
              {savedLists.length === 0 && (
                <div className="text-center py-12 text-sm text-[#666666] dark:text-[#999999]">
                  No saved lists yet. Create your first list!
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function UploadModal({
  file,
  progress,
  csvHeaders,
  columnMapping,
  showMapping,
  onFileSelect,
  onMappingChange,
  onImport,
  onClose,
}: {
  file: File | null
  progress: number
  csvHeaders: string[]
  columnMapping: Record<string, string>
  showMapping: boolean
  onFileSelect: (file: File) => void
  onMappingChange: (mapping: Record<string, string>) => void
  onImport: () => void
  onClose: () => void
}) {
  const fieldOptions = [
    { value: '', label: 'Ignore' },
    { value: 'name', label: 'Name' },
    { value: 'company', label: 'Company' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'value', label: 'Value' },
    { value: 'stage', label: 'Stage' },
    { value: 'tags', label: 'Tags' },
    { value: 'notes', label: 'Notes' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const updateMapping = (csvHeader: string, field: string) => {
    const newMapping = { ...columnMapping }
    if (field) {
      newMapping[csvHeader] = field
    } else {
      delete newMapping[csvHeader]
    }
    onMappingChange(newMapping)
  }

  const requiredFieldsMapped = columnMapping['name'] && columnMapping['email']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">Import Leads CSV</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {!showMapping ? (
            <div
              className={`border-2 border-dashed p-8 text-center transition-all ${
                file
                  ? 'border-black dark:border-white bg-[#FAFAFA] dark:bg-[#141414]'
                  : 'border-[#E5E5E5] dark:border-[#2A2A2A]'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-[#999999]" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer text-sm text-[#666666] dark:text-[#999999] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] transition-colors"
              >
                {file ? file.name : 'Click to select CSV file or drag and drop'}
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-[#666666] dark:text-[#999999]">
                Map your CSV columns to GlassCRM fields. At minimum, map <strong>Name</strong> and <strong>Email</strong>.
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-4 p-3 card">
                    <div className="flex-1 text-sm text-[#0A0A0A] dark:text-[#FAFAFA]">{header}</div>
                    <div className="text-sm text-[#999999]">→</div>
                    <select
                      value={columnMapping[header] || ''}
                      onChange={(e) => updateMapping(header, e.target.value)}
                      className="flex-1 px-3 py-2 card text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    >
                      {fieldOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {!requiredFieldsMapped && (
                <div className="text-sm text-red-500">
                  Please map at least Name and Email fields before continuing.
                </div>
              )}
            </div>
          )}

          {progress > 0 && progress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-[#666666] dark:text-[#999999]">
                <span>Importing...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#E5E5E5] dark:bg-[#2A2A2A] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-black dark:bg-white"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {showMapping ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onImport}
                disabled={!requiredFieldsMapped || progress > 0}
                className="flex-1 py-2.5 btn-primary disabled:opacity-50"
              >
                Import Leads
              </motion.button>
            ) : null}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onClose}
              className="flex-1 py-2.5 btn-secondary"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
