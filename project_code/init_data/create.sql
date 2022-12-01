DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(8) NOT NULL,
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL
);

INSERT INTO users (username, password, first_name, last_name, email) VALUES ('jopt6529', '1234', 'Joe', 'Ptac', 'jopt6529@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('pasm9872', '4321', 'Pat', 'Smith', 'pasm9872@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('sejk5632', 'password!', 'Sean', 'Jkacobi', 'sejk5632@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('rikl4432', '@passcode', 'Riley', 'Klein', 'rikl4432@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('benw1783', 'fluffy123', 'Ben', 'Nwaker', 'benw1783@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('lojf5934', 'lava876', 'Lorien', 'Jfall', 'lojf5934@colorado.edu');