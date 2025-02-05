export interface Mark {
  marks_obtained(marks_obtained: any): unknown;
  course_code: string;
  course_name: string;
  credit: number;
  marks: string;
  month_year: string;
  full_mark: number;
  grade_point: number;
  grade: string;
}

export interface SemesterResult {
  semester: number;
  courses: Mark[];
  sgpa: number;
  sem_grade: string;
  academic_year: string;
}

export interface Student {
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
