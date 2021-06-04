const router = require("express").Router();
const { MongoClient, ObjectID } = require("mongodb");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const nodeMailer = require("nodemailer");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const dbUrl = process.env.DB_URL;

router.post("/register", async (req, res) => {
  try {
    let client = await MongoClient.connect(dbUrl);
    let db = client.db("urlShortener");
    let data = await db.collection("users").findOne({ email: req.body.email });

    if (!data) {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      await db.collection("users").insertOne(req.body);
      res.status(200).json({
        message: "User Registration Successful",
      });
    } else {
      res.status(400).json({
        message: "Email ID already registed",
      });
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.get("/login/:email/:password", async (req, res) => {
  try {
    let client = await MongoClient.connect(dbUrl);
    let db = client.db("urlShortener");
    let data = await db
      .collection("users")
      .findOne({ email: req.params.email });
    if (data) {
      let isValid = await bcrypt.compare(req.params.password, data.password);
      if (isValid) {
        //JWT Token Generation
        let token = await jwt.sign({ user_id: data._id }, process.env.JWT_KEY);

        res.status(200).json({
          message: "Login Success",
          token,
        });
      } else {
        res.status(401).json({
          message: "Invalid Password",
        });
      }
    } else {
      res.status(400).json({
        message: "User not registered",
      });
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.get("/forgot_password/:email", async (req, res) => {
  try {
    let client = await MongoClient.connect(dbUrl);
    let db = client.db("urlShortener");
    let data = await db
      .collection("users")
      .findOne({ email: req.params.email });
    if (data) {
      //Random string Geneation
      let rnd = randomString.generate();

      await db
        .collection("users")
        .findOneAndUpdate(
          { email: req.params.email },
          { $set: { randomString: rnd } }
        );
      //Sending link to user mail ID along with random string generated

      let transporter = nodeMailer.createTransport({
        service: "gmail",
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: "tharunkumar.vijayakumar@gmail.com",
          pass: process.env.MAIL_PASS,
        },
      });

      let info = await transporter.sendMail({
        from: "tharunkumar.vijayakumar@gmail.com",
        to: req.params.email,
        subject: "Password Reset Link",
        text: "Your password reset secret code is " + rnd,
      });

      res.status(200).json({
        message:
          "Secret code to reset the Password send to your mail ID. Please Check",
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.put("/password_reset/:rnd/:pass", async (req, res) => {
  try {
    let client = await MongoClient.connect(dbUrl);
    let db = client.db("urlShortener");
    console.log(req.params.rnd, req.params.pass);
    let data = await db
      .collection("users")
      .findOne({ randomString: req.params.rnd });
    if (data) {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.params.pass, salt);
      req.params.new_pwd = hash;
      await db
        .collection("users")
        .findOneAndUpdate(
          { randomString: req.params.rnd },
          { $set: { password: req.params.new_pwd, randomString: "" } }
        );
     
      res.status(200).json({
        message: "Password updated successfully",
      });
    } else {
      res.status(401).json({
        message: "Error Occured in updating password",
      });
    }
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
  }
});

module.exports = router;
