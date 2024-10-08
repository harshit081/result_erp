// service.js
const pool = require("../db.js");
const queries = require("../query/query.js");
const { arrayDifference } = require("../utils/utils.js"); // Move utility functions to a separate file

const fetchSemesters = async (roll_number, acad_year) => {
	const result1 = await pool.query(queries.fetchSemesters, [
		roll_number,
		acad_year,
	]);
	const result2 = await pool.query(queries.fetchBlockedResult, [roll_number]);
	const semesters = result1.rows.map((row) => parseInt(row.semester));
	const availableSemesters = arrayDifference(
		semesters,
		result2.rows[0]["blocked_result"]
	);
	return availableSemesters;
};

const fetchAcadYears = async (roll_number) => {
	const result = await pool.query(queries.fetchAcadYears, [roll_number]);
	return result.rows.map((row) => row.acad_year);
};

const fetchResult = async (roll_number, semester, acad_year, aadhar) => {
	const aadharNo = await pool.query(queries.fetchAadhar,[roll_number]);

	if(aadharNo.rows[0].aadhar!=aadhar){
		console.log(aadharNo.rows[0].aadhar)
		return(0);
	}

    const batch = await pool.query(queries.fetchBatch, [roll_number]);
	const result = await pool.query(queries.fetchResult, [
        roll_number,
		batch.rows[0].batch,
		acad_year,
		semester,
		aadhar,
	]);
	const structuredResults = {};

	result.rows.forEach((row) => {
		const {
			rollno,
			name,
			mother,
			father,
			guardian,
			abc,
			prog,
			campus,
			batch,
			semester,
			course_code,
			course_name,
			credit,
			marks,
			month_year,
		} = row;
		if (!structuredResults[rollno]) {
			structuredResults[rollno] = {
				roll_no: rollno,
				name,
				father,
				mother,
				guardian,
				abc,
				prog,
				campus,
				batch,
				semesters: {},
			};
		}
		if (!structuredResults[rollno].semesters[semester]) {
			structuredResults[rollno].semesters[semester] = { semester, courses: [] };
		}
		structuredResults[rollno].semesters[semester].courses.push({
			course_code,
			course_name,
			credit,
			marks,
			month_year,
		});
	});

	return Object.values(structuredResults).map((student) => ({
		...student,
		semesters: Object.values(student.semesters),
	}))[0];
};

const pushData = async (data) => {
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
	} = data;
	const blocked_result = [0];
	await pool.query(queries.insertStudent, [
		roll_number,
		name,
		program,
		campus,
		batch,
		JSON.stringify(blocked_result),
	]);
	await pool.query(queries.insertCourse, [course_code, credit, course_name]);
	await pool.query(queries.insertResult, [
		roll_number,
		semester,
		acad_year,
		course_code,
		marks,
		month_year,
	]);
};

const blockResult = async (roll_number, block_result) => {
	await pool.query(queries.updateBlockedResult, [
		JSON.stringify(block_result[0] == null ? [0] : block_result),
		roll_number,
	]);
};

const unblockResult = async (roll_number, unblock_result) => {
	const fetchBlocked = await pool.query(
		`SELECT blocked_result FROM studentinfo WHERE roll_no = $1`,
		[roll_number]
	);
	const blocked_result = arrayDifference(
		fetchBlocked.rows[0]["blocked_result"],
		unblock_result
	);
	await pool.query(queries.updateBlockedResult, [
		JSON.stringify(blocked_result),
		roll_number,
	]);
};
const validateCourses = async (coursesArray) => {
    const conflicts = [];
    
    // Prepare an array of course codes to batch query
    const courseCodes = coursesArray.map(course => course.course_code.trim());

    // Fetch all course details for the course codes in a single query
    const result = await pool.query(
        queries.fetchCourseDetail,
        [courseCodes]
    );

	console.log(result.rows)
    
	// Create a map for easy lookup of course details by course code
    const courseMap = new Map(result.rows.map(course => [course.course_code, course]));

    // Iterate through the coursesArray and compare with the database results
    coursesArray.forEach(({ course_code, course_name, credit }, index) => {
        const dbCourse = courseMap.get(course_code.trim());

        if (dbCourse) {
            const dbName = dbCourse.course_name.trim();
            const dbCredit = dbCourse.credit;

            // Check for discrepancies
            if (dbName !== course_name.trim() || dbCredit !== credit) {
                conflicts.push(index); // Add index to conflicts if there's a mismatch
                console.log(`Conflict at index ${index}: Provided - (${course_name}, ${credit}), DB - (${dbName}, ${dbCredit})`);
            }
        }
    });

    return conflicts;
};

module.exports = {
	fetchSemesters,
	fetchAcadYears,
	fetchResult,
	pushData,
	blockResult,
	unblockResult,
	validateCourses
};
