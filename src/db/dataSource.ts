import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Post } from "./entities/Post.js";
import { Comment } from "./entities/Comment.js";
import { Story } from "./entities/Story.js";

const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_ADDON_HOST,
    port: Number(process.env.MYSQL_ADDON_PORT),
    username: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    url: process.env.MYSQL_ADDON_URI,
    entities: [
        User,
        Post,
        Comment,
        Story
    ],
    migrations: ['./**/migration/*.ts'],
    synchronize: true,
    logging: false
});

export const initDB = async () =>
    await dataSource.initialize().then(() => {
        console.log('DB connected');
    }).catch(err => {
        console.log("DB connection failed", err);
    });

export default dataSource;