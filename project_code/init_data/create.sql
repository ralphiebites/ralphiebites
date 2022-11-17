DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    student_id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50)
);

CREATE TABLE transactions(
    transaction_id INT PRIMARY KEY,
    requester VARCHAR(50),
    sender VARCHAR(50),
    meals_count INT
);