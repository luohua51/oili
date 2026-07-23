import { Router } from 'express'
import { getUserById, getAllFlows, createFlow, updateUser } from '../db-supabase'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, requireAdmin, async (_req, res) => {
  try {
    const flows = await getAllFlows()
    res.json(flows)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/recharge', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, amount, description } = req.body

    const user = await getUserById(userId)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    const updatedUser = await updateUser(userId, { balance: user.balance + amount })
    if (!updatedUser) {
      return res.status(500).json({ message: '操作失败' })
    }

    const flow = await createFlow({
      from_user_id: null,
      to_user_id: userId,
      amount,
      type: 'recharge',
      description: description || '充值',
    })

    res.status(201).json(flow)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/transfer', authenticate, requireAdmin, async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description } = req.body

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '转出和转入会员不能相同' })
    }

    const fromUser = await getUserById(fromUserId)
    if (!fromUser || fromUser.balance < amount) {
      return res.status(400).json({ message: '转出会员余额不足' })
    }

    const toUser = await getUserById(toUserId)
    if (!toUser) {
      return res.status(404).json({ message: '转入会员不存在' })
    }

    const updatedFromUser = await updateUser(fromUserId, { balance: fromUser.balance - amount })
    const updatedToUser = await updateUser(toUserId, { balance: toUser.balance + amount })

    if (!updatedFromUser || !updatedToUser) {
      return res.status(500).json({ message: '操作失败' })
    }

    const flow = await createFlow({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
      type: 'transfer',
      description: description || '划账',
    })

    res.status(201).json(flow)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/deduct', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, amount, description } = req.body

    const user = await getUserById(userId)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: '会员余额不足' })
    }

    const updatedUser = await updateUser(userId, { balance: user.balance - amount })
    if (!updatedUser) {
      return res.status(500).json({ message: '操作失败' })
    }

    const flow = await createFlow({
      from_user_id: userId,
      to_user_id: null,
      amount,
      type: 'transfer',
      description: description || '划账扣除',
    })

    res.status(201).json(flow)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router