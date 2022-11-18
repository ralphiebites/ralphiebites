DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(8) NOT NULL,
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL
);

