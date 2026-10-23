const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected.");
      return;
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      "MongoDB Connected Successfully"
    );
  } catch (error) {
    console.error(
      "MongoDB Connection Failed:"
    );

    console.error(error);

    process.exit(1);
  }
};

module.exports = connectDB;