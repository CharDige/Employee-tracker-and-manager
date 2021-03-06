// Import and require npm modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const figlet = require("figlet");
require("dotenv").config();


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
    // ASCII Art from text when connection to database is established
    figlet.text('Employee tracker and manager', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 100,
        whitespaceBreak: true
    }, function(err, data) {
        if (err) {
            console.log(err);
        }
        console.log(data);
        // Begin prompts
        beginPrompts();
    }),
);

const beginPrompts = () => {
    // List of all choices for user to select from
    return inquirer
        .prompt([
            {
                type: 'list',
                name: 'choices',
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "Add department", "Add role", "Add employee", "Update employee role", "Update employee manager", "View employees by manager", "View employees by department", "View total budget of a department", "Remove department", "Remove role", "Remove employee", "Quit"],
            }
        ])
        // Stores selected prompt to be used in conditional statements
        .then((data) => {
            const selection = {
                choice: data.choices,
            }

            const userChoice = selection.choice;

            if(userChoice === "View all departments") {
                db.query('SELECT * FROM department', function(err, results) {
                    if (err) {
                        console.log(err)
                    }
                    // Display results using console.table
                    console.table(`\n`, results);
                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                });
            } else if (userChoice === "View all roles") {
                db.query('SELECT role.id AS id, role.title AS title, department.name AS department, role.salary AS salary FROM role JOIN department ON role.department_id = department.id;', function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    // Display results using console.table
                    console.table(`\n`, results);
                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            } else if (userChoice === "View all employees") {
                db.query('SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id;', function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    // Display results using console.table
                    console.table(`\n`, results);
                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            } else if (userChoice === "Add department") {
                addDepartment();
            } else if (userChoice === "Add role") {
                addRole();
            } else if (userChoice === "Add employee") {
                addEmployee();
            } else if (userChoice === "Update employee role") {
                updateEmployeeRole();
            } else if (userChoice === "Update employee manager") {
                updateEmployeeManager();
            } else if (userChoice === "View employees by manager") {
                viewEmployeeManager();
            } else if (userChoice === "View employees by department") {
                viewEmployeeDepartment();
            } else if (userChoice === "View total budget of a department") {
                viewDepartmentBudget();
            } else if (userChoice === "Remove department") {
                deleteDepartment();
            } else if (userChoice === "Remove role") {
                deleteRole();
            } else if (userChoice === "Remove employee") {
                deleteEmployee();
            } else {
                // End database connection
                db.end((err) => {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("Thank you for using the employee tracker and manager!");
                });
            }
        });
}

// Add department function when "Add department" is selected
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

            // MySQL query to insert stored data as new department
            db.query(`INSERT INTO department(name) VALUES (?)`, newDepartment, (err, results) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log("New department added!");
                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
        })
}

