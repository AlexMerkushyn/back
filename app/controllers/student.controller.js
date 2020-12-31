const db = require("../models");
const Student = db.student;
const Op = db.Sequelize.Op;


exports.create =async (req, res, next) => {  //create a new student
    

try {
    await Student.upsert(req.body.student);
    next();
  } catch (error) {
    res.status(404).send("canot create new account");
  }

}

exports.update = (req, res)=>{ //update the student 
    const accountId = req.params.accountId;
    Student.update(req.body, {where:{accountId:accountId}}).then(d=>{res.send(d)}).catch(e=>{res.status(299).send(e)})
}

exports.findByFacultyId = (req, res) => {
    const accountId = req.params.accountId;
    /*
    db.faculty.findAll({include: [{model: db.account}, {model:db.student}]}).then(result=>{
        res.send(result);
    })
    
   db.faculty.findByPk(accountId, {where: {accountId: facultyId}, attributes: ['accountId']}).then
Student.findAll({where: {facultyId: facultyId}}).then(d=>{res.status(298).send(d)}).catch({msg: "error"})
*/

db.faculty.findOne({where:{accountId: accountId}, attributes:['id']}).then(result=>{
    db.account.findAll({include: [{model: db.student, where: {facultyId: result.id}}], attributes: { exclude: ["password"] }}).then(result=>{
        res.send(result);
    })
})

}

exports.findByProjectId = (req, res) => {
    const projectId = req.params.projectId;
    Student.findAll({where: {projectId: projectId}}, { include: [{model: db.account}], attributes:{exclude:['password']} }).then(d=>{res.status(298).send(d)}).catch({msg: "error"})
}

exports.findByAccountId = (req, res)=>{//
    const accountId = req.params.accountId;
    Student.findOne({where: {accountId: accountId}}).then(d=>{res.status(298).send(d)}).catch({msg: "error"})
}


exports.addStudentToProject = async (req, res) =>{
    const accountId1 = req.params.accountId1, 
    accountId2 = req.params.accountId2, 
    accountId3 = req.params.accountId3;
    await Student.update({projectId: null}, {where:{projectId:req.body.projectId}});
    Student.update(req.body, {where:{accountId: [accountId1, accountId2, accountId3]}}).then(sum=>{
        res.status(200).send(sum);
    })
    
}

exports.studentOfFaculty = (req, res) =>{
    db.faculty.findAll(
        {include:[
            {model: db.student, group:['facultyId']}]}).then(ee => {
                res.send(ee)
            })
}