"use client";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4 from "@mui/icons-material/Brightness4";
import { IconButton } from "@mui/material";
import React, { useState, useRef, ReactNode } from "react";
import ReactToPrint from "react-to-print";
import {
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  SelectChangeEvent,
} from "@mui/material";
// import Navbar from '@/components/Navbar';
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
  abc?: string;
}

function eval_grade(mark: string, credit: number) {
  if (!isNaN(parseFloat(mark)) && typeof parseFloat(mark) == "number") {
    // console.log("1",mark)
    const marks = parseFloat(mark);
    if (credit != 0) {
      console.log("credit", credit);
      if (marks >= 90) return "O";
      else if (marks >= 80) return "A+";
      else if (marks >= 70) return "A";
      else if (marks >= 60) return "B+";
      else if (marks >= 50) return "B";
      else if (marks >= 45) return "C";
      else if (marks >= 40) return "P";
      else return "F";
    } else {
      if (marks >= 40) {
        return "S";
      } else {
        return "N";
      }
    }
  } else {
    return mark;
  }
}

function eval_gp(mark: string) {
  if (typeof parseFloat(mark) == "number") {
    const marks = parseFloat(mark);
    if (marks >= 90) return 10;
    else if (marks >= 80) return 9;
    else if (marks >= 70) return 8;
    else if (marks >= 60) return 7;
    else if (marks >= 50) return 6;
    else if (marks >= 45) return 5;
    else if (marks >= 40) return 4;
    else return 0;
  } else return -1;
}
function tot_sem_cred(courses: Mark[]) {
  let total_credit = 0;
  courses.forEach((course) => {
    if (eval_gp(course.marks)) {
      total_credit += parseFloat(course.credit.toString());
    }
  });
  return total_credit;
}

