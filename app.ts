import "./config.js"
import express from 'express'
import dotenv from 'dotenv'
import createError from 'http-errors'
import dataSource from './src/db/dataSource.js'
import logger from 'morgan'
import fileUpload from 'express-fileupload'

import indexRouter from './src/routes/index.js'
import usersRouter from './src/routes/user.js'
import postRouter from './src/routes/post.js'
import commentRouter from './src/routes/comment.js'
import storyRouter from './src/routes/story.js'
import cron from 'node-cron';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/stories', storyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send({ error: err.message });
});

dataSource.initialize().then(() => {
  console.log("Connected to DB!");
}).catch(err => {
  console.error('Failed to connect to DB: ' + err);
});

app.listen(PORT, () => {
  logger(`App is listening on port ${PORT}`);
  console.log(`App is listening on port ${PORT} and host http://localhost:${PORT}`);
});


export default app;
