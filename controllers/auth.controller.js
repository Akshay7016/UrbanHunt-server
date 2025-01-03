import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user!" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }

    const age = 1000 * 60 * 60 * 24 * 7; // 7 days

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: age,
      }
    );

    delete user.password;

    return res
      .cookie("token", token, { httpOnly: true, maxAge: age, secure: true })
      .status(200)
      .json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
  return res
    .clearCookie("token")
    .status(200)
    .json({ message: "Logout successful" });
};
