"use client";
import React, { useState, useRef, ReactNode } from 'react';
import ReactToPrint from "react-to-print";
import { Container, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, SelectChangeEvent } from '@mui/material';
// require('dotenv').config();

interface Mark {
  course_code: string;
  course_name: string;
  credit: number;
  marks: string;
  month_year: string;
  full_mark: number;
  grade_point: number;
  grade: string;
}

interface SemesterResult {
  semester: number;
  courses: Mark[];
  sgpa: number;
  sem_grade: string;
  academic_year: string;
}

interface Student {
  roll_no: string;
  name: string;
  prog: string;
  campus: string;
  batch: number | null;
  mother?: string;
  father?: string;
  guardian?: string;
  semesters: SemesterResult[];
  abc_id?: string;
}

function eval_grade(mark: string, credit: number) {
  if (!isNaN(parseFloat(mark)) && typeof(parseFloat(mark))=="number"){
    // console.log("1",mark)
    const marks = parseFloat(mark)
    if (credit!=0){
      console.log("credit",credit)
      if (marks >= 90) return "O";
      else if (marks >= 80) return "A+";
      else if (marks >= 70) return "A";
      else if (marks >= 60) return "B+";
      else if (marks >= 50) return "B";
      else if (marks >= 45) return "C";
      else if (marks >= 40) return "P";
      else return "F";
    }
    else{
      if (marks >= 40) {
        return "S";
      } else {
        return "N"
      }
    }
  } 
  else{
    return mark;
  }  
}


function eval_gp(mark: string) {
  if (typeof(parseFloat(mark))=="number"){
    const marks = parseFloat(mark)
    if (marks >= 90) return 10;
    else if (marks >= 80) return 9;
    else if (marks >= 70) return 8;
    else if (marks >= 60) return 7;
    else if (marks >= 50) return 6;
    else if (marks >= 45) return 5;
    else if (marks >= 40) return 4;
    else return 0;
  } 
  else return -1;
}
function tot_sem_cred(courses: Mark[]) {
  let total_credit = 0;
  courses.forEach((course) => {
    if(eval_gp(course.marks)){
      total_credit += parseFloat(course.credit.toString());
    }
  })
  return total_credit;
}


function sgpa_calc(courses: Mark[]) {
  let total_credit = 0;
  let ci_pi = 0;
  courses.forEach((course) => {
    total_credit += ((eval_gp(course.marks) ==0 || eval_gp(course.marks) == -1) ? 0 : parseFloat(course.credit.toString()))
    ci_pi += parseFloat(course.credit.toString()) * ((eval_gp(course.marks) ==0 || eval_gp(course.marks) == -1) ? 0 : eval_gp(course.marks))
  });
  return total_credit > 0 ? parseFloat((ci_pi / total_credit).toFixed(2)) : 0;
}


function sem_grade(sgpa: number) {
  if (sgpa >= 9.5) return "O";
  else if (sgpa >= 8.5) return "A+";
  else if (sgpa >= 7.5) return "A";
  else if (sgpa >= 6.5) return "B+";
  else if (sgpa >= 5.5) return "B";
  else if (sgpa >= 4.5) return "C";
  else if (sgpa >= 4) return "P";
  else return "F";
}

