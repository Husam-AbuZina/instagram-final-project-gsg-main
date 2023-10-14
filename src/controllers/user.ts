import { UserNS } from "../../@types/user.js";
import { User } from "../db/entities/User.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import { deleteFilesFromS3 } from "../utils/aws_configure_S3.js";

const signupController = async (payload: UserNS.User) => {
    const { userName, email, password, bio } = payload;
    const user = await User.findOneBy({ email })
    if (user) {
        throw ("user already exists")
    }
    const token = jwt.sign({
        email: email,
        userName: userName,
    }, process.env.SECRET_KEY || "", {
        expiresIn: "1d"
    })

    User.create({ userName, email, password, bio }).save()
    return {
        token
    }
}

const loginController = async (payload: UserNS.User) => {
    const { email, password } = payload;
    const user = await User.findOne({ where: { email }, relations: [] })
    if (!user) {
        throw ("user not found")
    }
    const passwordMatching = await bcrypt.compare(password, user?.password || '')
    if (passwordMatching) {
        const token = jwt.sign({
            email: user.email,
            userName: user.userName,
        }, process.env.SECRET_KEY || "", {
            expiresIn: "1d"
        })
        return {
            user: user.getBasicProfileInfo(),
            token
        }
    } else {
        throw ("invalid email or password")
    }
}

const getAllUsersController = async () => {
    const [users, count] = await User.findAndCount();

    const limitedProfiles = users.map(user => user.getLimitedProfileInfo());

    return { users: limitedProfiles, count };
};

const getUserForFollowersController = async (id: string, userIn: User) => {
    const currentUser = await User.findOne({ where: { id: userIn.id } });
    const user = await User.findOneBy({ id });
    if (!currentUser) throw ("user not found")
    if (!user) throw ("user not found")

    if (currentUser.followers === null) {
        currentUser.followers = [];
    }
    if (currentUser.following === null) {
        currentUser.following = [];
    }
    if (user.status === "private") {
        const isFollowing = currentUser.following.includes(user.id);
        if (!isFollowing) {
            return user.getLimitedProfileInfo();
        } else {
            return user
        }
    } else {
        return user
    }

}

const getUserForAllPeopleController = async (id: string) => {
    const user = await User.findOneBy({ id });

    if (!user) throw ("user not found")

    return user
}

const updateProfileController = async (payload: UserNS.User, userIn: UserNS.User) => {
    try {
        const { userName, password, bio, avatar, status } = payload;

        // const user = await User.findOneBy({ id: userId });

        const user = await User.findOneBy({ id: userIn.id });

        if (!user) throw new Error('User not found');

        if (status && (status !== "private" && status !== "public")) {
            return { message: 'invalid input' };
        }

        if (userName) user.userName = userName;
        if (bio) user.bio = bio;
        if (status) user.status = status;
        if (avatar) user.avatar = avatar;
        if (password) user.password = await bcrypt.hash(password, 10);


        await user.save();

        return { message: 'User updated successfully' };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: (error instanceof Error) ? error.message : 'Internal Server Error'
        };
    }
};

const deleteUserController = async (userIn: UserNS.User) => {

    const user = await User.findOneBy({ id: userIn.id });
    if (!user) throw new Error("User not found");

    // Get the avatar and post image URLs
    const avatarUrl = user.avatar;
    const postImageUrls = user.posts.map(post => post.image).filter(Boolean);

    const validUrls = [avatarUrl, ...postImageUrls].filter(url => url);

    try {
        if (validUrls.length > 0) {
            await deleteFilesFromS3(validUrls);
        }

        // Manually delete associated posts
        await Promise.all(user.posts.map(post => post.remove()));
        // Delete the user
        await user.remove();
    } catch (error) {
        console.error('Error deleting user and associated files:', error);
        throw error;
    }
};

const followPersonController = async (userIn: UserNS.User, userToFollowId: string) => {
    try {
        const currentUser = await User.findOne({ where: { id: userIn.id } });
        if (!currentUser) {
            throw new Error("User to follow not found");
        }

        const userToFollow = await User.findOne({ where: { id: userToFollowId } });
        if (!userToFollow) {
            throw new Error("User to follow not found");
        }

        if (currentUser.following === null) {
            currentUser.following = [];
        }

        if (currentUser.followers === null) {
            currentUser.followers = [];
        }

        if (userToFollow.followers === null) {
            userToFollow.followers = [];
        }

        if (userToFollow.followers === null) {
            userToFollow.followers = [];
        }

        const isFollowing = currentUser.following.includes(userToFollow.id);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(userId => userId !== userToFollow.id);
            userToFollow.followers = userToFollow.followers.filter(userId => userId !== userIn.id);
        } else {
            currentUser.following = [...currentUser.following, userToFollow.id];
            userToFollow.followers = [...userToFollow.followers, userIn.id];
        }

        return Promise.all([currentUser.save(), userToFollow.save()]);
    } catch (error) {
        throw new Error(`Failed to follow user: ${error}`);
    }
};



export {
    signupController,
    loginController,
    getAllUsersController,
    updateProfileController,
    deleteUserController,
    getUserForFollowersController,
    getUserForAllPeopleController,
    followPersonController
}