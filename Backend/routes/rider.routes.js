const express = require("express");
const router = express.Router();

const { uploadFields } = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
    registerRiderValidator,
    loginRiderValidator,
    updateRiderProfileValidator,
    toggleAvailabilityValidator,
    riderOrderActionValidator,
} = require("../validators/rider.validator");

const {
    registerRider,
    loginRider,
    checkApplicationStatus,
    getProfile,
    updateProfile,
    toggleAvailability,
    logoutRider,
    getAvailableOrders,
    acceptOrder,
    markPickedUp,
    markDelivered,
    cancelAssignedOrder,
    getMyOrders,
    getEarnings,
    getDashboardStats,
    getEarningsChart

} = require("../controllers/rider.controller");

/**
 * @swagger
 * tags:
 *   - name: Rider
 *
 * /api/rider/register:
 *   post:
 *     summary: Register rider application
 *     tags: [Rider]
 *     responses:
 *       201:
 *         description: Rider registration submitted
 *
 * /api/rider/login:
 *   post:
 *     summary: Login rider
 *     tags: [Rider]
 *     responses:
 *       200:
 *         description: Login successful
 */


// register
router.post(
"/register",
uploadFields([
{ name: "profilePhoto", maxCount: 1 },
{ name: "drivingLicense", maxCount: 1 },
{ name: "aadharCard", maxCount: 1 },
{ name: "vehicleRC", maxCount: 1 }
]),
registerRiderValidator,
validate,
registerRider
);
router.post("/login", loginRiderValidator, validate, loginRider);
router.get("/status", checkApplicationStatus);
router.get("/profile", protect, authorize("rider"), getProfile);
router.put("/profile", protect, authorize("rider"), updateRiderProfileValidator, validate, updateProfile);
router.put("/toggle-availability", protect, authorize("rider"), toggleAvailabilityValidator, validate, toggleAvailability);
router.post("/logout", validate, logoutRider);
router.get("/orders/available-orders", protect, authorize("rider"), getAvailableOrders);
router.put("/orders/:orderId/accept", protect, authorize("rider"), riderOrderActionValidator, validate, acceptOrder);
router.put("/orders/:orderId/picked-up", protect, authorize("rider"), riderOrderActionValidator, validate, markPickedUp);
router.put("/orders/:orderId/delivered", protect, authorize("rider"), riderOrderActionValidator, validate, markDelivered);
router.put("/orders/:orderId/cancel", protect, authorize("rider"), riderOrderActionValidator, validate, cancelAssignedOrder);
router.get("/orders", protect, authorize("rider"), getMyOrders);
router.get("/earnings", protect, authorize("rider"), getEarnings);
router.get("/dashboard/stats", protect, authorize("rider"), getDashboardStats);
router.get("/dashboard/earnings-chart", protect, authorize("rider"), getEarningsChart);


module.exports = router;
