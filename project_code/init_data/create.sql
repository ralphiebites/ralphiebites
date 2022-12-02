DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(8) NOT NULL,
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL
);

INSERT INTO users (username, password, first_name, last_name, email) VALUES ('nica6529', 'loop$', 'Nina', 'Carnell', 'nica6529@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('xame9872', 'jet78laser', 'Xander', 'Merrick', 'xame9872@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('aial5632', 'rainbows!', 'Aili', 'Alma', 'aial5632@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('arkl4432', 'mockingbird12', 'Ari', 'Klein', 'arkl4432@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('soro1783', 'fluffy123', 'Sonia', 'Rohan', 'soro1783@colorado.edu');
INSERT INTO users (username, password, first_name, last_name, email) VALUES ('rabi5934', 'lava876', 'Ravi', 'Bieler', 'rabi5934@colorado.edu');