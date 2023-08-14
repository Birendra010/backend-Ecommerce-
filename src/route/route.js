const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const productCotroller = require("../controller/productController");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const midd = require("../middleware/auth");
// const stripeController = require("../controller/stripeController")

//user route
router.post("/signup", userController.signUp);
router.post("/login", userController.loginUser);
router.post("/forgotPassword", userController.forgetPassword);
router.put("/resetPassword/:emailToken", userController.updatePassword);
router.get("/logout", midd.authentication, userController.logout);
router.post("/refresh-token", userController.refreshToken);

//product route
router.post("/product", productCotroller.createProduct);
router.get("/limited-products", productCotroller.getLimitedProducts);
router.get("/popular-products", productCotroller.getPopularProducts);
router.get("/products", productCotroller.getAllproducts);
router.get("/getProductById/:id", productCotroller.getProductById);

//cart route
router.post("/cart", midd.authentication, cartController.createCart);
router.get("/cart", midd.authentication, cartController.getCartDetails);
router.put("/cart", midd.authentication, cartController.updateCart);
// router.put("/local-cart", midd.authentication, cartController.updateCart);





//order route
router.post("/order", midd.authentication, orderController.createOrder);
router.get("/order", midd.authentication, orderController.getOrder);
router.get("/order/:orderId" , midd.authentication,orderController.getOrderById)
router.put("/order/:orderId", midd.authentication, orderController.cancelProductInOrder);
router.put("/order/cancel/:orderId", midd.authentication, orderController.cancelOrder);





///payment
// router.post("/create-payment-intent", stripeController.createPaymentIntent);





router.all("/*", (req, res) => {
  return res
    .status(404)
    .send({ status: false, msg: "   provide a correct end point " });
});

module.exports = router;



