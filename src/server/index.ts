import express from 'express'
import cors from 'cors'
import { supabase } from './supabase'
import authRoutes from './routes/auth'
import memberRoutes from './routes/members'
import transactionRoutes from './routes/transactions'
import flowRoutes from './routes/flows'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/flows', flowRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/diagnostics/users', async (_, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id, username, role, name')
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    res.json({ users: data, count: data?.length || 0 })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/diagnostics/flows', async (_, res) => {
  try {
    const { data, error } = await supabase.from('flows').select('*').order('created_at', { ascending: false })
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    res.json({ flows: data, count: data?.length || 0 })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

const startServer = async () => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error) {
      console.error('Supabase connection failed:', error.message)
      console.log('Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file')
      process.exit(1)
    }
    console.log('Supabase connection successful')
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()