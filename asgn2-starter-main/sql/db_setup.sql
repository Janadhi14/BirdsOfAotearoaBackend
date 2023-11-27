-- create user
CREATE USER 'cosc203' IDENTIFIED BY 'password';
GRANT ALL ON *.* TO 'cosc203' WITH GRANT OPTION;

-- delete if already exists 
DROP TABLE IF EXISTS ConservationStatus;
DROP DATABASE ASGN2;
-- creating a new database 
CREATE DATABASE ASGN2;
USE ASGN2; --setting asgn2 as the db that we are using 


-- create tables
CREATE TABLE ConservationStatus (
    status_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(255) NOT NULL,
    status_colour CHAR(7) NOT NULL
);

-- Bird Table
CREATE TABLE Bird (
    bird_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    primary_name VARCHAR(255) NOT NULL,
    english_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    order_name VARCHAR(255) NOT NULL,
    family VARCHAR(255) NOT NULL,
    length INT,
    weight INT,
    status_id INT,
    FOREIGN KEY (status_id) REFERENCES ConservationStatus(status_id)
);

-- Photo Table 
CREATE TABLE Photos (
    photo_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    photographer VARCHAR(255) NOT NULL,
    bird_id INT,
    FOREIGN KEY (bird_id) REFERENCES Bird(bird_id)
);


