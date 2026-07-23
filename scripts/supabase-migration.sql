CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  balance DECIMAL(10,2) DEFAULT 0.00,
  role VARCHAR(20) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flows (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, name, phone, email, balance, role) VALUES 
('admin', '$2a$10$rOvHdKz4E8G8x7vT1E2uBeuV8K5Y1Z7W6X9C4V3B2N1M8K7J6H5G', '管理员', '13800138000', '', 0.00, 'admin'),
('member1', '$2a$10$rOvHdKz4E8G8x7vT1E2uBeuV8K5Y1Z7W6X9C4V3B2N1M8K7J6H5G', '张三', '13900139000', '', 1000.00, 'member'),
('member2', '$2a$10$rOvHdKz4E8G8x7vT1E2uBeuV8K5Y1Z7W6X9C4V3B2N1M8K7J6H5G', '李四', '13700137000', '', 500.00, 'member');

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_trigger
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_flows_from_user_id ON flows(from_user_id);
CREATE INDEX idx_flows_to_user_id ON flows(to_user_id);