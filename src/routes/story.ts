import express from "express";
import { authenticate } from "../middleware/auth.js";
import { ExpressNS } from "../../@types/index.js";
import { UploadedFile } from 'express-fileupload';
import { configureS3Bucket } from "../utils/aws_configure_S3.js";
import { LikeToStoryController, createStoryController, deleteStoryController, getAllStoriesOfUserController, getStoryById, getStoryInfoForUserById, updateStoryController } from "../controllers/story.js";

const router = express.Router();

/* POST add story to user */
router.post("/", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        const uploadedFile = req.files?.image as UploadedFile;

        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4',];
        if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
            return res.status(400).json({ error: "Story should have an image or video" });
        }

        const S3 = await configureS3Bucket();

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Body: Buffer.from(uploadedFile.data),
            Key: `${Date.now().toString()}.png`,
            ACL: 'public-read',
        };

        const data = await S3.upload(uploadParams).promise();

        req.body.image = data.Location;

        await createStoryController(req.body, user);

        res.status(201).json({ message: "Story created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});

/* GET all stories of a user */
router.get("/:id", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        const stories = await getAllStoriesOfUserController(req.params.id, user);
        res.status(200).json({ stories });
    } catch (error) {
        console.error(error);
        if (error === 'You are not authorized to view stories of this user') {
            return res.status(401).json({ error });
        }
        res.status(500).json({ error: "Internal server error" });
    }
})

/* GET story by id and view it */
router.get("/story/:storyId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        const story = await getStoryById(Number(req.params.storyId), user);
        res.status(200).json({ story });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

/*PUT update story */
router.put("/:storyId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        await updateStoryController(req.body, Number(req.params.storyId), user);
        res.status(200).json({ message: "story updated successfully" });
    } catch (error) {
        console.error(error);
        if (error === 'You are not authorized to update this story') {
            return res.status(401).json({ error });
        }
        res.status(500).json({ error: "Internal server error" });
    }
})

/* DELETE Delete story. */
router.delete("/:storyId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        await deleteStoryController(Number(req.params.storyId), user);
        res.status(200).json("story deleted successfully");
    } catch (error) {
        console.error(error);
        if (error === 'You are not authorized to delete this story') {
            return res.status(401).json({ error });
        }
        res.status(500).send('Internal Server Error');
    }
});

/* POST like to story */
router.post("/like/:storyId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        const storyId = Number(req.params.storyId);

        await LikeToStoryController(storyId, user);
        res.status(201).json();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

/* Private, GET story info for user */
router.get("/info/:storyId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        const story = await getStoryInfoForUserById(Number(req.params.storyId), user);
        res.status(200).json({ story });
    } catch (error) {
        console.error(error);
        if (error === 'You are not authorized to view story Info') {
            return res.status(401).json({ error });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;