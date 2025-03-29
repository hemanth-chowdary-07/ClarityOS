CREATE DATABASE worksphere;

USE worksphere;

CREATE TABLE productivity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    task_count INT,
    focus_hours FLOAT,
    stress_level INT
);

INSERT INTO productivity (name, task_count, focus_hours, stress_level)
VALUES 
('Dinesh', 12, 5.5, 2),
('Anjali', 9, 4.0, 1),
('Ravi', 14, 3.5, 3);
