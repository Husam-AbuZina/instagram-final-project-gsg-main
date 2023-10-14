import express from "express";
import { createComment, deleteComment, getCommentsOfPostController, likeToCommentController, updateComment } from "../controllers/comment.js";
import { ExpressNS } from "../../@types/index.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

/* POST add comment to post */
router.post("/:postId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        if (!req.body.content) {
            return res.status(400).json({ error: "Comment cannot be empty" });
        }
        if (req.body.content.length > 700) {
            return res.status(400).json({ error: "Comment too long" });
        }
        const postId = Number(req.params.postId)
        if (!postId) {
            return res.status(400).json({ error: "cannot find post" });
        }
        await createComment(req.body, postId, req.user);
        res.status(201).send({ message: "Comment created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("internal server error");
    }
});

/* GET comments of a post */
router.get("/:postId", authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const postId = Number(req.params.postId)
        if (!postId) {
            return res.status(400).json({ error: "cannot find post" });
        }
        const comments = await getCommentsOfPostController(postId);
        res.status(200).json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).send("internal server error");
    }
})

/*PUT update comment */
router.put("/:commentId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        const commentId = Number(req.params.commentId)
        if (!commentId) {
            return res.status(400).json({ error: "cannot find comment" });
        }
        await updateComment(req.body.content, commentId, user);
        res.status(200).json({ message: "Comment updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("internal server error");
    }
});

/* DELETE comment */
router.delete("/:commentId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }
        const commentId = Number(req.params.commentId)
        if (!commentId) {
            return res.status(400).json({ error: "cannot find comment" });
        }
        await deleteComment(commentId, user);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("internal server error");
    }
});

/* Add/Remove like to a comment  */
router.post("/like/:commentId", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
        }

        const commentId = Number(req.params.commentId)
        if (!commentId) {
            return res.status(400).json({ error: "cannot find comment" });
        }
        await likeToCommentController(commentId, user);
        res.status(201).json();
    } catch (error) {
        console.error(error);
        if (error === 'Comment not found') {
            return res.status(404).json({ error });
        }
        res.status(500).send("internal server error");
    }
});

export default router;
