const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const validatePostInput = require('../../validation/post');

router.get('/test', (req, res) => res.json({ msg: 'Posts works'}));

// @route POST /api/posts
// @desc Create a post
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  
  if (!isValid) {
    return res.status(400).json(errors);
  }
  
  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id,
  });
  newPost.save()
    .then(post => res.json(post));
});

// @route GET /api/posts
// @desc GET posts
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nonPosts: 'No posts found' }));
});
// @route GET /api/posts/:post_id
// @desc GET post by id
// @access Public
router.get('/:post_id', (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nonPost: 'No post found with that id' }));
});
// @route DELETE /api/posts/:post_id
// @desc DELETE post by id
// @access Private
router.delete('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ notAuthorized: 'User not authorized' });
          }
          post.remove()
            .then(() => res.json({ success: true }))
            .catch(err => res.status(404).json({ nonPost: 'Post not found '}));
        });
    });
});

// @route POST /api/posts/like/:post_id
// @desc Like a post
// @access Private
router.post('/like/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ alreadyliked: 'User already liked this post '});
          }
          // Add user id to likes array
          post.likes.unshift({ user: req.user.id }); // Push into the array
          post.save()
            .then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postNotFound: 'Post not found with that id' }));
    });
});

// @route POST /api/posts/unlike/:post_id
// @desc Unlike a post
// @access Private
router.post('/unlike/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (post.likes.filter(like => like.user.toString() === req.user.id).length < 1 ) {
          return res.status(400).json({ alreadyNotLiked: `You haven't yet liked this post` });
        }
        // Unlike the post
        const removeindex = post.likes
          .map(like => like.user.toString())
          .indexOf(req.user.id);
        post.likes.splice(removeindex, 1);
        post.save()
          .then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postNotFound: 'There is not post with that id' }));
  });
});

// @route POST /api/posts/comment/:post_id
// @desc Add comment to post
// @access Private
router.post('/comment/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Post.findById(req.params.post_id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
      }
      // Add to comments array
      post.comments.unshift(newComment);
      post.save()
        .then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postNotFound: 'There is not post for that id' }));
});
// @route DELETE /api/posts/comment/:post_id/:comment_id
// @desc Remove a comment from post
// @access Private
router.delete('/comment/:post_id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      // Check if the comment exits
      if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({ commentNotExists: 'Comment does not exist' });
      }
      // Get remove index
      const removeIndex = post.comments
        .map(comment => comment._id.toString())
        .indexOf(req.params.comment_id);
      post.comments.splice(removeIndex, 1);
      post.save()
        .then(post => res.json(post));
    })
    .catch(err  => res.status(404).json({ postNotFound: 'There is not post for that id'}))
});
module.exports = router;