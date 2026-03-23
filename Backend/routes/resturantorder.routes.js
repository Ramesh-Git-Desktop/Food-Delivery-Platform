const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { getRestaurantOrders } = require("../controllers/resturantorder.controller");
// const {resturantadminOnly} = require("../middlewares/auth.middleware");
const { getRestaurantOrderById } = require("../controllers/resturantorder.controller");

const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  restaurantOrderActionValidator,
  rejectRestaurantOrderValidator,
} = require("../validators/restaurantOrder.validator");

const { acceptOrder } = require("../controllers/resturantorder.controller");

const { rejectOrder } = require("../controllers/resturantorder.controller");

const { markOrderPreparing } = require("../controllers/resturantorder.controller");
const { markOrderReady } = require("../controllers/resturantorder.controller");


router.put("/:orderId/ready", protect,authorize("resturant-admin"), markOrderReady);
router.put("/:orderId/preparing", protect, authorize("resturant-admin"), markOrderPreparing);

router.put("/:orderId/reject", protect, authorize("restaurant-admin"), rejectRestaurantOrderValidator, validate, rejectOrder);

router.put("/:orderId/accept", protect, authorize("restaurant-admin"), restaurantOrderActionValidator, validate, acceptOrder);

router.get("/:orderId", protect,authorize("restaurant-admin"), getRestaurantOrderById);

router.get("/", protect,authorize("restaurant-admin"), getRestaurantOrders);

module.exports = router;  
