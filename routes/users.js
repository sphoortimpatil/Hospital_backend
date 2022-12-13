const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/Users");
const Token = require("../models/Token");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const checkAuth = require("../middlewares/check-auth");
const checkAdmin = require("../middlewares/check-admin");
require("dotenv").config();

router.get("/", (req, res) => {
  res.send("User Page");
  res.cookie;
});

router.post("/adduser", checkAdmin, async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (user != null) {
    res.status(409).json({
      message: "User already exists",
    });
  } else {
    bycrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        const user = await new User({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          role: req.body.role || "Doctor",
        });

        try {
          await user.save();
          // console.log(user);
          res.status(201).json({
            message: "User Created",
          });
        } catch (error) {
          res.status(500).json({ error: error });
        }
      }
    });
  }
});

router.get("/all", checkAuth, async (req, res, next) => {
  const allUsers = await User.find({});
  console.log(allUsers);
  res.status(200).json(allUsers);
});

router.delete("/:id", checkAuth, async (req, res, next) => {
  if (req.params.id === req.body.id) {
    try {
      const val = await User.deleteOne({
        _id: req.params.id,
      });
      if (val.deletedCount === 0)
        res.status(403).json({
          message: "User not deleted",
        });
      else {
        res.status(200).json({
          message: "User Deleted",
        });
      }
    } catch (e) {
      res.status(500).json({
        message: "An error occured",
      });
    }
  } else {
    res.status(403).json("Not Allowed");
  }
});

router.post("/login", async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(req.body);

  console.log(user);
  console.log("data", process.env.FRONT_APP_URL);
  if (user === null) {
    return res.status(401).json({
      message: "Auth Failed1",
    });
  } else {
    bycrypt.compare(req.body.password, user.password, function (e, result) {
      if (e) {
        return res.status(401).json({
          message: "Auth Failed2",
        });
      }
      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            username: user.username,
            role: user.role,
          },
          process.env.JWT_KEY,
          {
            expiresIn: "15m",
          }
        );
        const refresh_token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            username: user.username,
            role: user.role,
          },
          process.env.JWT_REFRESH_TOKEN
        );

        return res
          .cookie("access_token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
          })
          .cookie("refresh_token", refresh_token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
          })

          .status(200)
          .json({
            email: user.email,
            userId: user._id,
            username: user.username,
            role: user.role,
          });
      } else {
        return res.status(401).json({ message: "Auth Failed" });
      }
    });
  }
});

router.post("/login-admin", async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  // console.log(req.body);
  console.log(user);

  if (user === null || user.role != "Admin") {
    return res.status(401).json({
      message: "Auth Failed1",
    });
  } else {
    bycrypt.compare(req.body.password, user.password, function (e, result) {
      if (e) {
        return res.status(401).json({
          message: "Auth Failed2",
        });
      }
      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            username: user.username,
            role: user.role,
          },
          process.env.JWT_KEY,
          {
            expiresIn: "15m",
          }
        );
        const refresh_token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            username: user.username,
            role: user.role,
          },
          process.env.JWT_REFRESH_TOKEN
        );
        return res
          .cookie("access_token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
          })
          .cookie("refresh_token", refresh_token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
          })
          .status(200)
          .json({
            email: user.email,
            userId: user._id,
            username: user.username,
            role: user.role,
          });

        // return res.status(200).json({
        //   message: "Auth Successful",
        //   token: token,
        // });
      } else {
        return res.status(401).json({ message: "Auth Failed" });
      }
    });
  }
});

router.post("/check-email", async (req, res) => {
  const email1 = req.body.email;
  console.log(email1);
  const user = await User.findOne({ email: req.body.email });
  // console.log(req.body);
  console.log(user);

  if (user === null) {
    return res.status(401).json({
      message: "Not a valid Email",
    });
  } else {
    //Send email

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    var transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ayushman1331",
        pass: "ayushman",
      },
    });

    var mailOptions = {
      from: "ayushman1331",
      to: email1,
      subject: "Request for resetting password, Ayushman Clinic",
      text: `Please follow the link to reset your password ${process.env.FRONT_APP_URL}/password-reset/${user._id}/${token.token}`,
    };
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Here Error", error);
        return res.status(501).json({
          message: "Email not sent",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message: "Email Sent",
        });
      }
    });
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  console.log("USer entered here");
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(403).json({ message: "user not valid" });
  }
  const token = await Token.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!token) return res.status(400).send("Invalid link or expired");
  // user.password = req.body.password;

  bycrypt.hash(req.body.password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      user.password = hash;
      try {
        await user.save();
        // console.log(user);
        await token.delete();

        res.status(201).json({
          message: "Password Updated",
        });
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
  });
});

router.get("/logout", checkAuth, (req, res) => {
  // console.log("logging out");
  return res
    .clearCookie("access_token")
    .clearCookie("refresh_token")
    .status(200)
    .json({ message: "Sucessfully Logged out" });
});

router.get("/:id", checkAuth, async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });
  res.status(200).json(user);
});

module.exports = router;
