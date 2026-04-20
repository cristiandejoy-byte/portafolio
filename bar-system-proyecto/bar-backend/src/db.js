const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     'localhost',
  port:     3306,
  user:     'root',
  password: '',
  database: 'bar_system',
  waitForConnections: true,
  connectionLimit: 10,
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado correctamente');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;