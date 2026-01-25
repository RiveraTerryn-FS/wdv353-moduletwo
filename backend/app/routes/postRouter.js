import express from "express";
import { authenticateToken } from "../middleware/authenticate.js";
import {
    getAllPosts,
    getPost,
    createPost,
    editPost,
    deletePost,
} from "../controllers/postController.js";


const router = express.Router();

router.get("/", getAllPosts);
router.post("/", authenticateToken, createPost);
router.get("/:postId", getPost);
router.put("/:postId", editPost);
router.delete("/:postId", deletePost);

export default router;
