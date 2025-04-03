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

// GET endpoint for productivity data with filtering
app.get('/api/productivity', (req, res) => {
  const { startDate, endDate, status = 'active' } = req.query;
  
  let query = 'SELECT * FROM productivity WHERE status = ?';
  let queryParams = [status];

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?';
    queryParams.push(startDate, endDate);
  }

  query += ' ORDER BY date DESC';

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('❌ Database query failed:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET endpoint for productivity summary
app.get('/api/productivity/summary', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as totalEntries,
      AVG(task_count) as avgTasks,
      AVG(focus_hours) as avgFocusHours,
      AVG(stress_level) as avgStressLevel,
      MAX(task_count) as maxTasks,
      MIN(stress_level) as minStress
    FROM productivity 
    WHERE status = 'active'
    AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Database query failed:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
});

// POST endpoint to insert new productivity data
app.post('/api/productivity', (req, res) => {
  const { name, task_count, focus_hours, stress_level } = req.body;

  // Validate required fields
  if (!name || task_count === undefined || focus_hours === undefined || stress_level === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Sanitize and validate name
  const sanitizeName = (input) => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s.,'-]/g, '') // Only allow alphanumeric, spaces, and basic punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
  };

  const sanitizedName = sanitizeName(name);

  // Validate name
  if (typeof name !== 'string' || sanitizedName.length === 0) {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  if (sanitizedName !== name) {
    return res.status(400).json({ error: 'Name contains invalid characters' });
  }

  if (sanitizedName.length > 50) {
    return res.status(400).json({ error: 'Name must be less than 50 characters' });
  }

  // Convert numeric fields to numbers and validate
  const taskCount = Number(task_count);
  const focusHours = Number(focus_hours);
  const stressLevel = Number(stress_level);

  // Validate task_count
  if (isNaN(taskCount) || taskCount < 1 || taskCount > 50 || !Number.isInteger(taskCount)) {
    return res.status(400).json({ error: 'Task count must be an integer between 1 and 50' });
  }

  // Validate focus_hours
  if (isNaN(focusHours) || focusHours < 0 || focusHours > 12) {
    return res.status(400).json({ error: 'Focus hours must be between 0 and 12' });
  }

  // Validate stress_level
  if (isNaN(stressLevel) || stressLevel < 1 || stressLevel > 5 || !Number.isInteger(stressLevel)) {
    return res.status(400).json({ error: 'Stress level must be an integer between 1 and 5' });
  }

  const query = 'INSERT INTO productivity (name, task_count, focus_hours, stress_level, date, status) VALUES (?, ?, ?, ?, CURRENT_DATE(), "active")';
  const values = [sanitizedName, taskCount, focusHours, stressLevel];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('❌ Failed to insert data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ 
      message: 'Productivity data inserted successfully',
      id: results.insertId 
    });
  });
});

// PATCH endpoint to archive a productivity entry
app.patch('/api/productivity/:id/archive', (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE productivity SET status = "archived" WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Failed to archive data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry archived successfully' });
  });
});

// Start the server on port 5000
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Export database connection for future use
module.exports = db;
