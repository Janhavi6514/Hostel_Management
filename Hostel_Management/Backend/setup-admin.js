const bcrypt = require('bcrypt');
const db = require('./config/database');
require('dotenv').config();

async function setupAdmin() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    await db.query('DELETE FROM users WHERE username = "admin"');

    await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hash, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();