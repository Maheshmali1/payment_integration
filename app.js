const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv");
const createInvoice = require("./invoice");

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Razorpay = require('razorpay');
const { urlencoded, json } = require("body-parser");
app.set('view engine', 'ejs');

var trolley = {
trolleyName : "trolley1",
emailId: "mahinmali2000@gmail.com",
invoice_nr : 1,
subtotal:300,
items :[
  {
    barcodeId : "8901030763908",
    brand : "Vim",
    name :  "Vim Dishwash Bar",
    weight : "135 gm",
    storeCount : 11,
    trolleyCnt :2,
    price: 10
  },
  {
    barcodeId : "8901314010520",
    brand : "Colgate",
    name :  "Colagte Strong teeth",
    weight : "100 gm",
    storeCount : 10,
    trolleyCnt :1,
    price: 66
  },
  {
    barcodeId : "8901030915772",
    brand : "Rin",
    name :  "Rin-soap",
    weight : "110 gm",
    storeCount : 32,
    trolleyCnt :1,
    price: 10
  }
]
}

createInvoice(trolley, "invoice.pdf");

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
    res.send("Payments Failed.")
  }

})
app.listen(3000, () => {
  console.log("server listening at 3000..");
})