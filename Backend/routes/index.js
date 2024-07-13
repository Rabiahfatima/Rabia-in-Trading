const express = require('express');
const authController = require('../controller/authController');
const blogController = require('../controller/blogController');
const auth = require('../middleware/auth');
const commentController = require('../controller/commentController');
const router = express.Router()

// test
router.get('/test', (req, res) => {
    res.send('Hello!');
  });


// user
// login
router.post('/login', authController.login)
// register
router.post('/register', authController.register)
// logout
router.post('/logout', auth, authController.logout)
// refresh
router.get('/refresh', auth, authController.refresh)

// blog
// create
router.post('/blog', auth, blogController.createBlog)
// read all
router.post('/blog/readall',auth,  blogController.readBlog)
// read by id
router.post('/blog/:id',auth,  blogController.readByIdBlog)
// update
router.put('/blog/update', auth,  blogController.updateBlog)
// delete
router.delete('/blog/delete/:id',auth,  blogController.deleteBlog)


// comments
// create
router.post('/comment',auth,  commentController.createComment)
// update
router.get('/comment/:id',auth,  commentController.getComment)
// delete
// router.delete('/comment/delete/:id',auth,  commentController.deleteComment)


module.exports = router;