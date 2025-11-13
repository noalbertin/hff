//db.js
import mysql from 'mysql2/promise'

const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // à adapter selon ton environnement
  database: 'colass',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default db
