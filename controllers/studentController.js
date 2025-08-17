const db = require("../config/db");

//Get All student list
const getStudents = async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM students");
    if (!data) {
      return res.status(404).send({
        success: false,
        message: "No Record Found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "All Records Found",
      totalStudents: data[0].length,
      data: data[0],
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "Error in Get All Students api ",
      error,
    });
  }
};

//GET STUDENTS BY ID
getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const [data] = await db.query(`SELECT * FROM students WHERE id=?`, [
      studentId,
    ]);
     if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Record Found against this Id ",
      });
    }
    res.status(200).send({
      success: true,
      message: "Student Record Found",
      data: data[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get Students by Id ",
      error,
    });
  }
};
//CREATE STUDENT
 createStudent = async(req,res)=>{
 try {
    const {name, roll_no,fees,clas, medium} = req.body;
    console.log(`body is ${name},${roll_no},${fees},${clas},${medium}`)
   if( !name || !roll_no || !fees || !clas || !medium){
    return res.status(500).send({
        success: false,
        message: "Please provide all fields"
    })
   }
   const data = await db.query(`INSERT INTO students ( name, roll_no, fees, class , medium) VALUES (? , ? , ?, ?, ? )`,[name, roll_no,fees, clas,medium]);
//    const data = await db.query(`INSERT INTO students (id, name, roll_no, fees, class , medium) VALUES (? ,? , ? , ?, ?, ? )`,[id,name, roll_no,fees, clas,medium]);
    if (!data)
      return res.status(404).send({
        success: false,
        message: "Error in insert query ",
      });
    res.status(200).send({
      success: true,
      message: "New Student data Added",
      data: data[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in inserting data",
      error,
    });
  }
    
 }
//UPDATE STUDENT
 updateStudent = async(req,res)=>{
 try {
    const id= req.params.id;
   if( !id){
    return res.status(404).send({
        success: false,
        message: "Invalid Id or Provide Id"
    })
   }
   const {name,roll_no, fees, medium} = req.body
   const data = await db.query(`UPDATE students SET name=? ,roll_no=?,fees=?,medium=? WHERE id=?`, [name,roll_no,fees,medium,id]);
    if (!data)
      return res.status(404).send({
        success: false,
        message: "Error in Update Data ",
      });
    res.status(200).send({
      success: true,
      message: "Student Record Updated",
      data: data[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Student Data",
      error,
    });
  }
    
 }

 // DELETE STUDENT DATA
 deleteStudent = async(req,res)=>{
 try {
    const id = req.params.id;

   const data = await db.query(`DELETE FROM students WHERE id=?`, [id]);
    if (!data)
      return res.status(404).send({
        success: false,
        message: "Error in delete query ",
      });
    res.status(200).send({
      success: true,
      message: "Student record deleted Successfully!",
      data: data[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Student Data",
      error,
    });
  }
    
 }

module.exports = { getStudents, getStudentById,createStudent,updateStudent ,deleteStudent};
