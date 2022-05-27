-- Testing joining department and role tables to dusplay joined information --
SELECT role.title AS role, role.salary AS salary, department.name AS department
FROM role
JOIN department ON role.department_id = department.id;

-- Testing joining all three tables --
SELECT employee.first_name AS first_name, employee.last_name AS last_name, role.title AS role, role.salary AS salary, department.name AS department
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department on role.department_id = department.id;