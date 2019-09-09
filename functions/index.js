//==========Configuration==========
const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbauth-middleware');
const { signup, login, addUserDetails, updateUserDetails } = require('./handlers/users');
const { createNewPlant, fetchPlantActivities, fetchUserPlants, fetchOnePlant, deleteOnePlant, updatePlant } = require('./handlers/plants');
const { fetchAllActivities, createNewActivity, fetchOneActivity, deleteOneActivity, updateActivity } = require('./handlers/activity');

// ==========User Routes==========
// Sign up a new user
app.post('/signup', signup);

// Login existing user
app.post('/login', login);

// Create user bio
app.post('/user', FBAuth, addUserDetails);

// Update user bio
app.post('/user/update', FBAuth, updateUserDetails);

// ==========Plant Routes==========
// Create a new plant
app.post('/plant', FBAuth, createNewPlant);

// Delete the specific plant
app.delete('/plant/:plantId', FBAuth, deleteOnePlant);

// Update a specific plant
app.post('/plant/:plantId', FBAuth, updatePlant);

// Fetch one plant
app.get('/plant/:plantId', FBAuth, fetchOnePlant);

// Fetch all plants by user
app.get('/plant', FBAuth, fetchUserPlants);

// Fetch a specific plant's activities
app.get('/plant/:plantId/activity', FBAuth, fetchPlantActivities);


// ==========Activity Routes==========
// Creates a new activity from a specific plants route
app.post('/plant/:plantId/activity', FBAuth, createNewActivity);

// Deletes a specific activity
app.delete('/plant/:plantId/:activityId', FBAuth, deleteOneActivity);

// Updates a specific activty
app.post('/plant/:plantId/:activityId', FBAuth, updateActivity);

// Fetches all of the activities
app.get('/activity', FBAuth, fetchAllActivities);

// Fetch a specified activity
// Should this route be /plant/:plantId/:activityId
app.get('/activity/:activityId', FBAuth, fetchOneActivity);


exports.api = functions.https.onRequest(app);
