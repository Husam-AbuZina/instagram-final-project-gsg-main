import express from 'express';
import { deleteUserController, getAllUsersController, getUserForFollowersController, getUserForAllPeopleController, loginController, signupController, updateProfileController, followPersonController } from '../controllers/user.js';
import { authenticate } from '../middleware/auth.js';
import { UploadedFile } from 'express-fileupload';
import { configureS3Bucket, deleteFilesFromS3 } from '../utils/aws_configure_S3.js';
import { User } from '../db/entities/User.js';
import { ExpressNS } from '../../@types/index.js';
const router = express.Router();

/* POST Signup user. */
router.post("/signup", async (req: express.Request, res: express.Response) => {
  try {
    if (req.body.userName && req.body.password && req.body.email) {
      const token = await signupController(req.body);
      return res.status(201).json({ token });
    } else {
      return res.status(400).json("All fields are required");
    }
  } catch (error) {
    console.error(error);
    if (error === "user already exists") {
      return res.status(409).json("User already exists");
    }
    return res.status(500).json("Internal server error");
  }
});


/* POST Login user. */
router.post("/login", async (req: express.Request, res: express.Response) => {
  try {
    if (req.body.email && req.body.password) {
      const data = await loginController(req.body)
      res.status(200).json(data);
    } else {
      res.status(400).json("All fields are required");
    }
  } catch (error) {
    console.log(error);
    if (error === "invalid email or password") {
      return res.status(400).json("invalid email or password");
    }
    res.status(500).json("internal server error");
  }
});

/*GET Logout user */
router.get("/logout", async (req, res) => {
  res.status(200).json("User logged out successfully");
});


/* GET All users. */
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const users = await getAllUsersController();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json("Internal server error");
  }
})

/*GET private user by id */
router.get("/user-private/:id", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
  try {
    const currentUser = req.user
    if (!currentUser) {
      return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
    }
    const user = await getUserForFollowersController(req.params.id, currentUser);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json("Internal server error");
  }
})

/*GET public user by id */
router.get("/user-public/:id", authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const user = await getUserForAllPeopleController(req.params.id);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json("Internal server error");
  }
})


/* PUT Update Profile */
router.put("/", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
  try {
    const uploadedFile = req.files?.avatar as UploadedFile;

    const user = req.user;

    if (!user) {
      return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
    }

    if (uploadedFile) {
      const user = await User.findOneBy({ id: req.user?.id });
      const oldAvatar = user?.avatar;
      if (!oldAvatar) {
        throw new Error('User not found');
      }

      await deleteFilesFromS3([oldAvatar]);
      // Upload new avatar
      const S3 = await configureS3Bucket();

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME || '',
        Body: Buffer.from(uploadedFile.data),
        Key: `${Date.now().toString()}.png`,
        ACL: 'public-read',
      };
      const data = await S3.upload(uploadParams).promise();

      req.body.avatar = data.Location;
    }

    const updateUser = await updateProfileController(req.body, user);

    res.status(200).json(updateUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/* DELETE Delete user. */
router.delete("/", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
    }
    await deleteUserController(user);
    res.status(200).json("User deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/* Follow person */
router.post("/follow/:id", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({ error: "User not found. Please make sure you are logged in or check your account is activated" });
    }

    const userToFollowId = req.params.id;

    if (!userToFollowId) {
      return res.status(400).json({ error: "Cannot find user to follow" });
    }

    if (user.id === userToFollowId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    await followPersonController(user, userToFollowId);
    res.status(200).json("Process done successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
