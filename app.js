const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv");

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Razorpay = require('razorpay');
const { urlencoded, json } = require("body-parser");
app.set('view engine', 'ejs');

var instance = new Razorpay({ key_id: process.env.API_KEY, key_secret: process.env.API_SECRET })

var options = {
  amount: 6000,
  currency: "INR",
};


app.get("/", (req, res) => {

  instance.orders.create(options, function (err, order) {
    if (err) {
      console.log(err);
    }
    else {
      var options = {
        "key_id": process.env.API_KEY,
        "amount": "50000",
        "currency": "INR",
        "name": "WebKart Pvt. Ltd",
        "order_id": order.id,
        "callback_url": "http://localhost:3000/",
      };
      res.render("index", { orderId: order.id, options: options });


    }

  });
})


app.post("/", (req, res) => {
  console.log(req.body);

  let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto.createHmac('sha256', process.env.API_SECRET)
    .update(body.toString())
    .digest('hex');
  console.log("sig received : ", req.body.razorpay_signature);
  console.log("sig generated : ", expectedSignature);
  
  if (expectedSignature === req.body.razorpay_signature){
    console.log("Signature valid");
    res.send("payment succes!");
  }
  else{
    console.log("signature Invalid");
    res.send("Payments Failut")
  }

})
app.listen(3000, () => {
  console.log("server listening at 3000..");
})