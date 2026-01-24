const { includes } = require("lodash");
const db = require("../models/index");
const Employee = db.models.Employee;
const EmpTrans = db.models.EmpTrans;
const { Op } = require("sequelize");

module.exports = {
  add: async (req, res) => {
    try {
      const { name, jobTitle, shift, salary } = req.body;
      if (!name) return res.status(400).json("enter all feilds");

      const existing = await Employee.findOne({ where: { name } });
      if (existing) return res.status(400).json("employee exists");

      const emp = await Employee.create({
        name,
        jobTitle: jobTitle !== undefined ? jobTitle : null,
        shift: shift !== undefined ? shift : null,
        fixed_salary: salary !== undefined ? Number(salary) : 0,
        salary: salary !== undefined ? Number(salary) : 0,
      });

      res.json({ success: true, employee: emp });
    } catch (error) {
      throw error;
    }
  },

  getAll: async (req, res) => {
    try {
      const list = await Employee.findAll({ order: [["name", "ASC"]] });
      res.json(list);
    } catch (error) {
      throw error;
    }
  },

  update: async (req, res) => {
    try {
      const { id, name, jobTitle, shift, salary } = req.body;
      if (!id) return res.status(400).json("enter id");

      const emp = await Employee.findByPk(id);
      if (!emp) return res.status(400).json("employee not found");

      if (name && name !== emp.name) {
        const exists = await Employee.findOne({ where: { name } });
        if (exists) return res.status(400).json("employee exists");
      }

      await emp.update({
        name: name !== undefined ? name : emp.name,
        jobTitle: jobTitle !== undefined ? jobTitle : emp.jobTitle,
        shift: shift !== undefined ? shift : emp.shift,
        fixed_salary: salary !== undefined ? Number(salary) : emp.fixed_salary,
      });

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json("enter id");

      const emp = await Employee.findByPk(id);
      if (!emp) return res.status(400).json("employee not found");

      // remove related transactions first
      await EmpTrans.destroy({ where: { EmployeeId: emp.id } });

      await emp.destroy();

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  addEmpTran: async (req, res) => {
    try {
      const { emp_id, type, amount, date } = req.body;
      if (!emp_id || !type || amount === undefined || !date)
        return res.status(400).json("enter all feilds");
      const emp = await Employee.findByPk(emp_id);
      if (!emp) return res.status(400).json("employee not found");

      const amt = Number(amount);

      const tr = await EmpTrans.create({
        EmployeeId: emp.id,
        type,
        amount: amt,
        date,
      });

      // update employee salary
      let newSalary = Number(emp.salary || 0);
      if (type === "اضافة") newSalary += amt;
      else newSalary -= amt;
      if (newSalary < 0) newSalary = 0;

      await emp.update({ salary: newSalary });

      res.json({ success: true, trans: tr, newSalary });
    } catch (error) {
      throw error;
    }
  },

  getEmpTranByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate)
        return res.status(400).json("enter request data");

      const list = await EmpTrans.findAll({
        where: {
          date: { [Op.between]: [startDate, endDate] },
        },
        order: [["date", "DESC"]],
        include: [{ model: Employee, attributes: ["name"] }],
      });

      // Add employee_name to each result
      const result = list.map((item) => ({
        ...item.toJSON(),
        employee_name: item.Employee ? item.Employee.name : null,
      }));
      res.json(result);
    } catch (error) {
      throw error;
    }
  },
  getEmpTran: async (req, res) => {
    try {
      const { emp_id, startDate, endDate } = req.body;
      if (!emp_id) return res.status(400).json("enter emp_id");

      const list = await EmpTrans.findAll({
        where: {
          date: { [Op.between]: [startDate, endDate] },
          EmployeeId: emp_id,
        },
        order: [["date", "DESC"]],
        include: [{ model: Employee, attributes: ["name"] }],
      });

      // Add employee_name to each result
      const result = list.map((item) => ({
        ...item.toJSON(),
        employee_name: item.Employee ? item.Employee.name : null,
      }));
      res.json(result);
    } catch (error) {
      throw error;
    }
  },

  deleteEmpTran: async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json("enter id");

      const tr = await EmpTrans.findByPk(id);
      if (!tr) return res.status(400).json("transaction not found");
      //find employee
      const emp = await Employee.findByPk(tr.EmployeeId);
      if (!emp) return res.status(400).json("employee not found");

      //create transaction for safety
      const tx = await db.sequelize.transaction();
      try {
        let newSalary = Number(emp.salary || 0);
        const amt = Number(tr.amount || 0);

        //check type to update salary
        if (tr.type === "اضافة") newSalary -= amt;
        else newSalary += amt;
        if (newSalary < 0) newSalary = 0;

        //update salary
        await emp.update({ salary: newSalary }, { transaction: tx });
        //delete transaction
        await tr.destroy({ transaction: tx });

        await tx.commit();
        res.json({ success: true, newSalary });
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },
  runNewMonth: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      // set date for new month entry
      const date = req.body.date || new Date().toISOString().slice(0, 10);

      const employees = await Employee.findAll({ transaction: t });

      for (const emp of employees) {
        // create an empTrans of type add with amount 0
        await EmpTrans.create(
          {
            EmployeeId: emp.id,
            type: "اضافة",
            amount: 0,
            date,
          },
          { transaction: t },
        );

        // reset employee salary to fixed_salary
        await emp.update(
          { salary: Number(emp.fixed_salary || 0) },
          { transaction: t },
        );
      }

      await t.commit();
      res.json({ success: true, updated: employees.length });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};