// Add role function when "Add role" selected
const addRole = () => {
    // Empty array ahead of data to be pushed into the array
    const departmentList = [];

    db.query('SELECT * FROM department', (err, results) => {
        if (err) {
            console.log(err);
        }
        results.forEach((department) => {
            const deptObject = {
                name: department.name,
                value: department.id,
            }
            // Push object into the departmentList array
            departmentList.push(deptObject);
        }) 

        inquirer
        .prompt([
            {
                type: "input",
                name: "roleName",
                message: "What is the name of the role?",
            },
            {
                type: "input",
                name: "roleSalary",
                message: "What is the salary of this role?",
            },
            {
                type: "list",
                name: "roleDepartment",
                message: "Which department does this role belong to?",
                // Call upon departmentList array to list departments to select from
                choices: departmentList
            }
        ])

        .then((data) => {
            const answers = {
                name: data.roleName,
                salary: data.roleSalary,
                department: data.roleDepartment,
            }

            // MySQL query using data from inquirer prompt answers to determine the VALUES of the query
            db.query(`INSERT INTO role(title, salary, department_id) VALUES (?)`, [[answers.name, answers.salary, answers.department]], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log('New role added!');

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
        })
    })
}

// Add Employee function when "Add employee" is selected
const addEmployee = () => {
    // Array with object included to allow for no manager's to be selected (if employee has no manager)
    const employeeList = [{
        name: "None",
        value: null
    }];

    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err);
        }

        // Calling on multiple parameters for the final object to be pushed into the employeeList array
        results.forEach(({ first_name, last_name, id }) => {
            employeeList.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
    })

    // Empty role list ahead of data being pushed into this array
    const roleList =[];

    db.query('SELECT * FROM role', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach((role) => {
            const roleObject = {
                name: role.title,
                value: role.id
            }
            // Push object into roleList array
            roleList.push(roleObject);
        })

        inquirer
        .prompt([
            {
                type: "input",
                name: "employeeFirstName",
                message: "What is this employee's first name?",
            },
            {
                type: "input",
                name: "employeeLastName",
                message: "What is this employee's last name?",
            },
            {
                type: "list",
                name: "employeeRole",
                message: "What is this employee's role?",
                // Role list array called upon for list of roles to select
                choices: roleList,
            },
            {
                type: "list",
                name: "employeeManager",
                message: "Who is this employee's manager?",
                // Employee list array called upon for list of employees to select as manager, including a "none" option
                choices: employeeList,
            }
        ])

        .then((data) => {
            const answers = {
                firstName: data.employeeFirstName,
                lastName: data.employeeLastName,
                role: data.employeeRole,
                manager: data.employeeManager
            }

            // MySQL query using data from inquirer prompt answers to determine the VALUES of the query
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`, [[answers.firstName, answers.lastName, answers.role, answers.manager]], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log('New employee added!');

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
        })
    })
}

// Update employee role function after "Update employee role" is selected
const updateEmployeeRole = () => {
    // Empty employeeSelect array ahead of data being pushed into it
    const employeeSelect = [];

    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err);
        }

        // Calling on multiple parameters to be used in the object that will be pushed into the employeeSelect array
        results.forEach(({ first_name, last_name, id }) => {
            employeeSelect.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
    })

    // Empty roleSelect array ahead of data being pushed into it
    const roleSelect = [];

    db.query('SELECT * from role', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach((role) => {
            const roleObject = {
                name: role.title,
                value: role.id
            }
            // Push roleObject data into roleSelect array
            roleSelect.push(roleObject);
        })

        inquirer
        .prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Which employee's role do you want to update?",
                // employeeSelect array to list employees to select from
                choices: employeeSelect
            },
            {
                type: "list",
                name: "newRole",
                message: "Which role do you want to assign the selected employee",
                // roleSelect array to list roles to select from
                choices: roleSelect
            }
        ])

        .then((data) => {
            const answers = {
                name: data.employeeName,
                role: data.newRole
            }

            // MySQL query using data from inquirer prompt answers to determine SET and WHERE conditions in the query
            db.query(`UPDATE employee SET ? WHERE ?? = ?`, [{role_id: answers.role}, "id", answers.name], (err, results) => {
                if (err) {
                    console.log(err);
                }

                console.log("Updated employee role!");

                // Restart beginPrompts() function to show user list of initial selections again
                beginPrompts();
            })
        })
    })
}

// Update employee manager function after "Update employee manager" is selected
const updateEmployeeManager = () => {
    // Empty employeeList array ahead of data being pushed into it
    const employeeList = [];

    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err);
        }

        // Object using multiple parameters to push into the employeeList array
        results.forEach(({ first_name, last_name, id }) => {
            employeeList.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Which employee has had a change in manager?",
                    // employeeList array to select from list of employees
                    choices: employeeList
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Who is this employee's new manager?",
                    // employeeList array to select from list of employees
                    choices: employeeList
                }
            ])

            .then((data) => {
                const answers = {
                    employee: data.employee,
                    manager: data.manager
                }

                // MySQL query using data from inquirer prompt answers to determine SET and WHERE conditions in the query
                db.query(`UPDATE employee SET ? WHERE ?? = ?`, [{manager_id: answers.manager}, "id", answers.employee], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log("Employee manager updated!");

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            })
    })
}

// View Employee Manager function after "View employees by manager" is selected
const viewEmployeeManager = () => {
    // Empty employeeList array ahead of data being pushed into it
    const employeeList = [];

    db.query('SELECT * FROM employee WHERE employee.manager_id IS NULL', (err, results) => {
        if (err) {
            console.log(err);
        }

        // Object with multiple parameters to be pushed into employeeList array
        results.forEach(({ first_name, last_name, id }) => {
            employeeList.push({
                name: first_name + " " + last_name,
                value: id
            })
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "manager",
                    message: "Select a manager to see they're employees",
                    // employeeList array to select from list of employees
                    choices: employeeList
                }
            ])

            .then((data) => {
                const answer = {
                    manager: data.manager
                }

                // MySQL query using inquirer prompt answers to determine the WHERE condition of the query
                db.query(`SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id WHERE employee.manager_id = ?;`, [answer.manager], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    // View results via console.table
                    console.table(`\n`, results);

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            })
    })
}

// View Employee Department function after "View employees by department" is selected
const viewEmployeeDepartment = () => {
    // Empty department list array ahead of data being pushed into it
    const departmentList = [];

    db.query('SELECT * FROM department', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach((department) => {
            const deptObject = {
                name: department.name,
                value: department.id
            }
            // Push deptObject into empty departmentList array
            departmentList.push(deptObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Select department to list of employees within that department",
                    // departmentList array to select from list of departments
                    choices: departmentList
                }
            ])

            .then((data) => {
                const answer = {
                    department: data.department
                }

                // MySQL query using inquirer prompt answer to determine the WHERE condition of the query
                db.query(`SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS role, department.name AS department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE department.id = ?`, [answer.department], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    // View results via console.table
                    console.table(`\n`, results);

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            })
    })
}

// View Department Budget function when "View total budget of a department" is selected
const viewDepartmentBudget = () => {
    // Empty departmentList array ahead of data being pushed into it
    const departmentList = [];

    db.query('SELECT * FROM department', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach((department) => {
            const deptObject = {
                name: department.name,
                value: department.id
            }
            // Push deptObject into empty departmentList array
            departmentList.push(deptObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Select the department you wish to see the total budget of",
                    // departmentList array to select from list of departments
                    choices: departmentList
                }
            ])

            .then((data) => {
                const answer = {
                    department: data.department
                }

                // MySQL query using inquirer prompt answer to determine the WHERE condition of this query
                db.query(`SELECT department.name AS department, SUM(role.salary) AS total_budget FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE department.id = ?;`, [answer.department], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    // Display results using console.table
                    console.table(`\n`, results);

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            })
    })
}

// Delete department function after "Remove department" is selected
const deleteDepartment = () => {
    // Empty departmentList array ahead of data being pushed into it
    const departmentList = [];

    db.query('SELECT * FROM department', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach((department) => {
            const deptObject = {
                name: department.name,
                value: department.id
            }
            // Push deptObject into empty departmentList array
            departmentList.push(deptObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Which department do you want to remove?",
                    // departmentList array to select from list of departments
                    choices: departmentList
                }
            ])

            .then((data) => {
                const answer = {
                    department: data.department
                }

                // MySQL query using inquirer prompt answer to determine WHERE condition for the query
                db.query(`DELETE FROM department WHERE department.id = ?`, [answer.department], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log("Department has been removed from the database!")

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            })
    })
}

// Delete role function after "Remove role" is selected
const deleteRole = () => {
    // Empty roleList array ahead of data pushed into it
    const roleList = [];

    db.query('SELECT * FROM role', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach((role) => {
            const roleObject = {
                name: role.title,
                value: role.id
            }
            // Push roleObject into empty roleList array
            roleList.push(roleObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "role",
                    message: "Which role would you like to remove?",
                    // roleList array to select from list of roles
                    choices: roleList
                }
            ])

            .then((data) => {
                const answer = {
                    role: data.role
                }

                // MySQL query using inquirer prompt answer to determine the WHERE condition of this query
                db.query(`DELETE FROM role WHERE role.id = ?`, [answer.role], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log("Role has been removed from the database!")

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            })
    })
}

// Delete employee function after "Remove employee" is selected
deleteEmployee = () => {
    // Empty employeeList array ahead of data pushed into it
    const employeeList = [];

    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err)
        }

        // Multiple parameters used in object ahead of being pushed into empty employeeList array
        results.forEach(({ first_name, last_name, id }) => {
            employeeList.push({
                name: first_name + " " + last_name,
                value: id
            })
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Which employee would you like to remove?",
                    // employeeList array to select from list of employees
                    choices: employeeList
                }
            ])

            .then((data) => {
                const answer = {
                    employee: data.employee
                }

                // MySQL query using inquirer prompt answer to determine WHERE condition of query
                db.query(`DELETE FROM employee WHERE employee.id = ?`, [answer.employee], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log("Employee has been removed from the database!");

                    // Restart beginPrompts() function to show user list of initial selections again
                    beginPrompts();
                })
            })
    })
}