'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface LogoProps {
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ href = '/', className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`font-medium text-[#0A0A0A] dark:text-[#FAFAFA] ${sizeClasses[size]} ${className}`}
    >
      GlassCRM
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}
