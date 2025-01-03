import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma.js";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: {
          contains: query.city || undefined,
          mode: "insensitive",
        },
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 10000000,
        },
      },
    });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get posts!" });
  }
};

export const getPost = async (req, res) => {
  const id = req?.params?.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, avatar: true } },
        postDetail: true,
      },
    });

    if (post === null) {
      return res.status(500).json({ message: "Failed to get post!" });
    }

    let saved = null;
    const token = req?.cookies?.token;

    if (token) {
      try {
        // The jwt.verify method is now wrapped in a Promise so that it can be awaited. This ensures that the verification is complete before moving forward.
        const payload = await new Promise((resolve, reject) => {
          jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
            if (err) {
              reject("Token is not valid");
            } else {
              resolve(payload);
            }
          });
        });

        saved = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              userId: payload.id,
              postId: id,
            },
          },
        });
      } catch (error) {
        return res.status(403).json({ message: err });
      }
    }

    return res.status(200).json({ ...post, isSaved: saved ? true : false });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get post!" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;
  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    return res.status(200).json(newPost);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add post!" });
  }
};

export const updatePost = async (req, res) => {
  try {
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ message: "Failed to update post!" });
  }
};

export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id: postId },
    });
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete post!" });
  }
};
