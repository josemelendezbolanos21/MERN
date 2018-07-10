const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const validateProfileInput = require('../../validation/profile');
// Load Profile model
const Profile = require('../../models/Profile');

// Load User model
const User = require('../../models/User');


router.get('/test', (req, res) => res.json({ msg: 'Profile works'}));

// @route GET api/profile
// @desc Get current users profile
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.nonProfile = 'Profile not found';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route POST api/profile
// @desc Creates or edit users profile 
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);
  
  if(!isValid) {
    return res.status(400).json(errors);
  }

  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) {
    profileFields.handle = req.body.handle;
  }
  if (req.body.company) {
    profileFields.company = req.body.company;
  }
  if (req.body.website) {
    profileFields.website = req.body.website;
  }
  if (req.body.bio) {
    profileFields.bio = req.body.bio;
  }
  if (req.body.status) {
    profileFields.status = req.body.status;
  }
  if (req.body.github) {
    profileFields.github = req.body.github;
  }
  // Skills - Split into array
  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }
  // Social
  profileFields.social = {};
  if (req.body.youtube) {
    profileFields.social.youtube = req.body.youtube;
  }
  if (req.body.linkedIn) {
    profileFields.social.linkedIn = req.body.linkedIn;
  }
  if (req.body.facebook) {
    profileFields.social.facebook = req.body.facebook;
  }
  if (req.body.instagram) {
    profileFields.social.instagram = req.body.instagram;
  }
  if (req.body.twitter) {
    profileFields.social.twitter = req.body.twitter;
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Update current profile
      if (profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true}
        )
        .then(profile => res.json(profile));
      } else {
        // Create new profile
        // Check if handle exists
        Profile.findOne({  handle: profileFields.handle })
          .then(profile => {
            if (profile) {
              errors.handle = 'That handle already exists';
              res.status(400).json(errors);
            }

            // Save Profile
            new Profile(profileFields).save().then(profile => res.json(profile));
          })
      }
    })
});

// @route GET api/profile/all
// @desc  GET all profiles
// @access Public
router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
    .populate('user', [ 'name', 'avatar'])
    .then(profiles => {
      if(!profiles) {
        errors.nonProfiles = 'There are no profiles';
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ nonProfiles: 'There are no profiles in the DB' }));
});


// @route GET api/profile/handle/:handle
// @desc Get profile by handle 
// @access Public
router.get('/handle/:handle', (req, res) => {
  const errors = {}
  Profile.findOne({ handle: req.params.handle })
    .populate('user', [ 'name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.nonProfile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route GET api/profile/user/:user_id
// @desc Get profile by handle 
// @access Public
router.get('/user/:user_id', (req, res) => {
  const errors = {}
  Profile.findOne({ user: req.params.user_id })
    .populate('user', [ 'name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.nonProfile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ nonProfile: 'There is no profile for this user id'}));
});


module.exports = router;