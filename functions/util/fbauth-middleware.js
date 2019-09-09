const { admin, db } = require('./admin');

// Authentication Middleware
// Pass into route, and intercepts the request, runs this code which verifies if user is authenticated, if authenticated, will run the code, if not then will send an error
// Bearer [token]
// Example: Bearer b4546jhnth45j63552tgbrnyrj46wteqgerhw
module.exports = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1]; // This splits the Bearer+Space and the token, then grabs the second element, which is the token
    } else {
        console.error('No token found')
        return res.status(403).json({ error: 'Unauthorized' });
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            console.log(decodedToken)
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1) // Limits results to one document
                .get();
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle;
            req.user.imageUrl = data.docs[0].data().imageUrl; 
            return next(); 
        })
        .catch(err => {
            console.error('Error while verifying token', err);
            return res.status(403).json(err);
        })
}