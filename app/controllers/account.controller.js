const db = require("../models");
const { account } = require("../models");
const Account = db.account;
const Op = db.Sequelize.Op;


exports.createUser = async (req, res, next)=>{
  var pass = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$*';
  var charactersLength = characters.length;
  var length = Math.floor(Math.random() * 10) + 6;
  for (var i = 0; i < length; i++) {
    pass += characters.charAt(Math.floor(Math.random() * charactersLength));
  }


  const account = {
    accountId: req.body.accountId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    sex: req.body.sex,
    password: pass,
    phone: req.body.phone,
    type: req.body.type,
    addres: req.body.addres
  };

  try {
    await Account.upsert(account);
    next();
  } catch (error) {
    res.status(404).send("canot create new account");
  }

}

exports.create = async (req, res) => {
  //create random password

  var pass = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$*';
  var charactersLength = characters.length;
  var length = Math.floor(Math.random() * 10) + 6;
  for (var i = 0; i < length; i++) {
    pass += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  const account = {
    accountId: req.body.accountId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    sex: req.body.sex,
    password: pass,
    phone: req.body.phone,
    type: req.body.type,
    addres: req.body.addres
  };
  if (req.body.type === 'worker' || req.body.type === 'boss') { // create only account
    Account.create(account, { attributes: ['accountId', 'firstName', 'lastName', 'email', 'sex', 'addres', 'phone'] }).then(account => {
      try {
        const mail = require("./mail.controller.js");
      //  mail.sendMail(account.email, "הרשמתך להט אושרה בהצלחה!", "פרטי ההתחברות הם המספר זהות שלך + סיסמא  " + pass); // send mail with new password to account
        res.status(201).send(account);
      } catch (error) {
        res.status(299).send("שגיאה בשליחת מייל");
      }
    }).catch(e => { res.status(299).send(e) })
  }
  else {
    await Account.create(account).then(account => { // expanded account (call this function from other controller)
    const mail = require("./mail.controller.js");
   // mail.sendMail(account.email, "הרשמתך להט אושרה בהצלחה!", "פרטי ההתחברות הם המספר זהות שלך + סיסמא  " + pass); // send mail to new user with password
  })

  }
}


exports.update = (req, res) => {
  const accountId = req.params.accountId;
  const password = req.params.pass;
  Account.findByPk(accountId).then(account => { //find by id 
    if (account) { // if found it
      const bcrypt = require('bcrypt');
      bcrypt.compare(password, account.password, (err, data) => { // check the pasword
        if (err) res.status(299).send("שגיאה לא ידועה" + err);
        if (data) { // if data is true so password is good
          account.update(req.body).then(() => { // update account
            res.send("עודכן בהצלחה");
          }).catch(() => {
            res.status(299).send("שגיאה בעדכון");
          })
        }
        else res.status(299).send("פרטי זיהוי שגויים");
      })
    }
    else res.status(299).send("פרטי זיהוי שגויים");
  }).catch(e => { res.status(298).send("שגיאה לא ידועה") });
};


exports.updatePass = (req, res) => {
  const accountId = req.params.accountId;
  const password = req.params.pass;
  Account.findByPk(accountId).then(account => { //find by id 
    if (account) { // if found it
      const bcrypt = require('bcrypt');
      bcrypt.compare(password, account.password, (err, data) => { // check the pasword
        if (err) res.status(299).send("שגיאה לא ידועה" + err);
        if (data) { // if data is true so password is good
          account.update(req.body).then(() => { // update account
            res.send("עודכן בהצלחה");
          }).catch(() => {
            res.status(299).send("שגיאה בעדכון");
          })
        }
        else res.status(299).send("פרטי זיהוי שגויים");
      })
    }
    else res.status(299).send("פרטי זיהוי שגויים");
  }).catch(e => { res.status(298).send("שגיאה לא ידועה") });
};


exports.findAll = (req, res) => {
  Account.findAll({include:[{model: db.student, attributes: ['projectId', 'facultyId', 'gradeProject', 'finishDate']}, {model: db.mentor, attributes: ['Education', 'WorkLocation', 'resumeName', 'certificateName']}], attributes: { exclude: ["password"] } }).then(account => {
    res.status(298).send(account);
  }).catch(e => {
    res.status(299).send(שגיאה);
  })
}
// Find a single Tutorial with an id
exports.login = (req, res) => {
  const accountId = req.body.accountId;
  const password = req.body.pass;

  Account.findByPk(accountId).then(user => {
    const bcrypt = require('bcrypt');
    bcrypt.compare(password, user.password, (err, data) => { // Compare password from form to real password
      if (err) res.status(404).send("שגיאה לא ידועה" + err);
      else if (data) {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({
          accountId: user.accountId,
          type: user.type
        }, 'access_token', {expiresIn: "1H"})
        res.send({meesege: "succses", token});
      }
      else res.status(401).send("bad pass")
    })
  })
};

exports.findAllByType = (req, res) => { // find all account with same type
  const type = req.params.type;
  Account.findAll({ where: { type: type }, attributes: { exclude: ["password"] } }).then(accounts => {
    res.status(298).send(accounts);
  }).catch(() => {
    res.status(299).send("לא נמצאו רשומות תואמות");
  })
}

exports.delete = (req, res) => { // delete account
  const accountId = req.params.accountId;
  Account.destroy({ where: { accountId: accountId } }).then(account => {
    if (account == 1) res.send("נמחק בהצלחה");
    else res.status(299).send("לא נמצאו רשומות למחיקה");
  }).catch(e => { res.status(299).send("שגיאה לא ידועה") });
}

exports.user = (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.headers.authorization.split(' ')[1];
    const data = jwt.verify(token, 'access_token');
    Account.findByPk(data.accountId, {include: [{model: db.student, attributes: { exclude: ['password']}}]}).then(d=>{res.send({user: d})});
  } catch (error) {
    res.status(404).send("auth faild");
  }
}

exports.findById = (req, res) =>{
  try {
    Account.findByPk(req.params.accountId, {include:[{model: db.student}], attributes: { exclude: ["password"] }}).then(d=>{res.send(d)});
  } catch (error) {
    res.status(404).send("auth faild");
  }
}