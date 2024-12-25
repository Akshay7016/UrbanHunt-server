import bcrypt from "bcrypt";

import { prisma } from "../lib/prisma.js";

export const getUsers = async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany();

    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get users!" });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = req.params.id;

    const userDetails = await prisma.user.findUnique({
      where: { id },
    });

    return res.status(200).json(userDetails);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get user!" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...otherDetails } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...otherDetails,
        ...(hashedPassword && { password: hashedPassword }),
        ...(avatar && { avatar }),
      },
    });

    delete updatedUser.password;

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }
  try {
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user!" });
  }
};
