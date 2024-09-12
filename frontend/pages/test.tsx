"use client";
import React, { useState, useRef } from "react";
import Papa from "papaparse";
import ReactToPrint from "react-to-print";
import FileUploadButton from "@/components/FIleUploadButton";
import { Button } from "@mui/material";

interface Mark {
  course_code: string;
  course_name: string;
  credit: number;
  full_mark: number;
  marks_obtained: string ;
  date_of_exam: string;
  grade_point: number;
  grade: string;
}

interface SemesterResult {
  semester: number;
  sgpa: number;
  sem_grade: string;
  academic_year: string;
  batch: number | null;
  marks: Mark[];
  // earned_credit: number;
}

interface Student {
  rollno: string;
  name: string;
  program: string;
  category: string;
  campus: string;
  mother?: string;
  father?: string;
  guardian?: string;
  results: SemesterResult[];
  abc_id: string;
}

function tot_sem_cred(courses: Mark[]){
  let total_credit = 0;
  courses.forEach((course) => {
    if(eval_gp(course.marks_obtained)){
      total_credit += parseFloat(course.credit.toString());
    }
  })
  return total_credit;
}
function eval_grade(mark: string, credit: number) {
  if (!isNaN(parseFloat(mark)) && typeof(parseFloat(mark))=="number"){
    // console.log("1",mark)
    const marks = parseFloat(mark)
    if (credit){
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
    // console.log("mark",mark)
    return mark;
  }  
}

function sgpa_calc(marks: Mark[]) {
  let total_credit = 0;
  let ci_pi = 0;
  marks.map((mark) => {
    total_credit += (mark.grade_point==0 || mark.grade_point==-1) ? 0 : mark.credit ;
    ci_pi += mark.credit * ((mark.grade_point==0 || mark.grade_point==-1) ? 0 : mark.grade_point);
  });
  return total_credit > 0 ? parseFloat((ci_pi / total_credit).toFixed(2)) : 0;
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

const Home: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [studentDataJSON, setStudentDataJSON] = useState<Student[] | null>(
    null
  );
  const [completeData, setCompleteData] = useState<any[]>();
  const componentRef = useRef<HTMLDivElement>(null);

  const handleFileConfirmed = (file: File | null, isConfirmed: boolean) => {
    if (file && isConfirmed) {
      parseCSV(file);
    }
  };

  const handleBlockConfirmed = (file: File | null, isConfirmed: boolean) => {
    if (file && isConfirmed) {
      parseBlock(file);
    }
  }
  const handlePushBlock = async (row: { "Roll No": string, "Sem": number[] }) => {
    const url = `http://localhost:5000/api/result/blockresult`
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "roll_number": row["Roll No"],
          "block_result": row.Sem
        }),
      })
      // console.log(response)
    } catch (error) {
      console.error(error)
      return error
    }
  }
  const parseBlock = async (file: File) => {
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (rows) => {
          const blockSemesterMap: { [rollNumber: string]: number[] } = {};
          const data = rows.data as { [key: string]: string | number }[];
          try {
            data.forEach((row: any) => {
              // console.log(row)
              const rollNumber: string = row["Roll No"]
              const semesters = parseInt(row.Sem)
              // console.log("sem", typeof semesters, semesters)
              if (!blockSemesterMap[rollNumber]) {
                blockSemesterMap[rollNumber] = [];
              }
              blockSemesterMap[rollNumber].push(semesters);
              // console.log(blockSemesterMap)
            })
            Object.keys(blockSemesterMap).forEach((rollNumber) => {
              handlePushBlock({ "Roll No": rollNumber.toString(), Sem: blockSemesterMap[rollNumber] });
            })
          } catch (e) {
            alert("Invalid format")
          }
        }
      })
    } catch (e) {
      alert("Invalid file format")
    }
  }



  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const students: Student[] = [];

        if (data[0]["Roll No"]) {
          setCompleteData(data)
          parseVerticalStructure(data, students); //TEMPLATE 1
          // console.log(data, "student1", students)
        } else {

          parseVerticalStructure(parseHorizontalStructure(data), students);  //TEMPLATE 2
          setCompleteData(parseHorizontalStructure(data))
          // console.log(parseHorizontalStructure(data), "student2", students)
        }

        setStudentDataJSON(students);
        setIsSubmitted(true);
        // handlePush()
      },
    });
  };

  const parseVerticalStructure = (data: any[], students: Student[]) => {
    data.forEach((row: any) => {
      if (!row["Roll No"] || !row["Sub Name"]) return;

      let student = students.find((s) => s.rollno === row["Roll No"]);

      const mark: Mark = {
        course_code: row["Course Code"],
        course_name: row["Sub Name"],
        credit: parseFloat(row["Credit"]),
        full_mark: parseFloat(row["Full Mark"]),
        marks_obtained: row["Mark Obt"],
        date_of_exam: row["Date of Exam"],
        grade_point: eval_gp(row["Mark Obt"] || 0),
        grade: eval_grade(row["Mark Obt"], parseFloat(row["Credit"])),
      };

      if (student) {
        let semesterResult = student.results.find(
          (r) => r.semester === parseInt(row["Sem"], 10)
        );
        if (!semesterResult) {
          semesterResult = {
            semester: parseInt(row["Sem"], 10),
            academic_year: row["Academic Year"],
            batch: row["Batch"] ? parseInt(row["Batch"], 10) : null,
            marks: [],
            sgpa: 0,
            sem_grade: "",
          };
          student.results.push(semesterResult);
        }
        semesterResult.marks.push(mark);
        semesterResult.sgpa = sgpa_calc(semesterResult.marks);
        semesterResult.sem_grade = sem_grade(semesterResult.sgpa);
      } else {
        const newSemesterResult: SemesterResult = {
          sgpa: 0,
          sem_grade: "",
          semester: parseInt(row["Sem"], 10),
          academic_year: row["Academic Year"],
          batch: row["Batch"] ? parseInt(row["Batch"], 10) : null,
          marks: [mark],
        };

        students.push({
          rollno: row["Roll No"],
          name: row["Std Name"],
          program: row["Program"],
          category: row["Pro Category"],
          campus: row["Inst Name"],
          mother: "mother", //to be updated
          father: "father", //to be updated
          results: [newSemesterResult],
          abc_id: "1234", //to be updated
          guardian: "Guardian", //to be updated
        });
        newSemesterResult.sgpa = sgpa_calc(newSemesterResult.marks);
        newSemesterResult.sem_grade = sem_grade(newSemesterResult.sgpa);
      }
    });
  };

  const parseHorizontalStructure = (data: any[]) => {
    const updatedData: any[] = [];
    const headers = Object.keys(data[0]);
    const creditRow = Object.values(data[3]).slice(6);
    const subjectCodes = Object.values(data[2]).slice(6);
    const subjectNames = Object.values(data[4]).slice(6);

    const newHeaders = [
      "Std Name",
      "Roll No",
      "Inst Name",
      "Pro Category",
      "Program",
      "Sem",
      "Course Code",
      "Credit",
      "Sub Name",
      "Mark Obt",
      "Full Mark",
      "Batch",
      "Academic Year",
      "Date of Exam",
    ];

    for (var k = 5; k < data.length; k++) {
      const val = Object.values(data[k]);
      console.log(val)
      for (var i = 0; i < subjectCodes.length; i++) {
        let flag = 0;
        let obj: { [key: string]: any } = {};
        for (var j = 0; j < 14; j++) {
          if (j <= 5) {
            obj[newHeaders[j]] = val[j];
          } else if (j == 10) {
            obj[newHeaders[j]] = 100;
          } else if (j == 11) {
            obj[newHeaders[j]] = headers[0];
          } else if (j == 12) {
            obj[newHeaders[j]] = data[0][headers[0]];
          } else if (j == 13) {
            obj[newHeaders[j]] = data[1][headers[0]];
          } else if (j == 6) {
            obj[newHeaders[j]] = subjectCodes[i];
          } else if (j == 7) {
            obj[newHeaders[j]] = creditRow[i];
          } else if (j == 8) {
            obj[newHeaders[j]] = subjectNames[i];
          } else if (j == 9) {
            if (val[6 + i]) {
              obj[newHeaders[j]] = val[6 + i];
            } else {
              flag = 1
            }
          }
        }
        if (flag) {
          flag = 0
          continue;
        } else {
          updatedData.push(obj)
        }
      }
    }
    return updatedData;
  };

  const pushData = async (studentdata: any) => {
    // console.log("single",studentdata)
    try {

      const url = `http://localhost:5000/api/result/pushdata`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roll_number: studentdata["Roll No"],
          name: studentdata["Std Name"],
          program: studentdata["Pro Category"] + ' ' + studentdata["Program"],
          campus: studentdata["Inst Name"],
          batch: studentdata["Batch"],
          acad_year: studentdata["Academic Year"],
          semester: studentdata["Sem"],
          course_code: studentdata["Course Code"],
          credit: studentdata["Credit"],
          course_name: studentdata["Sub Name"],
          marks: studentdata["Mark Obt"],
          month_year: studentdata["Date of Exam"],
        }),
      });
      return(response.ok ? (true) : (false))
    } catch (e) {
      alert("Invalid file type")
    }
  }
  const handlePush = async () => {
    const studData = completeData ? completeData : [];
    let studentsdata;
    if (studData[0]["Roll No"]) {
      studentsdata = studData;
    } else {
      studentsdata = parseHorizontalStructure(studData);
    }
    let successCount = 0;
    try {
      studentsdata.map((studentdata) => {
        console.log(studentdata)
        pushData(studentdata).then((success) => {
          if (success) {
            successCount++;
          }
        });
      });
      // Wait for all promises to resolve
      await Promise.all(studentsdata.map((studentdata) => pushData(studentdata)));
      if (successCount === studentsdata.length) {
        alert("All rows successfully pushed!");
      } else {
        alert("Some rows failed to push. Please check the data.");
      }
    } catch (e) {
      alert("Invalid format");
      return;
    }
  };

  const renderStudentResults = (student: Student) => {
    return student.results.flatMap((result) => (
      <div key={result.semester} className="page-break my-4">
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
                (A State University Established under Govt. of NCT of Delhi Act
                04 of 2020)
              </div>
            </div>
            <div className="text-center flex flex-col mx-auto">
              <div className="text-xl font-serif p-1">
                Grade sheet of EoSE of{" "}
                <span className="font-bold font-sans">June-2024</span>
              </div>
              <div className="text-lg font-bold font-serif mb-4">
                {student.program}-Batch{" "}
                <span className="font-sans">{result.batch}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-[1px] px-4 mx-4 pt-4 ">
          <div className="student-info mb-4 flex justify-center">
            <div className="w-[80%] ">
              <div className="flex justify-between">
                <div className="flex-col">
                  <div className=" p-0">
                    Student Name :{" "}
                    <span className="font-bold uppercase">{student.name}</span>
                  </div>
                  <div className=" p-0  ">
                    Roll No. :{" "}
                    <span className="font-bold">{student.rollno}</span>
                  </div>
                </div>
                <div className="flex-col">
                  {student.father || student.mother ? (
                    <div>
                      {" "}
                      {student.father ? (
                        <div className="p-0">
                          Father's Name :{" "}
                          <span className="font-bold uppercase">{student.father}</span>
                        </div>
                      ) : (
                        ""
                      )}{" "}
                      {student.mother ? (
                        <div className="p-0">
                          Mother's Name :{" "}
                          <span className="font-bold uppercase">{student.mother}</span>
                        </div>
                      ) : (
                        ""
                      )}{" "}
                    </div>
                  ) : (
                    <div className="p-0">
                      Guadian's Name :{" "}
                      <span className="font-bold">{student.guardian}</span>
                    </div>
                  )}
                  {/* <div className=" p-2">Mother's Name : {student.mother}</div> */}
                </div>
              </div>
            </div>
          </div>

          <div className="result-table mb-4 w-full flex justify-center ">
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
              {result.marks.map((mark, index) => (
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
                    {mark.grade_point >= 4 ? mark.credit : 0}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[10%] flex justify-center">
                    {mark.grade}
                  </div>
                  <div className="border text-[10px] p-[6px] w-[10%] flex justify-center">
                    {mark.credit ? mark.grade_point : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-table w-full flex justify-center bottom-0 ">
            <div className="flex flex-col w-[90%] border border-collapse">
              {/* Header */}
              <div className="flex">
                <div className="border w-[14.28%] text-[11px] p-2">
                  <div className="flex w-full h-full justify-center items-center">
                    Credits earned in this semester
                  </div>
                </div>
                <div className="border w-[14.28%] text-[11px] p-2">
                  <div className="flex w-full h-full justify-center items-center">
                    Total credits as on date
                  </div>
                </div>
                <div className="border w-[28.56%] flex flex-col">
                  <div className="text-[11px] p-2">
                    <div className="flex w-full h-full justify-center items-center">
                      SGPA
                    </div>
                  </div>
                  <div className="flex justify-evenly">
                    <div className="border w-[50%] text-[11px] p-2">
                      <div className="flex w-full h-full justify-center items-center">
                        Earned
                      </div>
                    </div>
                    <div className="border w-[50%] text-[11px] p-2">
                      <div className="flex w-full h-full justify-center items-center">
                        Grade letter
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border w-[28.56%] flex flex-col">
                  <div className="text-[11px] p-2">
                    <div className="flex w-full h-full justify-center items-center">
                      CGPA
                    </div>
                  </div>
                  <div className="flex justify-evenly">
                    <div className="border w-[50%] text-[11px] p-2">
                      <div className="flex w-full h-full justify-center items-center">
                        Earned
                      </div>
                    </div>
                    <div className="border w-[50%] text-[11px] p-2">
                      <div className="flex w-full h-full justify-center items-center">
                        Grade letter
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border flex-1 text-[11px] p-2">
                  <div className="flex w-full h-full justify-center items-center">
                    Grading System
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex">
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  {tot_sem_cred(result.marks)}
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  -
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  {result.sgpa}
                </div>
                <div className="border flex-1 text-[10px] p-2 flex justify-center">
                  {result.sem_grade}
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
    ));
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Page Wrapper */}
        <div className="pt-[70px] max-sm:pt-[150px] px-4 sm:mx-[50px]">
  
          {/* Header Section */}
          <div className="bg-blue-900 py-4 px-6 sm:mx-8 rounded-lg shadow-lg">
            <h1 className="text-3xl text-white font-extrabold text-center">Teacher Dashboard: Student Results</h1>
          </div>
  
          {/* Upload Sections */}
          <div className="p-6 sm:flex justify-between mt-12 space-y-8 sm:space-y-0 sm:space-x-6">
  
            {/* Upload Student Result */}
            <div className="w-full sm:w-[48%] bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Student Result</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload the student results file in the supported format. Ensure all details are accurate before submission.
              </p>
              <FileUploadButton onConfirm={handleFileConfirmed} />
            </div>
  
            {/* Upload Block Result */}
            <div className="w-full sm:w-[48%] bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Block Result</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload the block result file here. Ensure the block data corresponds to the correct student groups.
              </p>
              <FileUploadButton onConfirm={handleBlockConfirmed} />
            </div>
          </div>
  
          {/* Action Buttons */}
          {isSubmitted && studentDataJSON && (
            <div className="flex space-x-6 mt-10 ml-6">
              <Button
                variant="contained"
                color="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow-md transition-colors duration-200 ease-in-out"
                onClick={handlePush}
              >
                Push Results
              </Button>
  
              <ReactToPrint
                trigger={() => (
                  <Button
                    variant="contained"
                    color="primary"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow-md transition-colors duration-200 ease-in-out"
                  >
                    Print PDF
                  </Button>
                )}
                content={() => componentRef.current!}
              />
            </div>
          )}
  
          {/* Display Student Results */}
          {isSubmitted && studentDataJSON && (
            <div ref={componentRef} className="bg-white p-6 mt-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Student Results Overview</h2>
              {studentDataJSON.map((student) => renderStudentResults(student))}
            </div>
          )}
        </div>
      </div>
    </>
  );
  
  
};

export default Home;