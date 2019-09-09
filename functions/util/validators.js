// ==========Helpers==========
const isEmpty = (string) => { // Helper function to help validate if the signun form field is empty
  if(string.trim() == '') return true;
  else return false; 
}

const isEmail = (email) => { // Helper function to check if email in signup is in correct format, can also use a javascript validating library
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
}

exports.validateSignupData = (data) => {
  // Validators for signup form
  let errors = {}; // Used to store the errors before sending out
  if(isEmpty(data.email)) { // Validator to check if email is sent empty
      errors.email = 'Email must not be empty'
  } else if(!isEmail(data.email)){ // Checks to see if a valid email address is sent
      errors.email = 'Must be a valid email address'
  }
  if(isEmpty(data.password)) errors.password = 'Must not be empty';
  if(data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must match'; 
  if(isEmpty(data.handle)) errors.handle = 'Must not be empty';

  return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.validateLoginData = (data) => {
      // Validators for the login form
      let errors = {};
      if(isEmpty(data.email)) errors.email = 'Must not be empty';
      if(isEmpty(data.password)) errors.password = 'Must not be empty';

      return {
          errors,
          valid: Object.keys(errors).length === 0 ? true : false
      }
}

// Helper function for addUserDetails
exports.reduceUserDetails = (data) => {
  let userDetails = {};

  // Checks to make sure that we don't send an empty string to our DB
  if(!isEmpty(data.name.trim())) userDetails.name = data.name;
  if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if(!isEmpty(data.age.trim())) userDetails.age = data.age;
  if(!isEmpty(data.location.trim())) userDetails.location = data.location;

  return userDetails;
}