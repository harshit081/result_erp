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
import { Student, Mark } from "../utils/interfaces"; // Corrected import path
import {
  eval_grade,
  eval_gp,
  tot_sem_cred,
  sgpa_calc,
  sem_grade,
  handleAadharChange,
  handleRollChange,
  handleAcademicYearChange,
  handleSubmit,
} from "../utils/functions"; // Corrected import path

const commonInputClass = "rounded w-full md:w-[95%]";
const commonSelectClass = "rounded-xl w-full md:w-[95%]";
const commonButtonClass = "px-10 py-4 rounded-xl font-bold transition duration-300 shadow-md transform hover:scale-105";
const commonContainerClass = "flex flex-col items-center min-h-screen min-w-full p-6 pt-16";
const commonTableClass = "border border-black text-[11px] p-[6px] flex justify-center";

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

  const handleSwitchChange = () => {
    setDarkMode(!darkMode);
  };

  const renderStudentResults = () => {
    if (!result || !result.semesters || result.semesters.length === 0) {
      return <div>No results available.</div>;
    }

    return (
      <div key={result.semesters[0]?.semester} className="w-full">
        {result.abc && (
          <div className="font-bold text-sm mt-0">ABC ID : {result.abc}</div>
        )}
        <div className="flex flex-col md:flex-row w-full pt-10">
          <div className="flex w-full md:w-1/4 justify-center">
            <img
              src="/dseulogo.png"
              alt="DSEU-LOGO"
              className="w-[50%] md:w-[34%] h-auto"
            />
          </div>
          <div className="w-full md:w-3/4">
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
                {result.prog}-Batch{" "}
                <span className="font-sans">{result.batch}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-[1px] px-3 mx-1 pt-4">
          <div className="student-info mb-4 flex justify-center">
            <div className="w-full md:w-[80%]">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-col">
                  <div className="p-0">
                    Student Name:{" "}
                    <span className="font-bold uppercase">{result.name}</span>
                  </div>
                  <div className="p-0">
                    Roll No.:{" "}
                    <span className="font-bold">{result.roll_no}</span>
                  </div>
                </div>
                <div className="flex-col">
                  {result.father || result.mother ? (
                    <>
                      {result.father && (
                        <div className="p-0">
                          Father's Name:{" "}
                          <span className="font-bold uppercase">
                            {result.father}
                          </span>
                        </div>
                      )}
                      {result.mother && (
                        <div className="p-0">
                          Mother's Name:{" "}
                          <span className="font-bold uppercase">
                            {result.mother}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    result.guardian && (
                      <div className="p-0">
                        Guardian's Name:{" "}
                        <span className="font-bold">{result.guardian}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="result-table mb-4 w-full flex justify-center">
            <div className="w-full md:w-[90%] border border-black border-collapse">
              {/* Header */}
              <div className="flex">
                <div className={`${commonTableClass} w-[10%] font-bold`}>
                  S.No
                </div>
                <div className={`${commonTableClass} w-[15%] font-bold`}>
                  Course Code
                </div>
                <div className={`${commonTableClass} w-[35%] font-bold`}>
                  Course Name
                </div>
                <div className={`${commonTableClass} w-[10%] font-bold`}>
                  Credit
                </div>
                <div className={`${commonTableClass} w-[10%] font-bold`}>
                  Credit Earned
                </div>
                <div className={`${commonTableClass} w-[10%] font-bold`}>
                  Grade
                </div>
                <div className={`${commonTableClass} w-[10%] font-bold`}>
                  Grade Point
                </div>
              </div>

              {/* Body */}
              {result.semesters[0].courses.map((mark: Mark, index: number) => (
                <div className="flex" key={index}>
                  <div className={`${commonTableClass} w-[10%] text-[10px]`}>
                    {index + 1}
                  </div>
                  <div className={`${commonTableClass} w-[15%] text-[10px]`}>
                    {mark.course_code}
                  </div>
                  <div className={`${commonTableClass} w-[35%] text-[10px]`}>
                    {mark.course_name}
                  </div>
                  <div className={`${commonTableClass} w-[10%] text-[10px]`}>
                    {mark.credit}
                  </div>
                  <div className={`${commonTableClass} w-[10%] text-[10px]`}>
                    {eval_gp(mark?.marks) >= 4
                      ? mark.credit
                      : eval_gp(mark?.marks) == -1
                      ? "-"
                      : 0}
                  </div>
                  <div className={`${commonTableClass} w-[10%] text-[10px]`}>
                    {eval_grade(mark?.marks, mark?.credit)}
                  </div>
                  <div className={`${commonTableClass} w-[10%] text-[10px]`}>
                    {mark.credit != 0 ? eval_gp(mark?.marks) : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-table w-full flex justify-center">
            <div className="flex flex-col w-full md:w-[90%] border border-black border-collapse">
              <div className="flex flex-col md:flex-row">
                <div className={`${commonTableClass} w-full md:w-[14.28%] text-[11px] p-2 flex justify-center items-center`}>
                  Credits earned in this semester
                </div>
                <div className={`${commonTableClass} w-full md:w-[14.28%] text-[11px] p-2 flex justify-center items-center`}>
                  Total credits as on date
                </div>
                <div className="border border-black w-full md:w-[28.56%] flex flex-col">
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
                <div className="border border-black w-full md:w-[28.56%] flex flex-col">
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

              <div className="flex flex-col md:flex-row">
                <div className={`${commonTableClass} flex-1 text-[10px] p-2`}>
                  {result ? tot_sem_cred(result.semesters[0].courses) : "-"}
                </div>
                <div className={`${commonTableClass} flex-1 text-[10px] p-2`}>
                  -
                </div>
                <div className={`${commonTableClass} flex-1 text-[10px] p-2`}>
                  {result ? sgpa_calc(result.semesters[0].courses) : "-"}
                </div>
                <div className={`${commonTableClass} flex-1 text-[10px] p-2`}>
                  {result
                    ? sem_grade(sgpa_calc(result.semesters[0].courses))
                    : "-"}
                </div>
                <div className={`${commonTableClass} flex-1 text-[10px] p-2`}>
                  -
                </div>
                <div className={`${commonTableClass} flex-1 text-[10px] p-2`}>
                  -
                </div>
                <div className={`${commonTableClass} flex-1 text-[10px] p-2`}>
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
        <Container className={commonContainerClass}>
          {/* Header Section */}
          <div className="flex items-center justify-between w-full mb-6">
            <img
              src="/dseulogo.png"
              alt="DSEU Logo"
              className="h-24 w-auto ml-10"
            />
            <div
              className={`font-[1000] font-serif text-xl md:text-5xl mx-auto ${
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
              onChange={(e) => handleRollChange(e, setRollNumber, setAcademicYear, setSemester, setSemesters, setAcademicYears)}
              fullWidth
              margin="normal"
              className={`${darkMode ? "bg-gray-300" : "bg-gray-50"} ${commonInputClass}`}
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
              onChange={(e) => handleAadharChange(e as React.ChangeEvent<HTMLInputElement>, setAadhar)}
              fullWidth
              margin="normal"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              className={`${darkMode ? "bg-gray-300" : "bg-gray-50"} ${commonInputClass}`}
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
              className={`${darkMode ? "bg-gray-300" : "bg-gray-50"} ${commonSelectClass}`}
            >
              <InputLabel id="academic-year-label">ACADEMIC YEAR</InputLabel>
              <Select
                labelId="academic-year-label"
                value={academicYear}
                label="Academic Year"
                onChange={(e, child) => handleAcademicYearChange(e, child, rollNumber, setAcademicYear, setSemesters, setSemester)}
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
              className="bg-gray-50 rounded-xl w-full md:w-[95%]"
            >
              <InputLabel id="semester-label">SEMESTER</InputLabel>
              <Select
                labelId="semester-label"
                value={semester}
                label="Semester"
                onChange={(e) => setSemester(e.target.value)}
                className={`${darkMode ? "bg-gray-300" : "bg-gray-50"} `}
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
              onClick={() => handleSubmit(semester, rollNumber, academicYear, aadhar, setResult, setAcademicYear, setAadhar, setSemester, setValid, myRef, result)}
              className={`${commonButtonClass} ${
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
