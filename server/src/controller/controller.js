const studentService = require('../service/service.js');

const fetchSemester = async (req, res) => {
  try {
    const { roll_number, acad_year } = req.query;
    console.log("fetchSemester")
    const semesters = await studentService.fetchSemesters(roll_number, acad_year);
    console.log("fetchSemester2")
    res.json(semesters);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const fetchAcadYear = async (req, res) => {
  try {
    const { roll_number } = req.query;
    const years = await studentService.fetchAcadYears(roll_number);
    res.json(years);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const fetchResult = async (req, res) => {
  try {
    const { roll_number, semester, acad_year } = req.query;
    const result = await studentService.fetchResult(roll_number, semester, acad_year);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Error finding data" });
  }
};

const pushData = async (req, res) => {
  try {
    await studentService.pushData(req.body);
    res.status(200).json({ message: "Data pushed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error pushing data" });
  }
};

const blockResult = async (req, res) => {
  try {
    const { roll_number, block_result } = req.body;
    await studentService.blockResult(roll_number, block_result);
    res.status(200).json({ message: "Blocked result updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating blocked result" });
  }
};

const unblockResult = async (req, res) => {
  try {
    const { roll_number, unblock_result } = req.body;
    await studentService.unblockResult(roll_number, unblock_result);
    res.status(200).json({ message: "Unblocked result updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating unblocked result" });
  }
};

module.exports = {
  fetchSemester,
  fetchAcadYear,
  fetchResult,
  pushData,
  blockResult,
  unblockResult
};
