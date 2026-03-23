/*const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "roleModel"
    },

    role: {
        type: String,
        //enum: ["user", "admin", "subadmin", "rider"],
        enum: ["user", "main-admin", "restaurant-admin", "rider"],
        required: true
    },

    roleModel: {
        type: String,
        //enum: ["User", "Admin", "SubAdmin", "Rider"],
        enum: ["user", "main-admin", "restaurant-admin", "rider"],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);*/


const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "roleModel"
  },

  role: {
    type: String,
    enum: ["user", "main-admin", "restaurant-admin", "rider"],
    required: true
  },

  roleModel: {
    type: String,
    enum: ["User", "Admin", "RestaurantAdmin", "Rider"],
    required: true
  },

  title: String,
  message: String,

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);