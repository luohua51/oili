import { Router } from 'express'
import { getUserById, getAllTransactions, createTransaction, createFlow, updateUser } from '../db-supabase'
import { authenticate } from '../middleware/auth'
import { supabase } from '../supabase'

const router = Router()

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.role === 'admin' ? (req.query.userId ? parseInt(req.query.userId as string) : undefined) : req.user?.id
    const transactions = await getAllTransactions(userId)
    
    let flowTransactions: any[] = []
    if (userId) {
      const { data: flows, error: flowsError } = await supabase
        .from('flows')
        .select('*')
        .eq('from_user_id', userId)
        .is('to_user_id', null)
        .order('created_at', { ascending: false })
      
      if (!flowsError && flows) {
        flowTransactions = flows.map(flow => ({
          id: `flow_${flow.id}`,
          user_id: flow.from_user_id,
          amount: flow.amount,
          description: flow.description || '划账扣除',
          created_at: flow.created_at,
          type: 'flow',
        }))
      }
    }
    
    const allTransactions = [...transactions, ...flowTransactions].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    res.json(allTransactions)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, description } = req.body
    const userId = req.user?.id

    const user = await getUserById(userId!)
    if (!user || user.balance < amount) {
      return res.status(400).json({ message: '余额不足' })
    }

    const updatedUser = await updateUser(userId!, { balance: user.balance - amount })
    if (!updatedUser) {
      return res.status(500).json({ message: '操作失败' })
    }

    const transaction = await createTransaction({
      user_id: userId!,
      amount,
      description: description || '消费',
    })

    await createFlow({
      from_user_id: userId!,
      to_user_id: null,
      amount,
      type: 'consume',
      description: description || '消费',
    })

    res.status(201).json(transaction)
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router