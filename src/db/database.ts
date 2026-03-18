import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function initDB() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      license_number TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicle_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_name TEXT NOT NULL,
      seats INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_type_id INTEGER,
      license_plate TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      pickup_location TEXT NOT NULL,
      dropoff_location TEXT NOT NULL,
      trip_date DATETIME NOT NULL,
      passengers INTEGER NOT NULL,
      vehicle_type_id INTEGER,
      price REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      amount REAL,
      paid_at DATETIME,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS trip_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      driver_id INTEGER,
      vehicle_id INTEGER,
      staff_id INTEGER,
      driver_confirm INTEGER DEFAULT 0,
      low_occupancy_reason TEXT,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (driver_id) REFERENCES drivers(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    );
  `);

  // Seed initial data if empty
  const vehicleTypes = await db.all('SELECT * FROM vehicle_types');
  if (vehicleTypes.length === 0 || (vehicleTypes.length > 0 && vehicleTypes[0].seats === 4)) {
    // Clear old types if they exist and are the old ones
    await db.run('DELETE FROM vehicle_types');
    await db.run('INSERT INTO vehicle_types (type_name, seats) VALUES (?, ?), (?, ?), (?, ?), (?, ?)', 
      ['9 Chỗ (Limousine)', 9, '16 Chỗ (Transit/Solati)', 16, '29 Chỗ (County/Samco)', 29, '45 Chỗ (Universe)', 45]);
    
    // Also clear vehicles to avoid FK issues if we were to change IDs drastically, 
    // but here we'll just ensure at least one new vehicle exists
    await db.run('DELETE FROM vehicles');
    await db.run('INSERT INTO vehicles (vehicle_type_id, license_plate) VALUES (?, ?), (?, ?), (?, ?), (?, ?)', 
      [1, '29A-999.99', 2, '29B-161.66', 3, '29C-292.99', 4, '29D-454.55']);

    const drivers = await db.all('SELECT * FROM drivers');
    if (drivers.length === 0) {
      await db.run('INSERT INTO drivers (name, phone, license_number) VALUES (?, ?, ?)', 
        ['Nguyễn Văn Tài', '0901234567', 'LX123456']);
    }
    
    const staff = await db.all('SELECT * FROM staff');
    if (staff.length === 0) {
      await db.run('INSERT INTO staff (name, phone, email) VALUES (?, ?, ?)',
        ['Admin Hệ Thống', '0123456789', 'admin@carbooking.com']);
    }
  }

  return db;
}
