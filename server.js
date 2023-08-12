const express = require("express");
const cors = require("cors");
const mongodbConfig = require("./app/config/mongodb.config");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

const app = express();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

//`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`
//${dbConfig.PATH}
db.mongoose
  .connect(`mongodb://${mongodbConfig.HOST}:${mongodbConfig.PORT}/${mongodbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    // initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to sozo wallet application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/wallet.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
