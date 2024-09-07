CREATE DATABASE dseuerp;

CREATE TABLE studentinfo(
    roll_no VARCHAR(15) PRIMARY KEY, 
    name VARCHAR(50),
    prog VARCHAR(80),
    campus VARCHAR(50),
    batch INT,
    blocked_result JSON
);

CREATE TABLE course(
    course_code VARCHAR(50) PRIMARY KEY,
    credit INT ,
    course_name VARCHAR(50)
)

CREATE TABLE result(
    roll_no VARCHAR(15),
    semester INT,
    acad_year INT,
    course_code VARCHAR(50),
    marks INT,
    month_year DATE,
    PRIMARY KEY (roll_no, semester, acad_year, course_code),
    FOREIGN KEY (roll_no) REFERENCES studentinfo(roll_no),
    FOREIGN KEY (course_code) REFERENCES course(course_code)
);