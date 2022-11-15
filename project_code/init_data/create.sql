DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    student_id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50),
    meals_request INT NOT NULL Default 0,
    meals_given INT NOT NULL Default 0
);    