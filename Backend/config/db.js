const mongoose = require("mongoose");

const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI;

const connectDB = async () => {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error("Missing MongoDB URI. Set MONGODB_URI in your .env file.");
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);

  return conn.connection;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close(false);
  console.log("MongoDB connection closed");
};

module.exports = {
  connectDB,
  disconnectDB,
};
