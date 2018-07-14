const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

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

// @route POST api/profile/experience
// @desc Add experience to profile
// @access Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  if (!isValid) {
    res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      // Add to experience array
      profile.experience.unshift(newExp);
      profile.save()
        .then(profile => res.json(profile));
    })    
});

//@route POST api/profile/education
//@desc Add education to a profile
//@access Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if(!profile) {
        errors.nonProfile = 'There is no profile for that user';
        res.status(404).json(errors);
      } else {
        const newEducation = {
          school: req.body.school,
          degree: req.body.degree,
          fieldOfStudy: req.body.fieldOfStudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current
        };

        profile.education.unshift(newEducation);
        profile.save()
          .then(profile => res.json(profile));
      }      
    })
});

//@route DELETE /api/profile/experience/:exp_id
//@desc Delete experience form profile
//@access Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // Splice out of array
      profile.experience.splice(removeIndex, 1);

      // Save 
      profile.save()
        .then(profile => res.json(profile))
        
    })
    .catch(err => res.status(404).json(err));    
});

// @route DELETE /api/profile/education/:edu_id
// @desc Delete education form profile
// @access Private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);
      profile.education.splice(removeIndex, 1);
      profile.save()
        .then(profile => res.json(profile));        
    })
    .catch(err => res.status(404).json(err));
});
// @route DELETE /api/profile
// @desc Delete current profile
// @access Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: true }));
    });
});

module.exports = router;