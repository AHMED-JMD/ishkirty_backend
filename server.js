const db = require("./models/index");
require("dotenv").config();
const app = require("./index");

//connect to database
(async () => {
  await db.sequelize.sync();
  // const BusinessLocation = db.models.BusinessLocation;
  // const defaultLocation =
  //   process.env.DEFAULT_BUSINESS_LOCATION || "port sudan";
  // if (BusinessLocation) {
  //   await BusinessLocation.findOrCreate({
  //     where: { name: defaultLocation },
  //     defaults: { name: defaultLocation },
  //   });
  // }
  console.log("Connected to MySQL");
})();

const Port = process.env.PORT || 3000;
app.listen(Port, () => console.log(`server running on port ${Port}`));
