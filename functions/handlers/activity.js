const { db } = require('../util/admin'); 

// Fetches all of the activities from the logged in user
exports.fetchAllActivities = (req, res) => {

    db
        .collection('activitylog')
        .where('userId', '==', req.user.uid)
        .get()
        .then(data => {
            let activities = [];
            data.forEach((doc) => { //Grab each activity and only the desired information
                activities.push({
                    activityTitle: doc.data().activityTitle,
                    dataPerformed: doc.data().datePerformed,
                    notes: doc.data().notes,
                    plantImgUrl: doc.data().plantImgUrl
                });

            });
            return res.json(activities);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });

};

// Creates a new activity
exports.createNewActivity = (req,res) => {

    const newActivity = {
        createdAt: new Date().toISOString(),
        activityTitle: req.body.activityTitle,
        datePerformed: req.body.datePerformed,
        notes: req.body.notes,
        plantImgUrl: req.body.plantImgUrl,
        userHandle: req.user.handle,
        userId: req.user.uid,
        plantId: req.params.plantId
    };

    db
        .collection('activitylog')
        .add(newActivity)
        .then(doc => {
            const resActivity = newActivity;
            resActivity.activityId = doc.id;
            res.json(resActivity);
        })
        .catch(err => {
            res.status(500).json({ error: 'Oops! Something went wrong while posting a new activity'});
            console.error(err);
        })

};

// Fetches a specific activity
exports.fetchOneActivity = (req, res) => {

    db
        .doc(`/activitylog/${req.params.activityId}`)
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Activity not found' });
            }
            if(doc.data().userId !== req.user.user_id){ // Restrict activity data to the logged in user
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return res.json(doc.data());
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });

};

// Deletes a specific activity
exports.deleteOneActivity = (req, res) => {
    const document = db.doc(`/activitylog/${req.params.activityId}`);

    document
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Activity not found' });
            }
            if(doc.data().userId !== req.user.user_id){
                return res.status(403).json({ error: 'Unauthorized, please sign in to delete this activity' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Activity deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Updates the specific activity
exports.updateActivity = (req, res) => {
    const document = db.doc(`/activitylog/${req.params.activityId}`);

    const updateActivity = {
        activityTitle: req.body.activityTitle,
        datePerformed: req.body.datePerformed,
        notes: req.body.notes,
        plantImgUrl: req.body.plantImgUrl
    };

    document
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Activity not found' });
            }
            if(doc.data().userId !== req.user.user_id){
                return res.status(403).json({ error: 'Unauthorized user, please sign in to update activity' });
            } else {
                return doc.ref.update(updateActivity);
            }
        })
        .then(() => {
            res.json({ message: 'Activity has been updated successfully' });
        })
        .catch(err => {
            res.status(500).json({ error: err.code });
        });

};