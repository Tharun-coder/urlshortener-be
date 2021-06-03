const mongoose = require("mongoose");
const shortid = require("shortid");

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const shorlUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    require: true,
  },
  short: {
    type: String,
    require: true,
    default: shortid.generate,
  },
  clicks: {
    type: Number,
    require: true,
    default: 0,
  },
});

module.exports = mongoose.model("shortUrl", shorlUrlSchema);
