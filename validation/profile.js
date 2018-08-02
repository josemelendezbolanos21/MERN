const validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validateLoginInput(data){
  let errors = {};
  data.handle = !isEmpty(data.handle) ? data.handle : '';
  data.status = !isEmpty(data.status) ? data.status : '';
  data.skills = !isEmpty(data.skills) ? data.skills : '';
  
  if(validator.isEmpty(data.handle)) {
    errors.handle = 'Handle field is required';
  } else if(!validator.isLength(data.handle, { min: 2, max: 40 })) {
    errors.handle = 'Handle must be between 2 and 40 characters'
  }
  if(validator.isEmpty(data.status)) {
    errors.status = 'Status field is required';
  }
  if(validator.isEmpty(data.skills)) {
    errors.skills = 'Skills field is required';
  }
  if(!validator.isEmpty(data.website)) {
    if(!validator.isURL(data.website)) {
      errors.website = 'Not a valid URL';
    }
  }
  if(!validator.isEmpty(data.youtube)) {
    if(!validator.isURL(data.youtube)) {
      errors.youtube = 'Not a valid URL';
    }
  }
  if(!validator.isEmpty(data.facebook)) {
    if(!validator.isURL(data.facebook)) {
      errors.facebook = 'Not a valid URL';
    }
  }
  if(!validator.isEmpty(data.twitter)) {
    if(!validator.isURL(data.twitter)) {
      errors.twitter = 'Not a valid URL';
    }
  }
  if(!validator.isEmpty(data.linkedIn)) {
    if(!validator.isURL(data.linkedIn)) {
      errors.linkedIn = 'Not a valid URL';
    }
  }
  if(!validator.isEmpty(data.instagram)) {
    if(!validator.isURL(data.instagram)) {
      errors.instagram = 'Not a valid URL';
    }
  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  }
}