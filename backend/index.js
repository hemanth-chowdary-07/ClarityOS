// Import required modules
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');

// Create a connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Harshihemanth14@', // Replace with your MySQL password
  database: 'worksphere', // Replace with your database name
});

// Test the connection
db.getConnection((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Define API endpoint for productivity data
app.get('/api/productivity', (req, res) => {
  const query = 'SELECT * FROM productivity';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Database query failed:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results); // ✅ Send DB data as JSON
  });
});


// Start the server on port 5000
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Export database connection for future use
module.exports = db;
