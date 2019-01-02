const express = require('express');
const router = express.Router();

const { Album } = require('./models');

//get all the albums in the db
router.get('/', (req, res) => {
    Album
        .find()
        .then(albums => {
            res.json(albums.map(album => album.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

//get an album by a specific id
router.get('/:id', (req, res) => {
    Album
        .findById(req.params.id)
        .then(album => res.json(album.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

//add a new album to the db
router.post('/', (req, res) => {
    console.log(req);
    const requiredFields = ['bandName', 'albumName', 'releaseYear', 'format', 'notes'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
            if (!(field in req.body)) {
                const message = `Missing \`${field}\` in request body`;
                    console.error(message);
                return res.status(400).send(message);
            }
        }

Album
    .create({
        bandName: req.body.bandName,
        albumName: req.body.albumName,
        releaseYear: req.body.releaseYear,
        format: req.body.format,
        notes: req.body.notes
    })
    .then(album => res.status(201).json(album.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    });
});

//update a specific album in the db by id
router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
        error: 'Request path id and request body id values must match'
    });
}

    const updated = {};
    const updateableFields = ['bandName', 'albumName', 'releaseYear', 'format', 'notes'];
        updateableFields.forEach(field => {
            if (field in req.body) {
                updated[field] = req.body[field];
            }
        });

Album
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

//delete an album by id
router.delete('/:id', (req, res) => {
    Album
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted album with id \`${req.params.id}\``);
            res.status(204).end();
        });
    });

module.exports = router;