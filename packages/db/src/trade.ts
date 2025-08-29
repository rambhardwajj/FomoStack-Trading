import { client } from "./index.js";

export async function initDB() {
  try {
    await client.connect();

    await client.query(`CREATE EXTENSION IF NOT EXISTS timescaledb`);

    await client.query(
      `CREATE TABLE IF NOT EXISTS ETHUSDT(
          id SERIAL,
          symbol TEXT NOT NULL,
          price NUMERIC NOT NULL,
          quantity NUMERIC NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (id, timestamp)
      )`
    );
     await client.query(
      `CREATE TABLE IF NOT EXISTS SOLUSDT(
          id SERIAL,
          symbol TEXT NOT NULL,
          price NUMERIC NOT NULL,
          quantity NUMERIC NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (id, timestamp)
      )`
    );
     await client.query(
      `CREATE TABLE IF NOT EXISTS BTCUSDT(
          id SERIAL,
          symbol TEXT NOT NULL,
          price NUMERIC NOT NULL,
          quantity NUMERIC NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (id, timestamp)
      )`
    );
   

    await client.query(`
      SELECT create_hypertable('ETHUSDT', 'timestamp', if_not_exists => TRUE);
    `);
          console.log("ETHUSDT table and hypertable ready");

    await client.query(`
      SELECT create_hypertable('SOLUSDT', 'timestamp', if_not_exists => TRUE);
    `);
          console.log("SOLUSDT table and hypertable ready");

    await client.query(`
      SELECT create_hypertable('BTCUSDT', 'timestamp', if_not_exists => TRUE);
      `);
      console.log("BITUSDT table and hypertable ready");
      
    await client.end();
  } catch (error) {
    console.error("error", error);
  }
}

initDB().catch(console.error);
