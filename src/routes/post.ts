import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { LikeToPostController, bookmarkPost, createPostController, deletePostController, getAllPostsController, getAllPostsOfUserController, getLikesOfPost, getPostById, updatePostController } from '../controllers/post.js';
import { configureS3Bucket } from '../utils/aws_configure_S3.js';
import { UploadedFile } from 'express-fileupload';
import { ExpressNS } from '../../@types/index.js';

const router = express.Router();

/* POST create a post */

router.post("/", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        const uploadedFile = req.files?.image as UploadedFile;

        if (!uploadedFile || !uploadedFile.data) {
            return res.status(400).json({ error: "Post should have an image" });
        }

        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4'];
        if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
            return res.status(400).json({ error: "Post should have an image or video" });
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

        await createPostController(req.body, user);

        res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});

/* GET all posts */
router.get("/", authenticate, async (req: express.Request, res: express.Response) => {
    try {
        const payload = {
            page: req.query.page?.toString() || '1',
            pageSize: req.query.pageSize?.toString() || '10',
            q: req.query.q?.toString() || ''
        };
        const posts = await getAllPostsController(payload);
        res.status(200).json({
            page: payload.page,
            pageSize: payload.pageSize,
            q: payload.q,
            total: posts.length,
            posts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

/* GET all posts of a user */
router.get("/:id", authenticate, async (req: express.Request, res: express.Response) => {
    try {
        const posts = await getAllPostsOfUserController(req.params.id);
        res.status(200).json({ posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

/* GET post by id */
router.get("/post/:postId", authenticate, async (req: express.Request, res: express.Response) => {
    try {
        const post = await getPostById(Number(req.params.postId));
        res.status(200).json({ post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

/* GET all likes of a Post */
router.get("/likes/:postId", authenticate, async (req: express.Request, res: express.Response) => {
    try {
        const likes = await getLikesOfPost(Number(req.params.postId));
        res.status(200).json({ likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

/*PUT update post */
router.put("/:postId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        await updatePostController(req.body, Number(req.params.postId), user);
        res.status(200).json({ message: "Post updated successfully" });
    } catch (error) {
        console.error(error);
        if (error === 'You are not authorized to update this post') {
            return res.status(401).json({ error });
        }
        res.status(500).json({ error: "Internal server error" });
    }
})

/* DELETE Delete post. */
router.delete("/:postId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        await deletePostController(Number(req.params.postId), user);
        res.status(200).json("Post deleted successfully");
    } catch (error) {
        console.error(error);
        if (error === 'You are not authorized to delete this post') {
            return res.status(401).json({ error });
        }
        res.status(500).send('Internal Server Error');
    }
});

/* POST like to post */
router.post("/like/:postId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        const postId = Number(req.params.postId);

        await LikeToPostController(postId, user);
        res.status(201).json();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

/* POST bookmark a post */
router.post("/bookmark/:postId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        const postId = Number(req.params.postId);

        await bookmarkPost(postId, user);
        res.status(201).json("process done successfully");
    } catch (error) {
        console.error(error);
        if (error === 'Post not found') {
            return res.status(404).json({ error });
        } else if (error === 'User not found') {
            return res.status(404).json({ error });
        }
        res.status(500).json({ error: "Internal server error" });
    }
})

export default router;
