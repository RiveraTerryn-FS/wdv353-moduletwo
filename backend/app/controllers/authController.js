import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Create access token
const signToken = (user) => {
	return jwt.sign(
		{
			id: user._id,
			username: user.username,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "1h" }
	);
};
// Create refresh token
const signRefreshToken = (user) => {
	return jwt.sign(
		{
			id: user._id,
			role: user.role,
		},
		process.env.REFRESH_SECRET,
		{ expiresIn: "7d" }
	);
};

// Refresh access token
export async function refreshToken(req, res) {
	const token = req.cookies?.refreshToken;

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Refresh token missing",
		});
	}
	jwt.verify(token, process.env.REFRESH_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({
				success: false,
				message: "Invalid or expired refresh token",
			});
		}
		// Create new access token
		const newAccessToken = jwt.sign(
			{
				id: decoded.id,
				role: decoded.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "15m" }
		);
		return res.status(200).json({
			success: true,
			token: newAccessToken,
		});
	});
}

// REGISTER
export const register = async (req, res, next) => {
	try {
		const { username, password, age = 0 } = req.body;

		if (!username || !password) {
			return res.status(400).json({
				success: false,
				error: "Username and password required",
			});
		}

		const exists = await User.findOne({ username });
		if (exists) {
			return res.status(409).json({
				success: false,
				error: "Username already exists",
			});
		}

		const hashed = await bcrypt.hash(password, 12);

		const user = await User.create({
			username,
			password: hashed,
			age,
		});

		const token = signToken(user);
		const refreshToken = signRefreshToken(user);

		// Store in cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			sameSite: "strict",
		});

		res.status(201).json({
			success: true,
			token,
			user: {
				id: user._id,
				username: user.username,
				role: user.role,
			},
		});
	} catch (err) {
		next(err);
	}
};

// LOGIN
export const login = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username }).select("+password");
		if (!user) {
			return res.status(401).json({
				success: false,
				error: "Invalid username and/or password",
			});
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res.status(401).json({
				success: false,
				error: "Invalid username and/or password",
			});
		}

		const token = signToken(user);
		const refreshToken = signRefreshToken(user);

		// Store refresh token
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			sameSite: "strict",
		});

		res.status(200).json({
			success: true,
			token,
			user: {
				id: user._id,
				username: user.username,
				role: user.role,
			},
		});
	} catch (err) {
		next(err);
	}
};