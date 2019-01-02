const express = require('express');
const router = express.Router();

const { Album } = require('./models');

// get a list of all band names to populate landing page dropdown list from
router.get('/', (req, res) => {
    Album
        .distinct("bandName").sort()
        .then(albums => {
            res.json(albums);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

// get all the albums by a selected band name
router.get('/:bandName', (req, res) => {
    Album
        .find({bandName: req.params.bandName})
        .sort({albumName: req.params.albumName})
        .then(albums => {
            res.json(albums.map(album => album.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

module.exports = router;