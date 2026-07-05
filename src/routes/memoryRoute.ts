import express from "express";
import { registerMemoryController,fetchMemoryController,updateMemoryController,deleteMemoryController } from "../controllers/memoryController";
import multer from "multer";
const upload=multer({storage:multer.memoryStorage()})

const router=express.Router();

router.post('/',upload.array('files'),registerMemoryController)
router.delete('/:id', deleteMemoryController);
router.get('/',fetchMemoryController)
router.put('/',upload.array('files'),updateMemoryController);

export default router