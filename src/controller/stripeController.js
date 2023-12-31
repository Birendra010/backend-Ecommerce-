
const stripe = require("stripe")("sk_test_51NdRYtSD97XjtBD2OyoG1tyUGQIO1Mt4StlzIjMwINUdD5DSjXO7Q0c3KuTPEcN4BtkvAQevpJgY7ftlSnVGdCdu008pNOAnIs");
const mailTrackId = require("../validators/sendOrderSummaryMail")
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");




const payment = async (req, res, next) => {
  try {

    let items = req.body.items
    let session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: req.body.items.items.map((item) => ({
        price_data: {
          currency: "INR",
          product_data: {
            name: item.productId.title,
            images: item.productId.images,
          },
          unit_amount: item.productId.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.HOST_URL}/success`,
      cancel_url: `${process.env.HOST_URL}/failed`,
    });
    if (req.body.form.email) {
      let order = await orderModel.findOne({
        email: req.body.form.email,
        paymentStatus: "payment_pending",
      })

      if (order) {
        order.paymentId = session.id;
    
        await order.save();
      }
    } else {
      let order = await orderModel.findOne({
        userId: items.userId,
        paymentStatus :"payment_pending"
      });
      if (order) {
        order.paymentId = session.id;
        await order.save();
      }
    }
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

const paymentStatus =  async (req, res) => {
  try {
    const c_id = req.body.id;

    let session = await stripe.checkout.sessions.retrieve(c_id);
    let paymentIntent = "";
    if (session.payment_intent) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      paymentIntent = paymentIntent.status;
    } else {
      paymentIntent = "payment_failed";
    }
    let order = await orderModel.findOne({ paymentId: c_id }).populate(["items.productId","userId"])
    // console.log(order);
    if (order) {
      // if payment failed then update product stocks
      if (paymentIntent === "payment_failed") {
        order.items.forEach(async (item) => {
          await productModel.findByIdAndUpdate(
            item.productId._id,
            { $inc: { stock: +item.quantity } },
            { new: true }
          );
        });
      } else {
        items = order;
        await mailTrackId(order.userId.email , order)
      }
      order.paymentStatus = paymentIntent;
      await order.save();
    }

 return res.status(200).json({paymentIntent : paymentIntent , orderId : order._id});
  //  console.log("respo",respo)
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  paymentStatus,
  payment,
};



