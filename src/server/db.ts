import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new Database('./database.sqlite')

db.pragma('journal_mode = WAL')

export const dbRun = (sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } => {
  const stmt = db.prepare(sql)
  const info = stmt.run(...params)
  return { lastInsertRowid: info.lastInsertRowid as number, changes: info.changes as number }
}

export const dbGet = <T>(sql: string, params: any[] = []): T | undefined => {
  const stmt = db.prepare(sql)
  return stmt.get(...params) as T | undefined
}

export const dbAll = <T>(sql: string, params: any[] = []): T[] => {
  const stmt = db.prepare(sql)
  return stmt.all(...params) as T[]
}

export const initDatabase = async () => {
  dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(100),
      balance DECIMAL(10,2) DEFAULT 0.00,
      role VARCHAR(20) DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  try {
    dbRun('ALTER TABLE users ADD COLUMN email VARCHAR(100)')
  } catch {
  }

  dbRun(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  dbRun(`
    CREATE TABLE IF NOT EXISTS flows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER,
      to_user_id INTEGER,
      amount DECIMAL(10,2) NOT NULL,
      type VARCHAR(20) NOT NULL,
      description VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    )
  `)

  const adminExists = dbGet<{ id: number }>('SELECT id FROM users WHERE username = ?', ['admin'])
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('123456', 10)
    dbRun(
      'INSERT INTO users (username, password, name, phone, balance, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', hashedPassword, '管理员', '13800138000', 0.00, 'admin']
    )
  }

  const member1Exists = dbGet<{ id: number }>('SELECT id FROM users WHERE username = ?', ['member1'])
  if (!member1Exists) {
    const hashedPassword = await bcrypt.hash('123456', 10)
    dbRun(
      'INSERT INTO users (username, password, name, phone, balance, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['member1', hashedPassword, '张三', '13900139000', 1000.00, 'member']
    )
  }

  const member2Exists = dbGet<{ id: number }>('SELECT id FROM users WHERE username = ?', ['member2'])
  if (!member2Exists) {
    const hashedPassword = await bcrypt.hash('123456', 10)
    dbRun(
      'INSERT INTO users (username, password, name, phone, balance, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['member2', hashedPassword, '李四', '13700137000', 500.00, 'member']
    )
  }
}