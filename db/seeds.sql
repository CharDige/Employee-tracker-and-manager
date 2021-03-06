-- Insert data into department table --
INSERT INTO department (name)
VALUES  ("Sales"),
        ("Communications and Marketing"),
        ("Engineering"),
        ("Finance"),
        ("Administration"),
        ("Legal");

-- Insert data into role table --
INSERT INTO role (title, salary, department_id)
VALUES  ("Salesperson", 55000, 1),
        ("Communications Lead", 98000, 2),
        ("Lead Engineer", 120000, 3),
        ("Finance Team Lead", 120000, 4),
        ("Admin Team Lead", 85000, 5),
        ("Legal Team Lead", 180000, 6),
        ("Sales Team Lead", 75000, 1),
        ("Communications Officer", 85000, 2),
        ("Software Engineer", 100000, 3),
        ("Business Support Officer", 95000, 4),
        ("Admin Officer", 55000, 5),
        ("Legal Adviser", 150000, 6);

-- Insert data into employee table --
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Harry", "Amell", 2, null),
        ("Jennifer", "Surana", 3, null),
        ("Triss", "Tabris", 4, null),
        ("Dmitri", "Mahariel", 5, null),
        ("Damon", "Aeducan", 6, null),
        ("Ella", "Brosca", 7, null),
        ("Natalie", "Cousland", 1, 6),
        ("Amelia", "Trevelyan", 8, 1),
        ("Daniel", "Lavellan", 9, 2),
        ("Hannah", "Cadash", 10, 3),
        ("Lucy", "Adaar", 11, 4),
        ("Jeremy", "Hawke", 12, 5);