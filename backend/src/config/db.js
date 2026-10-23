const mongoose = require("mongoose");
const util = require("node:util");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error(util.inspect(error, { depth: null, colors: true }));
    process.exit(1);

    if (error.reason && error.reason.servers) {
      for (const [server, desc] of error.reason.servers) {
        console.log("Server:", server);
        console.log("Type:", desc.type);
        console.log("Error:", desc.error);
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;