import { Post } from "../db/entities/Post.js";
import { PostNs } from "../../@types/post.js";
import { User } from "../db/entities/User.js";
import { deleteFilesFromS3 } from "../utils/aws_configure_S3.js";
import { UserNS } from "../../@types/user.js";
import { pagination } from "../../@types/index.js";
import { Like } from "typeorm";

const createPostController = async (payload: PostNs.Post, user: UserNS.User) => {
    const post = await Post.create({
        image: payload.image,
        description: payload.description,
        user: user,
        shares: [],
        likes: [],
        comments: [],
    }).save();
    return post;
};

const getAllPostsController = async (payload: pagination) => {
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);
    const q = payload.q

    const posts = await Post.find({
        skip: pageSize * (page - 1),
        take: pageSize,
        order: {
            likes: 'DESC',
            comments: {
                id: 'DESC'
            },
        },
        where: [
            { description: Like(`%${q}%`) }
        ],
        relations: ['user', 'comments']
    });

    const mappedPosts = posts.map(post => ({
        id: post.id,
        image: post.image,
        description: post.description,
        likes: post.likes,
        shares: post.shares,
        createdAt: post.createdAt,
        user: {
            id: post.user.id,
            avatar: post.user.avatar,
            userName: post.user.userName,
            email: post.user.email,
        },
        comments: post.comments,
    }));

    return mappedPosts;
}

const getAllPostsOfUserController = async (userId: string) => {
    const user = await User.findOne({ where: { id: userId }, relations: ['posts', 'comments'] })
    if (!user) {
        throw 'User not found'
    }

    return user.posts;
}

const getPostById = async (postId: number) => {
    const post = await Post.findOne({ where: { id: postId }, relations: ['comments'] });
    if (!post) {
        throw 'Post not found'
    }

    return post;
}

const LikeToPostController = async (id: number, userIn: UserNS.User) => {

    const post = await Post.findOneBy({ id });

    if (!post) {
        throw 'Post not found'
    }

    const user = await User.findOneBy({ id: userIn.id });
    if (!user) {
        throw 'User not found'
    }

    if (post.likes === null) {
        post.likes = [];
    }

    // Check if the user has already liked the post
    const userLiked = post.likes?.find(userId => userId === user.id);

    if (userLiked) {
        post.likes = post.likes?.filter(userId => userId !== user.id);
    } else {
        post.likes = [...post?.likes, user.id];
    }

    try {
        await post.save();
    } catch (error) {
        console.error('Error adding like to post:', error);
        throw 'Failed to add like to post'
    }
};

const getLikesOfPost = async (postId: number) => {
    const post = await Post.findOneBy({ id: postId });

    if (!post) {
        throw 'Post not found';
    }

    const likeIds = post.likes;
    const users = await User
        .createQueryBuilder('user')
        .where('user.id IN (:...likeIds)', { likeIds })
        .select(['user.id', 'user.userName', 'user.email', 'user.avatar'])
        .getMany();

    return {
        users,
        count: users.length
    };
};

const updatePostController = async (payload: PostNs.Post, postId: number, user: User) => {
    const post = await Post.findOne({ where: { id: postId }, relations: ['user', 'comments'] });

    if (!post) {
        throw 'Post not found'
    }

    if (post.user?.id !== user.id) {
        throw 'You are not authorized to update this post'
    }

    if (payload.description) {
        post.description = payload.description;
    }

    try {
        await post.save();
    } catch (error) {
        console.error('Error updating post:', error);
        throw 'Failed to update post'
    }
}

const deletePostController = async (id: number, userIn: User) => {
    const user = await User.findOneBy({ id: userIn.id });
    if (!user) {
        throw 'User not found'
    }

    const post = await Post.findOne({ where: { id: id }, relations: ['user', 'comments'] });

    if (!post) {
        throw 'Post not found'
    }

    try {
        if (post.user?.id === userIn.id) {
            await deleteFilesFromS3([post?.image]);
            // Delete the post
            await post.remove();
        } else {
            throw 'You are not authorized to delete this post'
        }
    } catch (error) {
        console.error('Error deleting user and associated files:', error);
        throw error;
    }
}

const bookmarkPost = async (postId: number, userIn: User) => {
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
        throw 'Post not found'
    }
    const user = await User.findOne({ where: { id: userIn.id } });
    if (!user) {
        throw 'User not found'
    }
    if (user.bookmarks === null) {
        user.bookmarks = [];
    }

    const isBookmarked = user.bookmarks.includes(String(post.id) as never);
    if (isBookmarked) {
        user.bookmarks = user.bookmarks.filter(postId => Number(postId) !== post.id);
    } else {
        user.bookmarks = [...user.bookmarks, post.id];
    }

    try {
        await user.save();
    } catch (error) {
        console.error('Error adding bookmark to user:', error);
        throw 'Failed to add bookmark to user'
    }
}

export {
    createPostController,
    getAllPostsController,
    getAllPostsOfUserController,
    getLikesOfPost, getPostById,
    LikeToPostController,
    updatePostController,
    deletePostController,
    bookmarkPost
};