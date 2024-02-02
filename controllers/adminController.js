const db = require("../models/index");
const Admin = db.models.Admin;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let admin = {
  signup: async (req, res) => {
    try {
      let { username, phoneNum, password, shift } = req.body;
      //check req.body
      if (!(username && phoneNum && password)) {
        return res.status(400).json("قم بادخال جميع الحقول");
      }

      //make sure no admin is replicated
      let admin = await Admin.findOne({ where: { username } });
      if (admin) return res.status(400).json("admin already exist");

      //hash user password
      const salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(password, salt);

      //save to database
      const newAdmin = await Admin.create({
        username,
        phoneNum,
        shift,
        password: hashedPassword,
      });

      //send to client
      res.json({
        statusCode: 200,
        message: "Success",
        data: {
          id: newAdmin.admin_id,
          phoneNum: newAdmin.phoneNum,
          username: newAdmin.username,
        },
      });
    } catch (error) {
      console.log(error);
    }
  },
  login: async (req, res) => {
    try {
      let { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json("قم بادخال جميع الحقول");
      }

      Admin.findOne({ where: { username } }).then((user) => {
        if (!user) {
          return res.status(400).json("المستخدم غير موجود !");
        }

        bcrypt.compare(password, user.password).then((isMatch) => {
          if (!isMatch) {
            return res.status(400).json("كلمة المرور غير صحيحة");
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
                    id: user.admin_id,
                    phoneNum: user.phoneNum,
                    username: user.username,
                    role: user.role,
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
  getAll: async (req, res) => {
    try {
      let managers = await Admin.findAll({
        attributes: { exclude: ["password"] },
        where: { role: "manager" },
      });

      res.json(managers);
    } catch (error) {
      throw error;
    }
  },
  getbyid: async (req, res) => {
    Admin.findOne({ where: { admin_id: req.user.id } })
      .then((user) => {
        res.json({
          statusCode: 200,
          message: "Success",
          data: {
            username: user.username,
            phoneNum: user.phoneNum,
          },
        });
      })
      .catch((err) => console.log(err));
  },
  updatePassword: async (req, res) => {
    try {
      let { admin_id, password, newPassword } = req.body;

      if (!admin_id || !password || !newPassword) {
        return res.status(400).json({ msg: "قم بادخال جميع الحقول" });
      }

      //find and verify admin
      let admin = await Admin.findOne({ where: { admin_id } });

      if (!admin) return res.status(404).json("provide a valid id");
      //match password
      let isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        return res.status(404).json("كلمة المرور الرئيسية غير صحيحة");

      //hash user password
      const salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(newPassword, salt);

      //update admin
      await admin.update({ password: hashedPassword }, { where: { admin_id } });

      res.json("User updated successfully");
    } catch (error) {
      if (error) throw error;
      console.log(error);
    }
  },
  delete_user: async (req, res) => {
    try {
      let { username } = req.body;

      await Admin.destroy({ where: { username } });
      //send response
      res.json("manager deleted");
    } catch (error) {
      if (error) throw error;
      console.log(error);
    }
  },
};

module.exports = admin;
