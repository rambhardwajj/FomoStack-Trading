import { client } from "./index.js";

export async function initDB() {
  try {
    await client.connect();

    await client.query(`CREATE EXTENSION IF NOT EXISTS timescaledb`);

    await client.query(
      `CREATE TABLE IF NOT EXISTS trades(
          id SERIAL,
          symbol TEXT NOT NULL,
          price NUMERIC NOT NULL,
          quantity NUMERIC NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (id, timestamp)
      )`
    );

    await client.query(`
      SELECT create_hypertable('trades', 'timestamp', if_not_exists => TRUE);
    `);

    await client.end();
    console.log("✅ trades table and hypertable ready");
  } catch (error) {
    console.error("error", error);
  }
}

initDB().catch(console.error);
