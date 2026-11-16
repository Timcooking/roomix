import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function RadarEmpty({ avatar, title, sub, action }: { avatar: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="radar-empty">
      <div className="radar">
        <span />
        <span />
        <span />
        <motion.div
          className="radar-avatar"
          style={{ backgroundImage: `url("${avatar}")` }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        />
      </div>
      <h3>{title}</h3>
      {sub && <p>{sub}</p>}
      {action}
    </div>
  )
}
