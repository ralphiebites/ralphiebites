DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    student_id VARCHAR(8) PRIMARY KEY,
    username VARCHAR(50),
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50),
    meals_request INT NOT NULL,
    meals_given INT NOT NULL
);

CREATE TABLE transactions(
    transaction_id INT PRIMARY KEY,
    requester VARCHAR(50),
    sender VARCHAR(50),
    meals_count INT
)