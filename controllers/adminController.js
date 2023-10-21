const db = require("../models/index");
const Admin = db.models.Admin;
const bcrypt = require("bcryptjs");
const xssFilter = require("xss-filters");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let admin = {
  signup: async (req, res) => {
    try {
      let { username, phoneNum, password } = req.body;
      //check req.body
      if (!(username && phoneNum && password)) {
        return res.status(400).json({ msg: "قم بادخال جميع الحقول" });
      }

      //make sure no admin is replicated
      let admin = await Admin.findOne({ where: { username } });
      if (admin) return res.status(400).json("admin already exist");

      //hash user password
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);

      //save to database
      const newAdmin = await Admin.create({
        username,
        phoneNum,
        password: hashedPassword,
      });

      //send to client
      res.json({
        user: {
          id: newAdmin.id,
          phoneNum: newAdmin.phoneNum,
          email: newAdmin.email,
          username: newAdmin.username,
        },
      });
    } catch (error) {
      console.log(error);
    }
  },
  login: async (req, res) => {
    try {
      let { username, password, deviceId } = req.body;

      if (!username || !password) {
        return res.status(400).json({ msg: "قم بادخال جميع الحقول" });
      }

      //filter input
      (username = xssFilter.inHTMLData(username)),
        (password = xssFilter.inHTMLData(password));

      Admin.findOne({ where: { username } }).then((user) => {
        if (!user) {
          return res.status(400).json({ msg: "المستخدم غير موجود !" });
        }
        //device id check
        if (user.deviceId !== deviceId)
          return res.status(400).json("الجهاز غير مسجل");

        //check user is verified
        if (user.role !== "verified")
          return res.status(400).json("الرجاء انتظار التأكيد من المدرسة");

        bcrypt.compare(password, user.password).then((isMatch) => {
          if (!isMatch) {
            return res.status(400).json({ msg: "كلمة المرور غير صحيحة" });
          } else {
            //sign user
            jwt.sign(
              { id: user.admin_id },
              process.env.JWTSECRET,
              (err, token) => {
                if (err) throw err;
                res.json({
                  token,
                  user: {
                    id: user.id,
                    phoneNum: user.phoneNum,
                    username: user.username,
                  },
                });
              }
            );
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getbyid: async (req, res) => {
    Admin.findOne({ where: { admin_id: req.user.id } })
      .then((user) => {
        res.json({
          username: user.username,
          phoneNum: user.phoneNum,
        });
      })
      .catch((err) => console.log(err));
  },
  delete_user: async (req, res) => {
    try {
      let { username } = req.body;

      await Admin.destroy({ where: { username } });
      res.json("deleted successfully");
    } catch (error) {
      if (error) throw error;
      console.log(error);
    }
  },
};

module.exports = admin;
