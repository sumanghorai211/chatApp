const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/chat_app_07", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Connected to DB");
    });

    connection.on("error", (error) => {
      console.log("Something is wrong in MongoDB ", error);
    });
  } catch (error) {
    console.log("Something is wrong ", error);
  }
}

module.exports = connectDB;
