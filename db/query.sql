-- Testing joining department and role tables to dusplay joined information --
SELECT role.title AS role, role.salary AS salary, department.name AS department
FROM role
JOIN department ON role.department_id = department.id;

-- Testing joining all three tables --
SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS role, department.name AS department, role.salary AS salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id;

-- Testing viewing employees by manager --
SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, CONCAT(manager.first_name, " ", manager.last_name) AS manager 
FROM employee
LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id
WHERE employee.manager_id IS NULL;

SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, CONCAT(manager.first_name, " ", manager.last_name) AS manager
FROM employee
LEFT OUTER JOIN employee manager ON employee.manager_id = manager.id
WHERE employee.manager_id = 2;

-- Testing viewing employees by department --
SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS role, department.name AS department
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
WHERE department.id = 2;

-- Testing getting the sum of a budget --
SELECT department.name AS department, SUM(role.salary) AS total_salary
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
WHERE department.id = 2;