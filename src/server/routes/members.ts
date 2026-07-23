import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getAllMembers, getUserById, getUserByUsername, createUser, updateUser, deleteUser } from '../db-supabase'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, requireAdmin, async (_req, res) => {
  try {
    const members = await getAllMembers()
    res.json(members)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const user = await getUserById(parseInt(id))

    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    if (req.user?.role !== 'admin' && req.user?.id !== parseInt(id)) {
      return res.status(403).json({ message: '权限不足' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, phone, email } = req.body

    const exists = await getUserByUsername(username)
    if (exists) {
      return res.status(400).json({ message: '用户名已存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await createUser({
      username,
      password: hashedPassword,
      name,
      phone: phone || '',
      email: email || '',
      balance: 0.00,
      role: 'member',
    })

    if (!user) {
      return res.status(500).json({ message: '创建用户失败' })
    }

    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, email } = req.body

    const user = await updateUser(parseInt(id), {
      name,
      phone: phone || '',
      email: email || '',
    })

    if (!user) {
      return res.status(500).json({ message: '更新用户失败' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const success = await deleteUser(parseInt(id))
    if (success) {
      res.json({ message: '删除成功' })
    } else {
      res.status(500).json({ message: '删除失败' })
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router