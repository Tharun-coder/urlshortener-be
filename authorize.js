const jwt = require("jsonwebtoken");
const { MongoClient, ObjectID } = require("mongodb");

function authorize(req, res, next) {
  if (req.headers.authorization) {
    jwt.verify(
      req.headers.authorization,
      process.env.JWT_KEY,
      async (err, decoded) => {
        if (decoded != undefined) {
          if (await getByID(decoded.user_id)) {
            next();
          } else {
            res.status(401).json({ message: "Un-authorized" });
          }
        } else {
          res.status(404).json({ message: "Forbidden" });
        }
      }
    );
  } else {
    res.status(401).json({ message: "No Token Found" });
  }
}

async function getByID(id) {
  try {
    let client = await MongoClient.connect(process.env.DB_URL);
    let db = client.db("urlShortener");
    let data = await db.collection("users").findOne({ _id: ObjectID(id) });
    return data._id;
  } catch (err) {
    console.log(err);
    // res.status(500);
  }
}

module.exports = authorize;
