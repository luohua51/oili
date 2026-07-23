import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getUserByUsername, getUserById, createUser } from '../db-supabase'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    console.log(`Login attempt: username=${username}, password_length=${password?.length || 0}`)

    if (!username || !password) {
      console.log('Login failed: username or password empty')
      return res.status(400).json({ message: '用户名和密码不能为空' })
    }

    const user = await getUserByUsername(username)

    console.log(`User lookup result: ${user ? `found (id=${user.id}, role=${user.role})` : 'not found'}`)

    if (!user) {
      return res.status(401).json({ message: '用户不存在，请先注册' })
    }

    console.log(`Password hash exists: ${!!user.password}, hash_length=${user.password?.length || 0}`)
    
    let isPasswordValid = false
    try {
      isPasswordValid = await bcrypt.compare(password, user.password)
      console.log(`Password comparison result: ${isPasswordValid}`)
    } catch (compareError) {
      console.error('Password compare error:', compareError)
      return res.status(500).json({ message: '密码验证失败，请联系管理员' })
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: '密码错误，请重试' })
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        email: user.email,
        balance: user.balance,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token: user.id.toString(),
    })
  } catch (error: any) {
    console.error('Login error:', error)
    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      return res.status(503).json({ message: '网络连接超时，请稍后重试' })
    }
    res.status(500).json({ message: '服务器内部错误，请稍后重试' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { username, password, name, phone, email } = req.body

    if (!username || !password || !name) {
      return res.status(400).json({ message: '用户名、密码和姓名不能为空' })
    }

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

    res.status(201).json({
      user,
      token: user.id.toString(),
    })
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: '未授权' })
    }

    const user = await getUserById(parseInt(token))

    if (!user) {
      return res.status(401).json({ message: '未授权' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router