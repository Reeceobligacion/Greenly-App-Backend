const { db } = require('../util/admin'); 

// Create New Plant
exports.createNewPlant = (req,res) => {

    const newPlant = {
        createdAt: new Date().toISOString(),
        userHandle: req.user.handle,
        userId: req.user.uid,
        plantName: req.body.plantName,
        datePlanted: req.body.datePlanted,
        careNotes: req.body.careNotes,
        plantLocation: req.body.plantLocation
    };

    db
        .collection('plants')
        .add(newPlant)
        .then(doc => {
            const resPlant = newPlant;
            resPlant.plantId = doc.id;
            res.json(resPlant);
        })
        .catch(err => {
            res.status(500).json({ error: 'Oops! Something went wrong while posting a new plant'});
            console.error(err);
        })
};

// Fetch a specific plant's activities
exports.fetchPlantActivities = (req, res) => {

    db
        .collection('activitylog')
        .where('userId', '==', req.user.user_id)
        .where('plantId', '==', req.params.plantId)
        .get()
        .then(data => {
            let plantActivities = [];
            data.forEach((doc) => { //Grab each activity and only the wanted information
                plantActivities.push({
                    activityTitle: doc.data().activityTitle,
                    dataPerformed: doc.data().datePerformed,
                    notes: doc.data().notes,
                    plantImgUrl: doc.data().plantImgUrl
                });

            });
            return res.json(plantActivities);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });

};

// Fetch all plants by user
exports.fetchUserPlants = (req, res) => {

    db
        .collection('plants')
        .where('userId', '==', req.user.user_id)
        .get()
        .then(data => {
            let usersPlants = [];
            data.forEach((doc) => { //Grab each activity and only the wanted information
                usersPlants.push({
                    plantName: doc.data().plantName,
                    datePlanted: doc.data().datePlanted,
                    careNotes: doc.data().careNotes,
                    plantLocation: doc.data().plantLocation
                });

            });
            return res.json(usersPlants);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });

};

// Fetch one plant
exports.fetchOnePlant = (req, res) => {

    db
        .doc(`/plants/${req.params.plantId}`)
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Plant not found' });
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

// Deletes the specified plant
exports.deleteOnePlant = (req, res) => {
    // Create a document variable since you will be calling it to delete
    const document = db.doc(`/plants/${req.params.plantId}`);

    document
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Plant not found' });
            }
            if(doc.data().userId !== req.user.user_id){
                return res.status(403).json({ error: 'Unauthorized' });
            } else { // If its the verified user, delete the specific plant entry
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Plant has been deleted successfully' });
        })
        .catch(err => {
            res.status(500).json({ error: err.code });
        });

};

// Udpates the specific plant
exports.updatePlant = (req, res) => {
    const document = db.doc(`/plants/${req.params.plantId}`);

    const newPlantDetails = {
        plantName: req.body.plantName,
        datePlanted: req.body.datePlanted,
        careNotes: req.body.careNotes,
        plantLocation: req.body.plantLocation
    };

    document
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Plant not found' });
            }
            if(doc.data().userId !== req.user.user_id){
                return res.status(403).json({ error: 'Unauthorized user, please sign in to update this plant' });
            } else {
                return doc.ref.update(newPlantDetails);
            }
        })
        .then(() => {
            res.json({ message: 'Plant has been updated successfully' });
        })
        .catch(err => {
            res.status(500).json({ error: err.code });
        });

};