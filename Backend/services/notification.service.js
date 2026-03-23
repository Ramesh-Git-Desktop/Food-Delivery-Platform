


const Notification = require("../models/Notification");

const createNotification = async (userId, role, title, message) => {

  let roleModel;

  if (role === "user") roleModel = "User";
  else if (role === "main-admin") roleModel = "Admin";
  else if (role === "restaurant-admin") roleModel = "RestaurantAdmin";
  else if (role === "rider") roleModel = "Rider";
  else throw new Error("Invalid role");

  const notification = await Notification.create({
    userId,
    role,
    roleModel,
    title,
    message
  });

  return notification;

};

module.exports = { createNotification };