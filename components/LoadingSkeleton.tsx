'use client'

import { motion } from 'framer-motion'

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-6"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/10 dark:bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 dark:bg-white/10 rounded w-1/2"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-white/10 dark:bg-white/10 rounded w-2/3"></div>
        <div className="h-3 bg-white/10 dark:bg-white/10 rounded w-1/2"></div>
        <div className="h-3 bg-white/10 dark:bg-white/10 rounded w-1/3"></div>
      </div>
    </div>
  )
}
