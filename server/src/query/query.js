// query.js
module.exports = {
	fetchSemesters: `
      SELECT DISTINCT r.semester
      FROM studentinfo s
      LEFT JOIN result r ON s.roll_no = r.roll_no
      WHERE s.roll_no = $1 AND r.acad_year = $2
    `,
	fetchBlockedResult: `SELECT s.blocked_result FROM studentinfo s WHERE s.roll_no = $1`,
	fetchAcadYears: `
      SELECT DISTINCT r.acad_year
      FROM studentinfo s
      LEFT JOIN result r ON s.roll_no = r.roll_no
      WHERE s.roll_no = $1
    `,
	fetchBatch: `SELECT batch FROM studentinfo WHERE roll_no = $1`,
	fetchResult: `
      SELECT s.roll_no AS rollno, s.prog, s.campus, r.semester, r.acad_year AS academic_year, 
      s.batch, c.course_code, c.course_name, c.credit, r.marks, r.month_year, p.name, p.mother, 
      p.father, p.guardian, p.abc 
      FROM studentinfo s 
      LEFT JOIN result r ON s.roll_no = r.roll_no 
      LEFT JOIN course c ON r.course_code = c.course_code 
      LEFT JOIN personalinfo p ON s.roll_no = p.rollno 
      WHERE s.roll_no = $1 AND s.batch = $2 AND r.acad_year = $3 AND r.semester = $4 AND r.aadhar == $4 
      AND r.course_code NOT IN (SELECT * FROM json_array_elements_text(s.blocked_result)) 
      ORDER BY s.roll_no, r.semester, c.course_code
    `,
	insertStudent: `
      INSERT INTO studentinfo(roll_no, name, prog, campus, batch, blocked_result) 
      VALUES($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (roll_no) DO UPDATE SET 
      name = $2, prog = $3, campus = $4, batch = $5
    `,
	insertCourse: `
      INSERT INTO course(course_code, credit, course_name) 
      VALUES ($1,$2,$3) 
      ON CONFLICT (course_code) DO UPDATE SET 
      credit = $2, course_name = $3
    `,
	insertResult: `
      INSERT INTO result(roll_no, semester, acad_year, course_code, marks, month_year) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (roll_no, course_code, acad_year, semester) DO UPDATE SET 
      marks = $5, month_year = $6
    `,
	updateBlockedResult: `UPDATE studentinfo SET blocked_result = $1 WHERE roll_no = $2`,
};
