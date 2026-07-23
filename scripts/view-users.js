const Database = require('better-sqlite3')

const db = new Database('./database.sqlite')

console.log('==========================================')
console.log('          Users Table Data')
console.log('==========================================')

const users = db.prepare('SELECT * FROM users').all()

if (users.length === 0) {
  console.log('No users found in the database.')
} else {
  console.log(`Total users: ${users.length}`)
  console.log('------------------------------------------')
  
  users.forEach((user, index) => {
    console.log(`\nUser #${index + 1}`)
    console.log(`  ID:          ${user.id}`)
    console.log(`  Username:    ${user.username}`)
    console.log(`  Name:        ${user.name}`)
    console.log(`  Phone:       ${user.phone || '-'}`)
    console.log(`  Email:       ${user.email || '-'}`)
    console.log(`  Balance:     ${user.balance}`)
    console.log(`  Role:        ${user.role}`)
    console.log(`  Created At:  ${user.created_at}`)
    console.log(`  Updated At:  ${user.updated_at}`)
  })
}

console.log('\n==========================================')
console.log('               End of Report')
console.log('==========================================')

db.close()