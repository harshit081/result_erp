const pool = require("../../db");


const arrayDifference = (arr1, arr2) => {
  return arr1.filter((element) => !arr2.includes(element));
};

const fetchsemester = async (req, res) => {
  try {
    const roll_number  = req.query.roll_number;
    // console.log("rollnumber", roll_number)
    const query1 = `
      SELECT 
      DISTINCT r.semester
      FROM studentinfo s
      LEFT JOIN result r ON s.roll_no = r.roll_no
      WHERE s.roll_no = $1
    `;
    const query2 =`SELECT s.blocked_result FROM studentinfo s WHERE s.roll_no = $1`
    const result1= await pool.query(query1, [roll_number]);


    const result2 = await pool.query(query2, [roll_number]);

    
    const semesters = result1.rows.map((row) => parseInt(row.semester));
  
    const avail_sem=arrayDifference(semesters,result2.rows[0]["blocked_result"])
    // console.log(avail_sem)
    res.json(avail_sem);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

const fetchresult = async (req, res) => {
  try {
    const roll_number = req.query.roll_number;
    const semester = req.query.semester;
    const acad_year = req.query.acad_year;

    // console.log(roll_number,semester,acad_year)

    const batch = await pool.query(`SELECT batch FROM studentinfo WHERE roll_no = $1`, [roll_number]);
// console.log("Batch: ", batch.rows[0].batch);

const query = `
  SELECT 
    s.roll_no AS rollno,
    s.name,
    s.prog,
    s.campus,
    r.semester,
    r.acad_year AS academic_year,
    s.batch,
    c.course_code,
    c.course_name,
    c.credit,
    r.marks,
    r.month_year
  FROM 
    studentinfo s
  LEFT JOIN 
    result r ON s.roll_no = r.roll_no
  LEFT JOIN 
    course c ON r.course_code = c.course_code
  WHERE 
    s.roll_no = $1 
    AND s.batch = $2 
    AND r.acad_year = $3 
    AND r.semester = $4
    AND r.course_code NOT IN (
      SELECT * FROM json_array_elements_text(s.blocked_result)
    )
  ORDER BY 
    s.roll_no, r.semester, c.course_code;
`;

const results = await pool.query(query, [
  roll_number,
  batch.rows[0].batch,
  acad_year,
  semester
]);

// Object to group students by their roll numbers
const structuredResults = {};

// Process each row and group by student and semester
results.rows.forEach(row => {
  const {
    rollno,
    name,
    prog,
    campus,
    batch,
    semester,
    course_code,
    course_name,
    credit,
    marks,
    month_year
  } = row;

  // If the student doesn't exist in the structure, create an entry for them
  if (!structuredResults[rollno]) {
    structuredResults[rollno] = {
      roll_no: rollno,
      name,
      prog,
      campus,
      batch,
      semesters: {}
    };
  }

  // If the semester doesn't exist for the student, create an entry for the semester
  if (!structuredResults[rollno].semesters[semester]) {
    structuredResults[rollno].semesters[semester] = {
      semester,
      courses: []
    };
  }

  // Add the course details to the correct semester
  structuredResults[rollno].semesters[semester].courses.push({
    course_code,
    course_name,
    credit,
    marks,
    month_year
  });
});

// Convert the student data into an array for easier access
const resultArray = Object.values(structuredResults).map(student => ({
  ...student,
  semesters: Object.values(student.semesters)  // Convert semesters object to array
}));
    // Return the results
    res.json(resultArray[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error finding data" });
  }
};

const pushdata = async (req, res) => {
  try {
    const {
      roll_number,
      name,
      program,
      campus,
      batch,
      acad_year,
      semester,
      course_code,
      credit,
      course_name,
      marks,
      month_year,
    } = req.body;
    const blocked_result = [];
    const query1 = `INSERT INTO studentinfo(roll_no,name,prog, campus, batch,blocked_result)
    VALUES($1, $2, $3, $4, $5, $6)
    ON CONFLICT (roll_no)
    DO UPDATE SET
    name = $2,
    prog = $3, campus = $4, batch = $5
    `;
    const studentinsert = await pool.query(query1, [
      roll_number,
      name,
      program,
      campus,
      batch,
      JSON.stringify(blocked_result),
    ]);

    const query2 = `INSERT INTO course(course_code, credit, course_name)
      VALUES ($1,$2,$3)
    ON CONFLICT (course_code)
    DO UPDATE SET
      credit = $2,
      course_name = $3
    `;
    const courseinsert = await pool.query(query2, [
      course_code,
      credit,
      course_name,
    ]);

    const query3 = `INSERT INTO result(roll_no, semester, acad_year, course_code,marks, month_year)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (roll_no, course_code, acad_year, semester)
    DO UPDATE SET
    marks = $5, month_year = $6
    `;

    const resultinsert = await pool.query(query3, [
      roll_number,
      semester,
      acad_year,
      course_code,
      marks,
      month_year,
    ]);
    res.status(200).json({ message: "Data pushed successfully" });
  } catch (error) {
    console.error(error);
    res.status(501).json({
      message: "Error pushing data",
    });
  }
};

const blockresult = async (req, res) => {
  try {
    const { roll_number, block_result } = req.body;
    // console.log("---------------------------------",block_result)
    const query = `UPDATE studentinfo SET blocked_result = $1 WHERE roll_no = $2`;
    const result = await pool.query(query, [
      JSON.stringify(block_result),
      roll_number,
    ]);
    res.status(200).json({ message: "Blocked result updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(501).json({
      message: "Error updating blocked result",
    });
  }
};

const unblockresult = async (req, res) => {
  try {
    const { roll_number, unblock_result } = req.body;

    // Loop through the unblock_result array and remove each element
    let query = `
      SELECT blocked_result FROM studentinfo WHERE roll_no = $1 
    `;


    const fetchblocked = await pool.query(query, [roll_number]);

    const blocked_result = arrayDifference(
      fetchblocked.rows[0]["blocked_result"],
      unblock_result
    );

    const query1 = `UPDATE studentinfo SET blocked_result = $1 WHERE roll_no = $2`;
    const result = await pool.query(query1, [
      JSON.stringify(blocked_result),
      roll_number,
    ]);

    res.status(200).json({ message: "Unblocked result updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(501).json({ message: "Error updating unblocked result" });
  }
};

module.exports = {
  fetchresult,
  pushdata,
  blockresult,
  unblockresult,
  fetchsemester
};
