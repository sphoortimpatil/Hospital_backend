const jwt = require("jsonwebtoken");
const User = require("../models/Users");

async function check_amdin(req, res, next) {
	try {
		const access_token = req.cookies.access_token;
		if (!access_token) {
			return res
				.clearCookie("access_token")
				.clearCookie("refresh_token")
				.status(403)
				.json("Auth Failed cookie here");
		}
		try {
			const decoded = jwt.verify(access_token, process.env.JWT_KEY);
			console.log("logging decoded val", decoded);
			const id = decoded.userId;
			const user = await User.findOne({
				_id: id,
				username: decoded.username,
				role: decoded.role,
				email: decoded.email,
			});
			if (!user) {
				return res
					.clearCookie("access_token")
					.clearCookie("refresh_token")
					.status(403)
					.json("Auth Failed1 here");
			} else if (user.role !== "Admin") {
				return res.status(403).json("Auth Failed, not admin");
			} else {
				console.log("user is admin", user);
				next();
			}
		} catch (e) {
			console.log("err", e);
		}
	} catch (error) {
		console.log("error", error);
	}
}

module.exports = check_amdin;
