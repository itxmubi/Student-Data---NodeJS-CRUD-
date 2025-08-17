const express = require('express')
const {getStudents, getStudentById, createStudent, updateStudent, deleteStudent,} = require("../controllers/studentController")

//router Object
const router = express.Router()

//routes


//Get student by id 
router.get('/getstudentbyId/:id',getStudentById)

//Get all students list
router.get('/getall',getStudents);

//CREATE STUDENT  || POST
router.post('/createstudent',createStudent)


//UPDATE STUDENT  || PUT
router.put('/update/:id',updateStudent)


//DELETE STUDENT  || DELETE
router.delete('/deleteStudent/:id',deleteStudent)


module.exports = router