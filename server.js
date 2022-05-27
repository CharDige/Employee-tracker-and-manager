// Import and require npm modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const express = require("express");
const cTable = require("console.table");
require("dotenv").config();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: "localhost",
        // MySQL username,
        user: process.env.DB_USER,
        // MySQL password
        password: process.env.DB_PASSWORD,
        // MySQL database
        database: process.env.DB_NAME,
    },
    console.log(`Connected to the workplace_db database.`)
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });