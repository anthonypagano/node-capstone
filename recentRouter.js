const express = require('express');
const router = express.Router();

const { Album } = require('./models');

//get the 5 most recently entered albums
router.get('/', (req, res) => {
    Album
        .find().sort({dateAdded: -1}).limit(5)
        .then(albums => {
            res.json(albums.map(album => album.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

module.exports = router;