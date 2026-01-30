const db = require("./models/index");
require("dotenv").config();
const app = require("./index");

//connect to database
(async () => {
  // // helper: authenticate with retries + exponential backoff
  // async function connectWithRetry(sequelize, retries = 3) {
  //   let attempt = 0;
  //   while (attempt <= retries) {
  //     try {
  //       await sequelize.authenticate();
  //       return;
  //     } catch (err) {
  //       attempt++;
  //       if (attempt > retries) throw err;
  //       await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
  //     }
  //   }
  // }

  // // try to connect then sync
  // await connectWithRetry(db.sequelize, 3);
  await db.sequelize.sync();
  console.log("Connected to MySQL");
})();

const Port = process.env.PORT || 3000;
app.listen(Port, () => console.log(`server running on port ${Port}`));