function sgpa_calc(courses: Mark[]) {
  let total_credit = 0;
  let ci_pi = 0;
  courses.forEach((course) => {
    total_credit +=
      eval_gp(course.marks) == 0 || eval_gp(course.marks) == -1
        ? 0
        : parseFloat(course.credit.toString());
    ci_pi +=
      parseFloat(course.credit.toString()) *
      (eval_gp(course.marks) == 0 || eval_gp(course.marks) == -1
        ? 0
        : eval_gp(course.marks));
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
  const myRef = useRef<HTMLDivElement>(null);
  const [rollNumber, setRollNumber] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [semesters, setSemesters] = useState(["Semester"]);
  const [semester, setSemester] = useState("");

  const [academicYears, setAcademicYears] = useState(["Academic Year"]);
  const [academicYear, setAcademicYear] = useState("");

  const [result, setResult] = useState<Student>();
  const [valid, setValid] = useState(true);

  const componentRef = useRef<HTMLDivElement>(null);

  const [aadhar, setAadhar] = useState<number | null>(null);

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (/^\d{0,12}$/.test(inputValue)) {
      setAadhar(inputValue === "" ? null : Number(inputValue)); // Set as number if valid, or reset to null if empty
    }
  };

  const handleSwitchChange = () => {
    setDarkMode(!darkMode);
  };

  const handleRollChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const roll = e.target.value.toUpperCase();
    setRollNumber(roll);

    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/fetchacadyear?roll_number=${roll}`;
    // console.log(url);

    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json(); // Await response.json() to parse the data
      console.log("acad_year data:", data);
      setAcademicYear("");
      setSemester("");
      setSemesters(["Semester"]);
      setAcademicYears(data); // Log the fetched data
    } catch (error) {
      console.error("Error fetching semester data:", error);
    }
  };

  const handleAcademicYearChange = async (
    e: SelectChangeEvent<string>,
    child: ReactNode
  ) => {
    const acad_year = e.target.value as string;
    setAcademicYear(acad_year);
    // console.log("heheheh",acad_year)
    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/fetchsemester?roll_number=${rollNumber}&acad_year=${acad_year}`;

    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json(); // Await response.json() to parse the data
      // console.log('Semester data:', data);
      if (data == "") {
        setSemesters(["0"]);
      } else {
        setSemesters(data); // Log the fetched data
      }
      setSemester("");
    } catch (error) {
      console.error("Error fetching semester data:", error);
    }
  };

  const handleSubmit = async () => {
    setValid(true);
    if (semester == "0") {
      return;
    }
    if (!rollNumber || !semester || !academicYear || !aadhar) {
      console.error("Please fill in all fields");
      return;
    }
    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/studentresult?roll_number=${rollNumber}&semester=${semester}&acad_year=${academicYear}`;
    // console.log(url)
    const headers = new Headers();
    headers.append("aadhar", `${aadhar}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      setResult(undefined);
      setAcademicYear("");
      setAadhar(null);
      setSemester("");
      setValid(false);
      console.error("Error fetching result data:", error);
    }
    if (result) {
      myRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const renderStudentResults = () => {
    return (
      <div key={result?.semesters[0]?.semester} className="">
        {result?.abc && (
          <div className="font-bold text-sm mt-0">ABC ID : {result?.abc}</div>
        )}
        <div className="flex w-full pt-10">
          <div className="flex w-1/4 justify-center ">
            <img
              src="/dseulogo.png"
              alt="DSEU-LOGO"
              className="w-[34%] h-[69%] "
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
                (A State University Established under Govt. of NCT of Delhi Act
                04 of 2020)
              </div>
            </div>
            <div className="text-center flex flex-col mx-auto">
              <div className="text-lg font-serif p-1">
                Grade sheet of EoSE of{" "}
                <span className="font-bold font-sans">June-2024</span>
              </div>
              <div className="text-base font-bold font-serif mb-4">
                {result?.prog}-Batch{" "}
                <span className="font-sans">{result?.batch}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-[1px] px-3 mx-1 pt-4">
          <div className="student-info mb-4 flex justify-center">
            <div className="w-[80%]">
              <div className="flex justify-between">
                <div className="flex-col">
                  <div className="p-0">
                    Student Name:{" "}
                    <span className="font-bold uppercase">{result?.name}</span>
                  </div>
                  <div className="p-0">
                    Roll No.:{" "}
                    <span className="font-bold">{result?.roll_no}</span>
                  </div>
                </div>
                <div className="flex-col">
                  {result?.father || result?.mother ? (
                    <>
                      {result?.father && (
                        <div className="p-0">
                          Father's Name:{" "}
                          <span className="font-bold uppercase">
                            {result?.father}
                          </span>
                        </div>
                      )}
                      {result?.mother && (
                        <div className="p-0">
                          Mother's Name:{" "}
                          <span className="font-bold uppercase">
                            {result?.mother}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    result?.guardian && (
                      <div className="p-0">
                        Guardian's Name:{" "}
                        <span className="font-bold">{result?.guardian}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="result-table mb-4 w-full flex justify-center">
            <div className="w-[90%] border border-black border-collapse">
              {/* Header */}
              <div className="flex">
                <div className="border border-black text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  S.No
                </div>
                <div className="border border-black text-[11px] p-[6px] w-[15%] flex justify-center font-bold">
                  Course Code
                </div>
                <div className="border border-black text-[11px] p-[6px] w-[35%] flex justify-center font-bold">
                  Course Name
                </div>
                <div className="border border-black text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Credit
                </div>
                <div className="border border-black text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Credit Earned
                </div>
                <div className="border border-black text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Grade
                </div>
                <div className="border border-black text-[11px] p-[6px] w-[10%] flex justify-center font-bold">
                  Grade Point
                </div>
              </div>

              {/* Body */}
              {result?.semesters[0]?.courses.map((mark, index) => (
                <div className="flex" key={index}>
                  <div className="border border-black text-[10px] p-[6px] w-[10%] flex justify-center">
                    {index + 1}
                  </div>
                  <div className="border border-black text-[10px] p-[6px] w-[15%]">
                    {mark.course_code}
                  </div>
                  <div className="border border-black text-[10px] p-[6px] w-[35%]">
                    {mark.course_name}
                  </div>
                  <div className="border border-black text-[10px] p-[6px] w-[10%] flex justify-center">
                    {mark.credit}
                  </div>
                  <div className="border border-black text-[10px] p-[6px] w-[10%] flex justify-center">
                    {eval_gp(mark?.marks) >= 4
                      ? mark.credit
                      : eval_gp(mark?.marks) == -1
                      ? "-"
                      : 0}
                  </div>
                  <div className="border border-black text-[10px] p-[6px] w-[10%] flex justify-center">
                    {eval_grade(mark?.marks, mark?.credit)}
                  </div>
                  <div className="border border-black text-[10px] p-[6px] w-[10%] flex justify-center">
                    {mark.credit != 0 ? eval_gp(mark?.marks) : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-table w-full flex justify-center">
            <div className="flex flex-col w-[90%] border border-black border-collapse">
              <div className="flex">
                <div className="border border-black w-[14.28%] text-[11px] p-2 flex justify-center items-center">
                  Credits earned in this semester
                </div>
                <div className="border border-black w-[14.28%] text-[11px] p-2 flex justify-center items-center">
                  Total credits as on date
                </div>
                <div className="border border-black w-[28.56%] flex flex-col">
                  <div className="text-[11px] p-2 flex justify-center items-center">
                    SGPA
                  </div>
                  <div className="flex justify-evenly">
                    <div className="border border-t-black border-r-black w-[50%] text-[11px] p-2 flex justify-center items-center">
                      Earned
                    </div>
                    <div className="border border-t-black border-l-black w-[50%] text-[11px] p-2 flex justify-center items-center">
                      Grade letter
                    </div>
                  </div>
                </div>
                <div className="border border-black w-[28.56%] flex flex-col">
                  <div className="text-[11px] p-2 flex justify-center items-center">
                    CGPA
                  </div>
                  <div className="flex justify-evenly">
                    <div className="border border-t-black border-r-black flex-1 text-[11px] p-2 flex justify-center items-center">
                      Earned
                    </div>
                    <div className="border border-t-black border-l-black flex-1 text-[11px] p-2 flex justify-center items-center">
                      Grade letter
                    </div>
                  </div>
                </div>
                <div className="border border-black flex-1 text-[11px] p-2 flex justify-center items-center">
                  Grading System
                </div>
              </div>

              <div className="flex">
                <div className="border border-black flex-1 text-[10px] p-2 flex justify-center">
                  {result ? tot_sem_cred(result.semesters[0].courses) : "-"}
                </div>
                <div className="border border-black flex-1 text-[10px] p-2 flex justify-center">
                  -
                </div>
                <div className="border border-black flex-1 text-[10px] p-2 flex justify-center">
                  {result ? sgpa_calc(result.semesters[0].courses) : "-"}
                </div>
                <div className="border border-black flex-1 text-[10px] p-2 flex justify-center">
                  {result
                    ? sem_grade(sgpa_calc(result.semesters[0].courses))
                    : "-"}
                </div>
                <div className="border border-y-black border-x-black flex-1 text-[10px] p-2 flex justify-center">
                  -
                </div>
                <div className="border border-y-black border-x-black flex-1 text-[10px] p-2 flex justify-center">
                  -
                </div>
                <div className="border border-y-black border-x-black flex-1 text-[10px] p-2 flex justify-center">
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
      <div
        className={`${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
        } transition duration-500`}
        style={{
          backgroundImage: `url('/back.svg')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "fixed",
        }}
      >
        <Container className="flex flex-col items-center min-h-screen min-w-full p-6 pt-16">
          {/* Header Section */}
          <div className="flex items-center justify-between w-full mb-6">
            <img
              src="/dseulogo.png"
              alt="DSEU Logo"
              className="h-24 w-auto ml-10"
            />
            <div
              className={`font-[1000] font-serif text-5xl mx-auto ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              R E S U L T
            </div>
            <IconButton
              aria-label="Toggle Dark Mode"
              onClick={handleSwitchChange}
              className={`transition duration-300 mr-10 ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4 />}
            </IconButton>
          </div>

          {/* Form Section */}
          <Box
            component="form"
            noValidate
            autoComplete="off"
            className={`p-10 bg-white bg-opacity-30 border border-gray-500 rounded-[40px] flex flex-col justify-between items-center gap-8 w-full max-w-[90%] md:max-w-[75%] lg:max-w-[60%] mt-5 ${
              darkMode ? "bg-gray-800 bg-opacity-30" : "bg-white bg-opacity-30"
            }`}
            style={{
              backdropFilter: "blur(2px)",
            }}
          >
            {/* Roll Number Input */}
            <TextField
              label="ROLL NUMBER ..."
              type="text"
              value={rollNumber}
              onChange={handleRollChange}
              fullWidth
              margin="normal"
              className={`${
                darkMode ? "bg-gray-300" : "bg-gray-50"
              } rounded w-[95%]`}
              InputProps={{
                sx: {
                  "& input": {
                    padding: "16px",
                    borderRadius: "10px",
                    fontSize: "16px",
                  },
                },
              }}
            />

            {/* Aadhar Number Input */}
            <TextField
              label="AADHAR NUMBER"
              type="text"
              value={aadhar !== null ? aadhar : ""}
              onChange={handleAadharChange}
              fullWidth
              margin="normal"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              className={`${
                darkMode ? "bg-gray-300" : "bg-gray-50"
              } rounded w-[95%]`}
              InputProps={{
                sx: {
                  "& input": {
                    padding: "16px",
                    borderRadius: "10px",
                    fontSize: "16px",
                  },
                },
              }}
            />

            {/* Academic Year Dropdown */}
            <FormControl
              fullWidth
              margin="normal"
              className={`${
                darkMode ? "bg-gray-300" : "bg-gray-50"
              } rounded-xl w-[95%]`}
            >
              <InputLabel id="academic-year-label">ACADEMIC YEAR</InputLabel>
              <Select
                labelId="academic-year-label"
                value={academicYear}
                label="Academic Year"
                onChange={handleAcademicYearChange}
                className={`${darkMode ? "bg-gray-300" : "bg-gray-50"}`}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "16px",
                    borderRadius: "10px",
                    fontSize: "16px",
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
            <FormControl
              fullWidth
              margin="normal"
              className="bg-gray-50 rounded-xl w-[95%]"
            >
              <InputLabel id="semester-label">BRANCH</InputLabel>
              <Select
                labelId="semester-label"
                value={semester}
                label="Semester"
                onChange={(e) => setSemester(e.target.value)}
                className={`${
                  darkMode ? "bg-gray-300" : "bg-gray-50"
                } `}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "16px",
                    borderRadius: "10px",
                    fontSize: "16px",
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
              className={`px-10 py-4 rounded-xl font-bold transition duration-300 shadow-md transform hover:scale-105 ${
                darkMode
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                  : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
              } text-white`}
            >
              Submit
            </Button>
          </Box>

          {/* Result and Print Section */}
          {result ? (
            <>
              <div id="result" ref={myRef} className="min-w-full">
                <ReactToPrint
                  trigger={() => (
                    <Button className="mt-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md">
                      Print PDF
                    </Button>
                  )}
                  content={() => componentRef.current!}
                />
                <div
                  ref={componentRef}
                  className={`w-full h-full rounded-xl shadow-lg mt-1 p-8 ${
                    darkMode
                      ? "bg-white text-gray-900"
                      : "bg-white text-gray-900"
                  }`}
                >
                  {renderStudentResults()}
                </div>
              </div>
            </>
          ) : (
            <div
              className={`mt-10 font-semibold text-lg ${
                valid ? "text-gray-500" : "text-red-900"
              }`}
            >
              {!valid
                ? "Credentials Mismatch"
                : semesters[0] === "0"
                ? "Result Not Available Kindly Contact Campus Director"
                : "Nothing to show"}
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default StudentDetails;
