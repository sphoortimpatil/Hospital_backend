const express = require("express");
const mongoose = require("mongoose");
const app = express();

const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://127.0.0.1:3000"],
    credentials: true,
  })
);

// MONGODB_URL="mongodb://localhost:27017/hospital"

//Patient Routes
const patientRoute = require("./routes/patients");
app.use("/patients", patientRoute);

//User Routes
const userRoute = require("./routes/users");
app.use("/user", userRoute);

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log(err);
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected");
});

app.get("/", (req, res) => {
  res.send(req.cookies);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
