import db from './database';

export async function assertDatabaseConnectionOk() {
  console.log(`Checking database connection...`);
  try {
    await db.sync();
    console.log('Database connection OK!');
  } catch (error) {
    console.log('Unable to connect to the database:');
    console.log(error.message);
    process.exit(1);
  }
}
