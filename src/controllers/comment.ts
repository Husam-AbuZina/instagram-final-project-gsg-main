import { Comment } from "../db/entities/Comment.js"
import { Post } from "../db/entities/Post.js";
import { User } from "../db/entities/User.js";

const createComment = async (payload: Comment, postID: number, userIn: User) => {
    const post = await Post.findOne({ where: { id: postID } });
    if (!post) {
        throw 'Post not found'
    }
    const comment = await Comment.create({ content: payload.content, post: post, user: userIn }).save();
    return comment;
}

const getCommentsOfPostController = async (postId: number) => {
    const post = await Post.findOne({ where: { id: postId }, relations: ['comments'] });
    if (!post) {
        throw 'Post not found'
    }

    return post.comments;
}

const updateComment = async (content: string, commentId: number, userIn: User) => {
    const comment = await Comment.findOne({ where: { id: commentId }, relations: ['user'] });
    if (!comment) {
        throw 'Comment not found'
    }
    if (comment.user.id !== userIn.id) {
        throw 'You are not allowed to update this comment'
    }
    comment.content = content;
    return comment.save();
}

const deleteComment = async (commentId: number, userIn: User) => {
    const comment = await Comment.findOne({ where: { id: commentId }, relations: ['user'] });
    if (!comment) {
        throw 'Comment not found'
    }
    if (comment.user.id !== userIn.id) {
        throw 'You are not allowed to delete this comment'
    }
    return comment.remove();
}

const likeToCommentController = async (commentId: number, user: User) => {
    const comment = await Comment.findOne({ where: { id: commentId } });
    if (!comment) {
        throw 'Comment not found'
    }

    if (comment.likes === null) {
        comment.likes = [];
    }

    // Check if the user has already liked the comment
    const userLiked = comment.likes?.find(userId => userId === user.id);

    if (userLiked) {
        comment.likes = comment.likes?.filter(userId => userId !== user.id);
    } else {
        comment.likes = [...comment?.likes, user.id];
    }

    try {
        await comment.save();
    } catch (error) {
        console.error('Error adding like to post:', error);
        throw 'Failed to add like to post'
    }
}

export { createComment, getCommentsOfPostController, updateComment, deleteComment, likeToCommentController }