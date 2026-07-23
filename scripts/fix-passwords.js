const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('请确保 .env 文件中配置了 SUPABASE_URL 和 SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixPasswords() {
  console.log('开始修复用户密码...\n')

  const users = [
    { username: 'admin', password: '123456' },
    { username: 'member1', password: '123456' },
    { username: 'member2', password: '123456' },
  ]

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    console.log(`正在更新用户 ${user.username} 的密码...`)

    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('username', user.username)
      .select('id, username')

    if (error) {
      console.error(`  ❌ 更新失败: ${error.message}`)
    } else if (data && data.length > 0) {
      console.log(`  ✅ 用户 ${user.username} (id=${data[0].id}) 密码已更新为: ${user.password}`)
    } else {
      console.log(`  ⚠️ 用户 ${user.username} 不存在，跳过`)
    }
  }

  console.log('\n密码修复完成！')
  console.log('\n测试账号:')
  console.log('  admin   / 123456')
  console.log('  member1 / 123456')
  console.log('  member2 / 123456')
}

fixPasswords().catch(console.error)