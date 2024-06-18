import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = 4003;
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware
app.use(
  cors({
    origin: [
      ["exp://10.100.2.17:8081"],
      "http://192.168.1.67:8081",
      ["exp://192.168.161.30:8081"],
      "http://localhost:8081",
    ],
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.json());

// Verify environment variables are loaded
console.log("Database Host:", process.env.DB_HOST);
console.log("Database User:", process.env.DB_USER);

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    {
      expiresIn: "365d",
    }
  );
};

// Routes

// Admin registration

app.post("/admins", async (req, res) => {
  const { email, password } = req.body;
  console.log("Incoming request body:", req.body); // Log incoming request body for debugging
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await pool.query(
      "INSERT INTO admins (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );
    res.status(201).json({
      message: "Admin created successfully",
      adminId: result.insertId,
    });
  } catch (error) {
    console.error("Error occurred:", error.message); // Log the error message
    console.error("Error stack:", error.stack); // Log the full error stack
    res.status(500).json({ error: error.message });
  }
});

// Handle adding laundries and time slots
app.post("/laundries", async (req, res) => {
  const { numLaundries, timeSlots } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    for (let i = 0; i < numLaundries; i++) {
      const [result] = await connection.query(
        "INSERT INTO laundries (name, location) VALUES (?, ?)",
        [`Laundry ${i + 1}`, `Location ${i + 1}`]
      );

      const laundryId = result.insertId;

      for (const slot of timeSlots) {
        await connection.query(
          "INSERT INTO laundry_time_slots (laundry_id, time_slot) VALUES (?, ?)",
          [laundryId, slot]
        );
      }
    }

    await connection.commit();
    connection.release();

    res
      .status(201)
      .json({ message: "Laundries and time slots added successfully" });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fetch all laundries and their time slots
app.get("/laundries", async (req, res) => {
  try {
    const [laundries] = await pool.query("SELECT * FROM laundries");
    const [timeSlots] = await pool.query("SELECT * FROM laundry_time_slots");

    const result = laundries.map((laundry) => ({
      ...laundry,
      timeSlots: timeSlots.filter((slot) => slot.laundry_id === laundry.id),
    }));

    res.json(result);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update laundries and time slots
app.put("/laundries", async (req, res) => {
  const { numLaundries, timeSlots } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query("DELETE FROM laundries");
    await connection.query("DELETE FROM laundry_time_slots");

    for (let i = 0; i < numLaundries; i++) {
      const [result] = await connection.query(
        "INSERT INTO laundries (name, location) VALUES (?, ?)",
        [`Laundry ${i + 1}`, `Location ${i + 1}`]
      );

      const laundryId = result.insertId;

      for (const slot of timeSlots) {
        await connection.query(
          "INSERT INTO laundry_time_slots (laundry_id, time_slot) VALUES (?, ?)",
          [laundryId, slot]
        );
      }
    }

    await connection.commit();
    connection.release();

    res
      .status(200)
      .json({ message: "Laundries and time slots updated successfully" });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fetch all tenants
app.get("/tenants", async (req, res) => {
  try {
    const [tenants] = await pool.query(
      "SELECT id, email, house_id FROM tenants"
    );
    res.json(tenants);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fetch all registration codes
app.get("/registration-codes", async (req, res) => {
  try {
    const [codes] = await pool.query(
      "SELECT id, code, house_id FROM registration_codes WHERE used = FALSE"
    );
    res.json(codes);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate a new registration code
app.post("/registration-codes", async (req, res) => {
  const { houseId } = req.body;
  const code = Math.random().toString(36).slice(2, 6).toUpperCase();
  try {
    const [result] = await pool.query(
      "INSERT INTO registration_codes (code, house_id) VALUES (?, ?)",
      [code, houseId]
    );
    res.status(201).json({ code });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Tenant registration
app.post("/tenants", async (req, res) => {
  const { email, password, registrationCode } = req.body;
  try {
    // Verify registration code
    const [codes] = await pool.query(
      "SELECT * FROM registration_codes WHERE code = ? AND used = FALSE",
      [registrationCode]
    );
    if (codes.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or used registration code" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const houseId = codes[0].house_id;
    const [result] = await pool.query(
      "INSERT INTO tenants (email, password, house_id, role) VALUES (?, ?, ?, 'tenant')",
      [email, hashedPassword, houseId]
    );

    // Mark the registration code as used
    await pool.query(
      "UPDATE registration_codes SET used = TRUE WHERE code = ?",
      [registrationCode]
    );

    res.status(201).json({
      message: "Tenant registered successfully",
      tenantId: result.insertId,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Remove a tenant
app.delete("/tenants/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tenants WHERE id = ?", [id]);
    res.status(200).json({ message: "Tenant removed successfully" });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists in admins or tenants table
    const [admins] = await pool.query("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);
    const [tenants] = await pool.query(
      "SELECT * FROM tenants WHERE email = ?",
      [email]
    );

    const user = admins[0] || tenants[0];
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user);
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Protecting routes
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Fetch available dates with available time slots
app.get("/available-dates", async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    // Fetch all laundries
    const [laundries] = await pool.query("SELECT id FROM laundries");
    const numLaundries = laundries.length;

    // Fetch existing bookings between the given dates
    const [bookings] = await pool.query(
      "SELECT date, time_slot, COUNT(*) as count FROM bookings WHERE date BETWEEN ? AND ? GROUP BY date, time_slot",
      [startDate, endDate]
    );

    // Fetch all available time slots from laundry_time_slots
    const [allTimeSlots] = await pool.query(
      "SELECT time_slot FROM laundry_time_slots"
    );

    // Create a dictionary of available dates with time slots
    const availableDates = {};

    // Initialize all dates within the range with all available time slots
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split("T")[0];
      availableDates[dateString] = allTimeSlots.map((slot) => slot.time_slot);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Remove time slots that are fully booked
    bookings.forEach((booking) => {
      if (booking.count >= numLaundries) {
        const index = availableDates[booking.date].indexOf(booking.time_slot);
        if (index !== -1) {
          availableDates[booking.date].splice(index, 1);
        }
      }
    });

    res.json(availableDates);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Book a laundry room
app.post("/book", async (req, res) => {
  const { house_id, laundry_id, date, time_slot } = req.body;
  try {
    const [existingBookings] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE date = ? AND time_slot = ?",
      [date, time_slot]
    );

    const [laundries] = await pool.query("SELECT id FROM laundries");
    const numLaundries = laundries.length;

    if (existingBookings[0].count >= numLaundries) {
      return res
        .status(400)
        .json({ error: "No available slots for this time." });
    }

    const [result] = await pool.query(
      "INSERT INTO bookings (house_id, laundry_id, date, time_slot) VALUES (?, ?, ?, ?)",
      [house_id, laundry_id, date, time_slot]
    );

    res
      .status(201)
      .json({ message: "Booking successful", bookingId: result.insertId });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/my-bookings", async (req, res) => {
  const { house_id } = req.query; // Assuming you pass house_id as a query parameter
  try {
    const [bookings] = await pool.query(
      "SELECT date, time_slot, laundry_id FROM bookings WHERE house_id = ?",
      [house_id]
    );
    res.json(bookings);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
