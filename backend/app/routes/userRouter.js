import express from "express";
import {
    getAllUsers,
    getUser,
    createUser,
    editUser,
    deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
//router.post("/", createUser); <-- no longer needed (auth has register and login)
router.get("/:userId", getUser);
router.put("/:userId", editUser);
router.delete("/:userId", deleteUser);

export default router;