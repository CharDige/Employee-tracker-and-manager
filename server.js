// Import and require npm modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const e = require("express");
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
    console.log(`Connected to the workplace_db database.`)
);

const beginPrompts = () => {
    return inquirer
        .prompt([
            {
                type: 'list',
                name: 'choices',
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "Add department", "Add role", "Add employee", "Update employee role", "Update employee manager", "View employees by manager", "View employees by department", "View total budget of a department", "Remove department", "Remove role", "Remove employee", "Quit"],
            }
        ])

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
                    console.table(`\n`, results);
                    beginPrompts();
                });
            } else if (userChoice === "View all roles") {
                db.query('SELECT role.id AS id, role.title AS title, department.name AS department, role.salary AS salary FROM role JOIN department ON role.department_id = department.id;', function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    console.table(`\n`, results);
                    beginPrompts();
                })
            } else if (userChoice === "View all employees") {
                db.query('SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id;', function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    console.table(`\n`, results);
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
            }
            
            
            else {
                db.end((err) => {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("Thank you for using the employee tracker and manager!");
                });
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

            db.query(`INSERT INTO department(name) VALUES (?)`, newDepartment, (err, results) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log("New department added!");
                    beginPrompts();
                })
        })
}

const addRole = () => {
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
                choices: departmentList
            }
        ])

        .then((data) => {
            const answers = {
                name: data.roleName,
                salary: data.roleSalary,
                department: data.roleDepartment,
            }

            db.query(`INSERT INTO role(title, salary, department_id) VALUES (?)`, [[answers.name, answers.salary, answers.department]], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log('New role added!');

                    beginPrompts();
                })
        })
    })
}

const addEmployee = () => {
    const employeeList = [{
        name: "None",
        value: null
    }];

    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach(({ first_name, last_name, id }) => {
            employeeList.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
    })

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
                choices: roleList,
            },
            {
                type: "list",
                name: "employeeManager",
                message: "Who is this employee's manager?",
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

            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`, [[answers.firstName, answers.lastName, answers.role, answers.manager]], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log('New employee added!');

                    beginPrompts();
                })
        })
    })
}

const updateEmployeeRole = () => {
    const employeeSelect = [];

    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err);
        }

        results.forEach(({ first_name, last_name, id }) => {
            employeeSelect.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
    })

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
            roleSelect.push(roleObject);
        })

        inquirer
        .prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Which employee's role do you want to update?",
                choices: employeeSelect
            },
            {
                type: "list",
                name: "newRole",
                message: "Which role do you want to assign the selected employee",
                choices: roleSelect
            }
        ])

        .then((data) => {
            const answers = {
                name: data.employeeName,
                role: data.newRole
            }

            db.query(`UPDATE employee SET ? WHERE ?? = ?`, [{role_id: answers.role}, "id", answers.name], (err, results) => {
                if (err) {
                    console.log(err);
                }

                console.log("Updated employee role!");

                beginPrompts();
            })
        })
    })
}

const updateEmployeeManager = () => {
    const employeeList = [];

    db.query('SELECT * FROM employee', (err, results) => {
        if (err) {
            console.log(err);
        }

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
                    choices: employeeList
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Who is this employee's new manager?",
                    choices: employeeList
                }
            ])

            .then((data) => {
                const answers = {
                    employee: data.employee,
                    manager: data.manager
                }

                db.query(`UPDATE employee SET ? WHERE ?? = ?`, [{manager_id: answers.manager}, "id", answers.employee], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log("Employee manager updated!");

                    beginPrompts();
                })
            })
    })
}

const viewEmployeeManager = () => {
    const employeeList = [];

    db.query('SELECT * FROM employee WHERE employee.manager_id IS NULL', (err, results) => {
        if (err) {
            console.log(err);
        }

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
                    choices: employeeList
                }
            ])

            .then((data) => {
                const answer = {
                    manager: data.manager
                }

                db.query(`SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id WHERE employee.manager_id = ?;`, [answer.manager], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.table(`/n`, results);

                    beginPrompts();
                })
            })
    })
}

const viewEmployeeDepartment = () => {
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
            departmentList.push(deptObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Select department to list of employees within that department",
                    choices: departmentList
                }
            ])

            .then((data) => {
                const answer = {
                    department: data.department
                }

                db.query(`SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS role, department.name AS department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE department.id = ?`, [answer.department], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.table(`\n`, results);
                    beginPrompts();
                })
            })
    })
}

const viewDepartmentBudget = () => {
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
            departmentList.push(deptObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Select the department you wish to see the total budget of",
                    choices: departmentList
                }
            ])

            .then((data) => {
                const answer = {
                    department: data.department
                }

                db.query(`SELECT department.name AS department, SUM(role.salary) AS total_salary FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE department.id = ?;`, [answer.department], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.table(`\n`, results);
                    beginPrompts();
                })
            })
    })
}

const deleteDepartment = () => {
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
            departmentList.push(deptObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Which department do you want to remove?",
                    choices: departmentList
                }
            ])

            .then((data) => {
                const answer = {
                    department: data.department
                }

                db.query(`DELETE FROM department WHERE department.id = ?`, [answer.department], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log("Department has been removed from the database!")

                    beginPrompts();
                })
            })
    })
}

const deleteRole = () => {
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
            roleList.push(roleObject);
        })

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "role",
                    message: "Which role would you like to remove?",
                    choices: roleList
                }
            ])

            .then((data) => {
                const answer = {
                    role: data.role
                }

                db.query(`DELETE FROM role WHERE role.id = ?`, [answer.role], (err, results) => {
                    if (err) {
                        console.log(err);
                    }

                    console.log("Role has been removed from the database!")

                    beginPrompts();
                })
            })
    })
}

beginPrompts();