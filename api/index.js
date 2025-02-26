const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.handler = async (event) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    await client.release();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello from API', time: result.rows[0].now }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
