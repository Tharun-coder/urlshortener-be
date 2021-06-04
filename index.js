const express = require("express");
const cors = require("cors");
require("dotenv").config();
const router = require("./userAuth");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use("/auth", router);
const shortUrl = require("./models/urlShortener");
const authorize = require("./authorize");

app.get("/home", async (req, res) => {
  try {
    let data = await shortUrl.find();
    res.append("data",data);
    res.status(200).json({
      message: "Your Data is here",
      data,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/home/shorten_url", async (req, res) => {
  try {
    await shortUrl.create({ full: req.body.full_url });
    let data = await shortUrl.findOne({ full: req.body.full_url });
    res.status(200).json({
      message: "Please find the shortened URL",
      data,
    });
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
  }
});

app.post("/home/shorten_url/:short", async (req, res) => {
  try {
    await shortUrl.updateOne(
      { short: req.params.short },
      { $inc: { clicks: 1 } }
    );
    let data = await shortUrl.findOne({ short: req.params.short });
    res.status(200).json({
      message: "Clicks have been updated",
      data,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(PORT);