const StudentDetails = () => {
  const [rollNumber, setRollNumber] = useState('');

  const [semesters, setSemesters] = useState(["Semester"]);
  const [semester, setSemester] = useState('')

  const [academicYears, setAcademicYears] = useState(["Academic Year"]);
  const [academicYear, setAcademicYear] = useState('');

  const [result, setResult] = useState<Student>();

  const componentRef = useRef<HTMLDivElement>(null);

  //   const semesters = []

  const handleRollChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const roll = e.target.value.toUpperCase();
    setRollNumber(roll);

    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/fetchacadyear?roll_number=${roll}`;
    // console.log(url);

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json(); // Await response.json() to parse the data
      console.log('acad_year data:', data);
      
      setAcademicYears(data)// Log the fetched data
    } catch (error) {
      console.error('Error fetching semester data:', error);
    }
  };




  const handleAcademicYearChange = async (e : SelectChangeEvent<string>, child: ReactNode) => {
    const acad_year = e.target.value as string;
    setAcademicYear(acad_year);
    console.log("heheheh",acad_year)
    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/fetchsemester?roll_number=${rollNumber}&acad_year=${acad_year}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json(); // Await response.json() to parse the data
      console.log('Semester data:', data);
      setSemesters(data)// Log the fetched data
    } catch (error) {
      console.error('Error fetching semester data:', error);
    }
  }


  const handleSubmit = async () => {
    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/studentresult?roll_number=${rollNumber}&semester=${semester}&acad_year=${academicYear}`;
    // console.log(url)

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json(); // Await response.json() to parse the data
      // console.log('Result data:', data); // Log the fetched result data
      setResult(data); // Store the result data in state
      // console.log(result); 
    } catch (error) {
      console.error('Error fetching result data:', error);
    }

    console.log(`Roll Number: ${rollNumber}`);
    console.log(`Semester: ${semester}`);
    console.log(`Academic Year: ${academicYear}`);
  };


  const renderStudentResults = () => {
    return (
      <div key={result?.semesters[0]?.semester} className="page-break my-4">
        <div className="flex w-full pt-10">
          <div className="flex w-1/4 justify-center items-center">
            <img
              src="/dseulogo.png"
              alt="DSEU-LOGO"
              className="w-[29%] h-[60%] "
            />
          </div>
          <div>
            <div className="text-center flex flex-col mx-auto p-1 text-[#0072B9]">
              <div className="text-dseublue text-xl font-extrabold font-mono">
                दिल्ली कौशल एवं उद्यमिता विश्वविद्यालय
              </div>
              <div className="text-dseublue text-3xl font-extrabold font-serif">
                Delhi Skill & Entrepreneurship University
              </div>
              <div className="text-dseublue text-md font-extrabold font-serif">
                (A State University Established under Govt. of NCT of Delhi Act 04 of 2020)
              </div>
            </div>
            <div className="text-center flex flex-col mx-auto">
              <div className="text-xl font-serif p-1">
                Grade sheet of EoSE of <span className="font-bold font-sans">June-2024</span>
              </div>
              <div className="text-lg font-bold font-serif mb-4">
                {result?.prog}-Batch <span className="font-sans">{result?.batch}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-[1px] px-4 mx-4 pt-4">
          <div className="student-info mb-4 flex justify-center">
            <div className="w-[80%]">
              <div className="flex justify-between">
                <div className="flex-col">
                  <div className="p-0">
                    Student Name: <span className="font-bold uppercase">{result?.name}</span>
                  </div>
                  <div className="p-0">
                    Roll No.: <span className="font-bold">{result?.roll_no}</span>
                  </div>
                </div>
                <div className="flex-col">
                  {result?.father || result?.mother ? (
                    <>
                      {result?.father && (
                        <div className="p-0">
                          Father's Name: <span className="font-bold uppercase">{result?.father}</span>
                        </div>
                      )}
                      {result?.mother && (
                        <div className="p-0">
                          Mother's Name: <span className="font-bold uppercase">{result?.mother}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-0">
                      Guardian's Name: <span className="font-bold">{result?.guardian}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="result-table mb-4 w-full flex justify-center">
            <div className="w-[90%] border border-collapse">
              {/* Header */}
              <div className="flex">
                <div className="border text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  S.No
                </div>
                <div className="border text-[11px] p-[6px] w-[20%] flex justify-center font-bold">
                  Course Code
                </div>
                <div className="border text-[11px] p-[6px] w-[30%] flex justify-center font-bold">
                  Course Name
                </div>
                <div className="border text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Credit
                </div>
                <div className="border text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Credit Earned
                </div>
                <div className="border text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Grade
                </div>
                <div className="border text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Grade Point
                </div>
              </div>

              {/* Body */}
              {result?.semesters[0]?.courses.map((mark, index) => (

                <div className="flex" key={index}>
                  <div className="border text-[10px] p-[6px] w-[10%] flex justify-center">
                    {index + 1}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[20%]">
                    {mark.course_code}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[30%]">
                    {mark.course_name}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[10%] flex justify-center">
                    {mark.credit}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[10%] flex justify-center">
                    {eval_gp(mark?.marks) >= 4 ? mark.credit : (eval_gp(mark?.marks) == -1 ? "-" : 0)}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[10%] flex justify-center">
                    {eval_grade(mark?.marks,mark?.credit)}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[10%] flex justify-center">
                    {mark.credit !=0 ? eval_gp(mark?.marks) : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-table w-full flex justify-center">
            <div className="flex flex-col w-[90%] border border-collapse">
              <div className="flex">
                <div className="border w-[14.28%] text-[11px] p-2 flex justify-center items-center">
                  Credits earned in this semester
                </div>
                <div className="border w-[14.28%] text-[11px] p-2 flex justify-center items-center">
                  Total credits as on date
                </div>
                <div className="border w-[28.56%] flex flex-col">
                  <div className="text-[11px] p-2 flex justify-center items-center">
                    SGPA
                  </div>
                  <div className="flex justify-evenly">
                    <div className="border w-[50%] text-[11px] p-2 flex justify-center items-center">
                      Earned
                    </div>
                    <div className="border w-[50%] text-[11px] p-2 flex justify-center items-center">
                      Grade letter
                    </div>
                  </div>
                </div>
                <div className="border w-[28.56%] flex flex-col">
                  <div className="text-[11px] p-2 flex justify-center items-center">
                    CGPA
                  </div>
                  <div className="flex justify-evenly">
                    <div className="border w-[50%] text-[11px] p-2 flex justify-center items-center">
                      Earned
                    </div>
                    <div className="border w-[50%] text-[11px] p-2 flex justify-center items-center">
                      Grade letter
                    </div>
                  </div>
                </div>
                <div className="border flex-1 text-[11px] p-2 flex justify-center items-center">
                  Grading System
                </div>
              </div>

              <div className="flex">
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  {result ? tot_sem_cred(result.semesters[0].courses) : "-"}
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  -
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  {result ? sgpa_calc(result.semesters[0].courses) : "-"}
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  {result ? sem_grade(sgpa_calc(result.semesters[0].courses)) : "-"}
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  -
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  -
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  ABS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <>
      <Container className="flex flex-col items-center min-h-screen min-w-full bg-gradient-to-r from-[#FFEFBA] to-[#FFFFFF] p-6">

        {/* Title */}
        <div className="text-gray-900 font-extrabold text-5xl mt-6 tracking-wide text-center">
          Student Results Portal
        </div>

        {/* Form Section */}
        <Box
          component="form"
          noValidate
          autoComplete="off"
          className="bg-white p-10 rounded-xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 w-full max-w-[90%] md:max-w-[70%] mt-12"
        >
          {/* Roll Number Input */}
          <TextField
            label="Enter Roll Number"
            type="text"
            value={rollNumber}
            onChange={handleRollChange}
            fullWidth
            margin="normal"
            className="bg-gray-50 rounded-lg"
            InputProps={{
              sx: {
                '& input': {
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '16px',
                },
              },
            }}
          />

          {/* Academic Year Dropdown */}
          <FormControl fullWidth margin="normal" className="bg-gray-50 rounded-lg">
            <InputLabel id="academic-year-label">Academic Year</InputLabel>
            <Select
              labelId="academic-year-label"
              value={academicYear}
              label="Academic Year"
              onChange={handleAcademicYearChange}
              className="bg-white"
              sx={{
                '& .MuiSelect-select': {
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '16px',
                },
              }}
            >
              {academicYears.map((year, index) => (
                <MenuItem key={index} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Semester Dropdown */}
          <FormControl fullWidth margin="normal" className="bg-gray-50 rounded-lg">
            <InputLabel id="semester-label">Semester</InputLabel>
            <Select
              labelId="semester-label"
              value={semester}
              label="Semester"
              onChange={(e) => setSemester(e.target.value)}
              className="bg-white"
              sx={{
                '& .MuiSelect-select': {
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '16px',
                },
              }}
            >
              {semesters.map((sem, index) => (
                <MenuItem key={index} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
          >
            Submit
          </Button>
        </Box>

        {/* Result and Print Section */}
        {result ? (
          <>
            <ReactToPrint
              trigger={() => (
                <Button className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
                  Print PDF
                </Button>
              )}
              content={() => componentRef.current!}
            />

            <div ref={componentRef} className="w-full h-full bg-white rounded-lg shadow-lg mt-10 p-8">
              {renderStudentResults()}
            </div>
          </>
        ) : (
          <div className="mt-10 text-gray-500 font-semibold text-lg">Nothing to show</div>
        )}
      </Container>
    </>
  );



};

export default StudentDetails;
