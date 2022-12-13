const jwt = require("jsonwebtoken");

function check_auth(req, res, next) {
	try {
		const token = req.cookies.access_token;
		console.log(req);
		console.log("acess_token", token);

		if (!token) {
			return res
				.clearCookie("access_token")
				.clearCookie("refresh_token")
				.status(403)
				.json("Auth Failed1 checkAuth here");
		}
		try {
			const decoded = jwt.verify(token, process.env.JWT_KEY);
			req.userData = decoded;
			// console.log("here 2");
			console.log(req.userData);
			next();
		} catch (error) {
			console.log("here 3");
			const refresh_token = req.cookies.refresh_token;
			console.log(refresh_token);
			if (refresh_token == null) {
				return res
					.clearCookie("access_token")
					.clearCookie("refresh_token")
					.status(401)
					.json({ message: "Auth Failed" });
			}
			jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN, (err, user) => {
				if (err)
					return res
						.clearCookie("access_token")
						.clearCookie("refresh_token")
						.status(403)
						.json({ message: "Auth Failed here" });
				const access_token = jwt.sign(
					{
						email: user.email,
						userId: user._id,
						username: user.username,
					},
					process.env.JWT_KEY,
					{
						expiresIn: "15m",
					}
				);

				res
					.cookie("access_token", access_token, {
						httpOnly: true,
						sameSite: "none",
						secure: process.env.NODE_ENV === "production",
					})
					.status(200)
					.json("Refreshed");
			});
		}
	} catch (e) {
		console.log("Here 456", e);
		return res.status(401).json({ message: "Auth Failed2" });
	}
}

module.exports = check_auth;
