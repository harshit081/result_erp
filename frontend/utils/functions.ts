import { SelectChangeEvent } from "@mui/material";
import { Mark, Student } from "./interfaces";
import { ReactNode } from "react";

export function eval_grade(mark: string, credit: number) {
  if (!isNaN(parseFloat(mark)) && typeof parseFloat(mark) == "number") {
    const marks = parseFloat(mark);
    if (credit != 0) {
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

export function eval_gp(mark: string) {
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

export function tot_sem_cred(courses: Mark[]) {
  let total_credit = 0;
  courses.forEach((course) => {
    if (eval_gp(course.marks)) {
      total_credit += parseFloat(course.credit.toString());
    }
  });
  return total_credit;
}

export function sgpa_calc(courses: Mark[]) {
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

export function sem_grade(sgpa: number) {
  if (sgpa >= 9.5) return "O";
  else if (sgpa >= 8.5) return "A+";
  else if (sgpa >= 7.5) return "A";
  else if (sgpa >= 6.5) return "B+";
  else if (sgpa >= 5.5) return "B";
  else if (sgpa >= 4.5) return "C";
  else if (sgpa >= 4) return "P";
  else return "F";
}

export function handleAadharChange(e: React.ChangeEvent<HTMLInputElement>, setAadhar: React.Dispatch<React.SetStateAction<number | null>>) {
  const inputValue = e.target.value;

  if (/^\d{0,12}$/.test(inputValue)) {
    setAadhar(inputValue === "" ? null : Number(inputValue)); // Set as number if valid, or reset to null if empty
  }
}

export async function handleRollChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setRollNumber: React.Dispatch<React.SetStateAction<string>>,
  setAcademicYear: React.Dispatch<React.SetStateAction<string>>,
  setSemester: React.Dispatch<React.SetStateAction<string>>,
  setSemesters: React.Dispatch<React.SetStateAction<string[]>>,
  setAcademicYears: React.Dispatch<React.SetStateAction<string[]>>
) {
  const roll = e.target.value.toUpperCase();
  setRollNumber(roll);

  const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/fetchacadyear?roll_number=${roll}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    setAcademicYear("");
    setSemester("");
    setSemesters(["Semester"]);
    setAcademicYears(data);
  } catch (error) {
    console.error("Error fetching semester data:", error);
  }
}

export async function handleAcademicYearChange(
  e: SelectChangeEvent<string>,
  child: ReactNode,
  rollNumber: string,
  setAcademicYear: React.Dispatch<React.SetStateAction<string>>,
  setSemesters: React.Dispatch<React.SetStateAction<string[]>>,
  setSemester: React.Dispatch<React.SetStateAction<string>>
) {
  const acad_year = e.target.value as string;
  setAcademicYear(acad_year);

  const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/fetchsemester?roll_number=${rollNumber}&acad_year=${acad_year}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    if (data == "") {
      setSemesters(["0"]);
    } else {
      setSemesters(data);
    }
    setSemester("");
  } catch (error) {
    console.error("Error fetching semester data:", error);
  }
}

export async function handleSubmit(
  semester: string,
  rollNumber: string,
  academicYear: string,
  aadhar: number | null,
  setResult: React.Dispatch<React.SetStateAction<Student | undefined>>,
  setAcademicYear: React.Dispatch<React.SetStateAction<string>>,
  setAadhar: React.Dispatch<React.SetStateAction<number | null>>,
  setSemester: React.Dispatch<React.SetStateAction<string>>,
  setValid: React.Dispatch<React.SetStateAction<boolean>>,
  myRef: React.RefObject<HTMLDivElement>,
  result: Student | undefined
) {
  setValid(true);
  if (semester == "0") {
    return;
  }
  if (!rollNumber || !semester || !academicYear || !aadhar) {
    console.error("Please fill in all fields");
    return;
  }
  const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/studentresult?roll_number=${rollNumber}&semester=${semester}&acad_year=${academicYear}`;
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
}
