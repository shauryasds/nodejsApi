
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise'; 
// console.log(process.env.DB_HOST)
const connection = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

export async function initializeDatabase() {
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(200) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
}

export async function addSchool(school) {
  try {
    const [result] = await connection.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [school.name, school.address, school.latitude, school.longitude]
    );
    
    const [newSchool] = await connection.query(
      'SELECT * FROM schools WHERE id = ?',
      [result.insertId]
    );
    
    return newSchool[0];
  } catch (err) {
    console.error('Failed to add school:', err);
    throw err;
  }
}

export async function getAllSchools() {
  try {
    const [schools] = await connection.query('SELECT * FROM schools');
    return schools;
  } catch (err) {
    console.error('Failed to get schools:', err);
    throw err;
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function getSchoolsSortedByDistance(userLat, userLon) {
  const schools = await getAllSchools();
  return schools
    .map(school => ({
      ...school,
      distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
    }))
    .sort((a, b) => a.distance - b.distance);
}


process.on('SIGINT', async () => {
  try {
    await connection.end();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database connection:', err);
    process.exit(1);
  }
});

export { connection };