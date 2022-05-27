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
        ("Sales Team Lead", 75000, 1);