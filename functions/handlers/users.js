const { admin, db } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config)

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

// Signup Function ran in routes
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // Validate the data
    const { valid, errors } = validateSignupData(newUser); 
    if(!valid) return res.status(400).json(errors); // Used with validating

    // Give the user a blank profile picture after signing up
    const blankProfilePicture = 'blank_profile_picture.png';

    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get() 
        .then(doc => {
            if(doc.exists) { // Checks to see if user handle is already taken, if not, creates requested handle
                return res.status(400).json({ handle: 'this handle is already taken' });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {  // Sets an id for user
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => { // send an auth token to the user
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${blankProfilePicture}?alt=media`,
                userId 
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => { 
            return res.status(201).json({ token }); 
        })
        .catch(err => {
            console.error(err);

            if(err.code === 'auth/email-already-in-use'){ // If already signed up with email, send this message to the client
                return res.status(400).json({ email: 'Email is already in use' })
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
};

// Login user and send token once logged in
exports.login = (req,res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    // Validate the data
    const { valid, errors } = validateLoginData(user); 
    if(!valid) return res.status(400).json(errors); // Used with validating

    // Login for firebase
    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Wrong credentials, please try again' });
            } else {
                return res.status(500).json({ error: err.code });   
            }
        });
};

//Create user details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'User details have been added successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });

};

// Updates the users details
exports.updateUserDetails = (req, res) => {
    const document = db.doc(`/users/${req.user.handle}`);

    const newUserDetails = {
        name: req.body.name,
        bio: req.body.bio,
        age: req.body.age,
        location: req.body.location
    }

    document
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'User not found'});
            }
            if(doc.data().userId !== req.user.user_id){
                return res.status(403).json({ error: 'Unauthorized user' });
            } else {
                return doc.ref.update(newUserDetails);
            }
        })
        .then(() => {
            res.json({ message: 'Users details have been successfully updated' });
        })
        .catch(err => {
            res.status(500).json({ error: err.code });
        });

};