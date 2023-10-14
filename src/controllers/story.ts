import { Story } from "../db/entities/Story.js";
import { User } from "../db/entities/User.js";
import { deleteFilesFromS3 } from "../utils/aws_configure_S3.js";

const createStoryController = async (story: Story, user: User) => {
    const { image, caption } = story;

    // Calculate the expiration date (24 hours from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const newStory = Story.create({
        image,
        caption,
        expiryDate,
        user
    });

    return newStory.save();
};

const getAllStoriesOfUserController = async (userId: string, userIn: User) => {
    const user = await User.findOne({ where: { id: userId }, relations: ['stories'] })
    if (!user) {
        throw 'User not found'
    }

    if (user.id !== userIn.id) {
        throw 'You are not authorized to view stories of this user'
    }

    return user.stories;
}

const getStoryById = async (storyId: number, userIn: User) => {
    const story = await Story.findOne({ where: { id: storyId } });
    if (!story) {
        throw 'story not found'
    }

    const user = await User.findOne({ where: { id: userIn.id } });
    if (!user) {
        throw 'User not found'
    }

    const userViewed = story.views?.find(userId => userId === user.id);

    if (!userViewed) {
        story.views = [...story?.views, user.id];
        await story.save();
    }

    return story.getBasicInfo();
}

const getStoryInfoForUserById = async (storyId: number, userIn: User) => {
    const story = await Story.findOne({ where: { id: storyId }, relations: ['user'] });
    if (!story) {
        throw 'story not found'
    }

    const user = await User.findOne({ where: { id: userIn.id } });
    if (!user) {
        throw 'User not found'
    }

    if (story.user?.id !== user.id) {
        throw 'You are not authorized to view story Info'
    }

    const usersLikedStory = await Promise.all(
        story.likes?.map(async (userId) => {
            const user = await User
                .createQueryBuilder('user')
                .where('user.id = :userId', { userId })
                .select(['user.id', 'user.userName', 'user.email', 'user.avatar'])
                .getOne();

            if (user) {
                return {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    avatar: user.avatar,
                };
            }

            return null;
        })
    );

    const usersViewedStory = await Promise.all(
        story.views?.map(async (userId) => {
            const user = await User
                .createQueryBuilder('user')
                .where('user.id = :userId', { userId })
                .select(['user.id', 'user.userName', 'user.email', 'user.avatar'])
                .getOne();

            if (user) {
                return {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    avatar: user.avatar,
                };
            }

            return null;
        })
    );

    return {
        usersLikedStory,
        usersViewedStory,
    };
}

const updateStoryController = async (payload: Story, storyId: number, user: User) => {
    const storyToUpdate = await Story.findOne({ where: { id: storyId }, relations: ['user'] });

    if (!storyToUpdate) {
        throw 'story not found'
    }

    if (storyToUpdate.user?.id !== user.id) {
        throw 'You are not authorized to update this story'
    }

    if (payload.caption) {
        storyToUpdate.caption = payload.caption;
    }

    try {
        await storyToUpdate.save();
    } catch (error) {
        console.error('Error updating story:', error);
        throw 'Failed to update story'
    }
}

const deleteStoryController = async (id: number, userIn: User) => {
    const user = await User.findOneBy({ id: userIn.id });
    if (!user) {
        throw 'User not found'
    }

    const story = await Story.findOne({ where: { id: id }, relations: ['user'] });

    if (!story) {
        throw 'story not found'
    }

    try {
        if (story.user?.id === userIn.id) {
            await deleteFilesFromS3([story?.image]);
            // Delete the story
            await story.remove();
        } else {
            throw 'You are not authorized to delete this story'
        }
    } catch (error) {
        console.error('Error deleting user and associated files:', error);
        throw error;
    }
}

const LikeToStoryController = async (storyId: number, userIn: User) => {
    const story = await Story.findOneBy({ id: storyId });

    if (!story) {
        throw 'story not found'
    }

    const user = await User.findOneBy({ id: userIn.id });
    if (!user) {
        throw 'User not found'
    }

    // Check if the user has already liked the story
    const userLiked = story.likes?.find(userId => userId === user.id);

    if (userLiked) {
        story.likes = story.likes?.filter(userId => userId !== user.id);
    } else {
        story.likes = [...story?.likes, user.id];
    }

    try {
        await story.save();
    } catch (error) {
        console.error('Error adding like to story:', error);
        throw 'Failed to add like to story'
    }
}


export { createStoryController, getAllStoriesOfUserController, getStoryById, updateStoryController, deleteStoryController, LikeToStoryController, getStoryInfoForUserById };