const express = require("express");
const router = express.Router();

const {
  seedAdmin,
  login,
  logout,
  getProfile,
  updateProfile,
} = require("../controllers/admin.controller");

const {
  getAllRestaurants,
  getRestaurantById,
  approveRestaurant,
  rejectRestaurant,
  suspendRestaurant,
  activateRestaurant,
  deleteRestaurant,
} = require("../controllers/adminRestaurant.controller");

const {
  getAllRiders,
  getSingleRider,
  approveRider,
  rejectRider,
  suspendRider,
  activateRider,
  deleteRider,
  getDashboardStats,
  getRevenueChart,
  getPopularItems,
  getUserRetentionMetrics,
  getRecentOrders,
  getTopRestaurants,
  getPlatformAnalytics,
  listUsers,
  blockUser,
  unblockUser

} = require("../controllers/admin.controller");
const { adminDeleteReview } = require("../controllers/review.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { deleteReviewValidator } = require("../validators/review.validator");
const {
  adminLoginValidator,
  adminUpdateProfileValidator,
  restaurantAdminActionValidator,
  rejectRestaurantValidator,
  riderAdminActionValidator,
  rejectRiderValidator,
  suspendRiderValidator,
  userActionValidator,
} = require("../validators/admin.validator");

router.post("/seed", validate, seedAdmin);
router.post("/login", adminLoginValidator, validate, login);
router.post("/logout", protect, authorize("main-admin"), validate, logout);

router.get("/profile", protect, authorize("main-admin"), getProfile);
router.put("/profile", protect, authorize("main-admin"), adminUpdateProfileValidator, validate, updateProfile);

router.get("/restaurants", protect, authorize("main-admin"), getAllRestaurants);
router.get("/restaurants/:id", protect, authorize("main-admin"), getRestaurantById);
router.put("/restaurants/:id/approve", protect, authorize("main-admin"), restaurantAdminActionValidator, validate, approveRestaurant);
router.put("/restaurants/:id/reject", protect, authorize("main-admin"), rejectRestaurantValidator, validate, rejectRestaurant);
router.put("/restaurants/:id/suspend", protect, authorize("main-admin"), restaurantAdminActionValidator, validate, suspendRestaurant);
router.put("/restaurants/:id/activate", protect, authorize("main-admin"), restaurantAdminActionValidator, validate, activateRestaurant);
router.delete("/restaurants/:id", protect, authorize("main-admin"), deleteRestaurant);


router.get("/riders", protect , authorize("main-admin"), getAllRiders);
router.get("/riders/:riderId", protect, authorize("main-admin"), getSingleRider);
router.put("/riders/:id/approve", protect , authorize("main-admin"), riderAdminActionValidator, validate, approveRider);
router.put("/riders/:id/reject", protect , authorize("main-admin"), rejectRiderValidator, validate, rejectRider);
router.put("/riders/:id/suspend", protect , authorize("main-admin"), suspendRiderValidator, validate, suspendRider);
router.put("/riders/:id/activate", protect , authorize("main-admin"), riderAdminActionValidator, validate, activateRider);
router.delete("/riders/:id", protect , authorize("main-admin"), deleteRider);

router.get("/dashboard/stats", protect , authorize("main-admin"), getDashboardStats);
router.get("/dashboard/revenue", protect , authorize("main-admin"), getRevenueChart);
router.get("/dashboard/popular-items", protect , authorize("main-admin"), getPopularItems);
router.get("/dashboard/user-retention", protect , authorize("main-admin"), getUserRetentionMetrics);
router.get("/dashboard/recent-orders", protect , authorize("main-admin"), getRecentOrders);
router.get("/dashboard/top-restaurants", protect , authorize("main-admin"), getTopRestaurants);
router.get("/analytics", protect, authorize("main-admin"), getPlatformAnalytics);
router.get("/users", protect , authorize("main-admin"), listUsers);
router.put("/users/:id/block", protect , authorize("main-admin"), userActionValidator, validate, blockUser);
router.put("/users/:id/unblock", protect , authorize("main-admin"), userActionValidator, validate, unblockUser);
router.delete(
  "/reviews/:reviewId",
  protect,
  authorize("main-admin"),
  deleteReviewValidator,
  validate,
  adminDeleteReview
);

module.exports = router;
