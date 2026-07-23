import { Request, Response, NextFunction } from 'express'
import { getUserById } from '../db-supabase'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        username: string
        role: string
      }
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: '未授权' })
  }

  try {
    const user = await getUserById(parseInt(token))
    if (!user) {
      return res.status(401).json({ message: '未授权' })
    }
    req.user = { id: user.id, username: user.username, role: user.role }
    next()
  } catch {
    return res.status(401).json({ message: '未授权' })
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' })
  }
  next()
}