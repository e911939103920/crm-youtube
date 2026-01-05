'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useStore, Lead } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { NotificationContainer } from '@/components/Notification'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'

export default function PipelinePage() {
  const router = useRouter()
  const { leads, pipelines, isAuthenticated, moveLeadToStage, updateLead, fetchLeads, fetchPipelines } = useStore()
  const { notifications, success, dismissNotification } = useNotifications()
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
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

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStage = destination.droppableId

    try {
      await moveLeadToStage(draggableId, newStage)
      success('Lead moved successfully')
    } catch (err) {
      console.error('Error moving lead:', err)
    }
  }

  const getLeadsForStage = (stageTitle: string) => {
    return leads.filter((lead) => lead.stage === stageTitle)
  }

  const getStageValue = (stageTitle: string) => {
    return getLeadsForStage(stageTitle).reduce((sum, lead) => sum + lead.value, 0)
  }

  return (
    <div className="min-h-screen pt-14 bg-white dark:bg-[#0A0A0A]">
      <Navbar />
      
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Pipeline</h1>
            <p className="text-sm text-[#666666] dark:text-[#999999]">Manage your sales pipeline with drag and drop</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push('/leads?new=true')}
            className="btn-primary px-4 py-2 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </motion.button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            {pipelines.sort((a, b) => a.order_index - b.order_index).map((pipeline) => {
              const stageLeads = getLeadsForStage(pipeline.title)
              const stageValue = getStageValue(pipeline.title)

              return (
                <div key={pipeline.id} className="flex-shrink-0 w-[280px] sm:w-80">
                  <div className="card p-3 sm:p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm sm:text-base text-[#0A0A0A] dark:text-[#FAFAFA]">{pipeline.title}</h3>
                      <span className="text-xs text-[#666666] dark:text-[#999999] bg-[#FAFAFA] dark:bg-[#141414] px-2 py-1">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="text-xs text-[#666666] dark:text-[#999999]">
                      ${stageValue.toLocaleString()}
                    </div>
                  </div>

                  <Droppable droppableId={pipeline.title}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[300px] sm:min-h-[400px] space-y-2 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-[#FAFAFA] dark:bg-[#141414] p-2' : ''
                        }`}
                      >
                        {stageLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  y: 0,
                                  scale: snapshot.isDragging ? 1.05 : 1,
                                }}
                                whileHover={{ scale: 1.01, y: -1 }}
                                className="card p-3 sm:p-4 cursor-grab active:cursor-grabbing border-l-2 border-black dark:border-white"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-xs sm:text-sm mb-1 text-[#0A0A0A] dark:text-[#FAFAFA] truncate">{lead.name}</div>
                                    <div className="text-xs text-[#666666] dark:text-[#999999] truncate">{lead.company}</div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingLead(lead)
                                    }}
                                    className="opacity-50 hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
                                    ${lead.value.toLocaleString()}
                                  </div>
                                  {lead.tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {lead.tags.slice(0, 2).map((tag, i) => (
                                        <span
                                          key={i}
                                          className="text-xs px-2 py-0.5 bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999]"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {stageLeads.length === 0 && (
                          <div className="text-center py-12 text-sm text-[#999999] dark:text-[#666666]">
                            Drop leads here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Edit Lead Modal */}
      <AnimatePresence>
        {editingLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
            onClick={() => setEditingLead(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-8 w-full max-w-md"
            >
              <h3 className="text-lg font-medium mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Edit Lead</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Name</label>
                  <input
                    type="text"
                    value={editingLead.name}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Company</label>
                  <input
                    type="text"
                    value={editingLead.company}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, company: e.target.value })
                    }
                    className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Value</label>
                  <input
                    type="number"
                    value={editingLead.value}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, value: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={async () => {
                      try {
                        await updateLead(editingLead.id, editingLead)
                        setEditingLead(null)
                        success('Lead updated')
                      } catch (err) {
                        console.error('Error updating lead:', err)
                      }
                    }}
                    className="flex-1 py-2.5 btn-primary"
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setEditingLead(null)}
                    className="flex-1 py-2.5 btn-secondary"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}
