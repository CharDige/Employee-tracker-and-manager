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

const beginPrompts = () => {
    return inquirer
        .prompt([
            {
                type: 'list',
                name: 'choices',
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "Add department", "Add role", "Add employee", "Finish"],
            }
        ])

        .then((data) => {
            const selection = {
                choice: data.choices,
            }

            const userChoice = selection.choice;

            // Testing prompt selection works
            console.log(userChoice);

            if(userChoice === "View all departments") {
                db.query('SELECT * FROM department', function(err, results) {
                    if (err) {
                        console.log(err)
                    }
                    console.table(results);
                    beginPrompts();
                });
            } else if (userChoice === "View all roles") {
                db.query('SELECT role.id AS id, role.title AS title, department.name AS department, role.salary AS salary FROM role JOIN department ON role.department_id = department.id;', function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    console.table(results);
                    beginPrompts();
                })
            } else if (userChoice === "View all employees") {
                db.query('SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, manager.first_name AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id;', function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    console.table(results);
                    beginPrompts();
                })
            } else if (userChoice === "Add department") {
                addDepartment();
            }
        });
}

const addDepartment = () => {
    return inquirer
        .prompt([
            {
                type: 'input',
                name: "departmentName",
                message: "What is the name of the department?"
            }
        ])

        .then((data) => {
            const answer = {
                department: data.departmentName,
            }

            const newDepartment = answer.department;

            // Testing department prompt input works
            console.log(newDepartment);

            db.query(`INSERT INTO department(name)
                VALUES (?)`, newDepartment, (err, results) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log("New department added!");
                    beginPrompts();
                })
        })
}

beginPrompts();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });