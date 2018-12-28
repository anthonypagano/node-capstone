'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Album } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

//get all the albums in the db
app.get('/albums', (req, res) => {
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
app.get('/albums/:id', (req, res) => {
    Album
        .findById(req.params.id)
        .then(album => res.json(album.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

//get the 5 most recently entered albums
app.get('/recent', (req, res) => {
    Album
        .find().limit(5).sort({$natural:-1})
        .then(albums => {
            res.json(albums.map(album => album.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

//get all the albums by a selected band name
app.get('/band/:bandName', (req, res) => {
    Album
        .find({bandName: req.params.bandName})
        .then(albums => {
            res.json(albums.map(album => album.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: '500 Server Error' });
        });
    });

//get a list of all band names to populate landing page dropdown list from
app.get('/bands', (req, res) => {
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

//add a new album to the db
app.post('/albums', (req, res) => {
    const requiredFields = ['bandName', 'albumName', 'releaseYear', 'format'];
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
app.put('/albums/:id', (req, res) => {
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
app.delete('/albums/:id', (req, res) => {
    Album
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted album with id \`${req.params.id}\``);
            res.status(204).end();
        });
    });


app.use('*', function (req, res) {
    res.status(404).json({ message: 'Not Found' });
});
  
// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchronously starting
// our server, since we'll be dealing with promises there.
function runServer(DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(DATABASE_URL, err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
  }
  

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.

function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }
  
// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}
  
module.exports = { runServer, app, closeServer };
  