"use client";
import React, { useState } from 'react';
import { Container, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box } from '@mui/material';
// require('dotenv').config();


const StudentDetails = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('')
  const [result, setResult] = useState([]);

//   const semesters = []
  const academicYears = [ '2021-22', '2022-23', '2023-24', '2024-25'];

  const handleRollChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const roll = e.target.value.toUpperCase();
    setRollNumber(roll);
  
    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/fetchsemester?roll_number=${roll}`;
    console.log(url);
  
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
  };
  

  const handleSubmit = async () => {
    const url = `${process.env.NEXT_PUBLIC_PSQL_URL}/studentresult?roll_number=${rollNumber}&semester=${semester}&acad_year=${academicYear}`;
    console.log(url)
  
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json(); // Await response.json() to parse the data
      console.log('Result data:', data); // Log the fetched result data
      setResult(data); // Store the result data in state
    } catch (error) {
      console.error('Error fetching result data:', error);
    }
  
    console.log(`Roll Number: ${rollNumber}`);
    console.log(`Semester: ${semester}`);
    console.log(`Academic Year: ${academicYear}`);
  };
  

  return (
    <Container className="flex flex-col items-center min-h-[100vh] min-w-full bg-gradient-to-r from-[#FFEFBA] to-[#FFFFFF] rounded-md">
      <div className=' text-black font-bold text-3xl mt-3'>
        Result
      </div>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        className="bg-white p-8 rounded-lg shadow-lg flex flex-row justify-center items-center gap-6 w-full max-w-[80%] h-[25%] mt-10"
      >

        {/* Roll Number Input */}
        <TextField
          label="Enter Roll Number"
          type="text"
          value={rollNumber}
          onChange={handleRollChange}
          fullWidth
          margin="normal"
          className="bg-white"
          InputProps={{
            sx: {
              '& input': {
                padding: '12px',
                outline: 'none',
              },
            },
            classes:{
            }
          }}
        />

        {/* Academic Year Dropdown */}
        <FormControl fullWidth margin="normal" className="bg-gray-50 rounded-lg">
          <InputLabel id="academic-year-label">Academic Year</InputLabel>
          <Select
            labelId="academic-year-label"
            value={academicYear}
            label="Academic Year"
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-white"
            sx={{
              '& .MuiSelect-select': {
                padding: '12px',
                caretColor: 'transparent',
                outline: 'none',
              },
            classes:{
              input: 'hide-caret',
            }
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
                padding: '12px',
                caretColor: 'transparent',
                outline: 'none',
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
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg h-10 mt-2"
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default StudentDetails;
