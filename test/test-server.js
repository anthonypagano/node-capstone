const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require('mongoose');

const {Album} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
require('dotenv').config();
const expect = chai.should();

chai.use(chaiHttp);

function seedEntryData() {
  console.info('seeding album data');
  const seedData = [
    { bandName: "Kiss", albumName: "Hotter Than Hell", releaseYear: "1974", format: "8 track", notes: "second album from the same year"},    
    { bandName: "Van Halen", albumName: "1984", releaseYear: "1984", format: "vinyl", notes: "biggest but last tour with original lineup"},
    { bandName: "Judas Priest", albumName: "Turbo", releaseYear: "1986", format: "cassette", notes: "No explanation needed"},
    { bandName: "Metallica", albumName: "Ride The Lightning", releaseYear: "1984", format: "cassette", notes: "Picking up steam overseas too at this point"},
    { bandName: "Iron Maiden", albumName: "Number Of The Beast", releaseYear: "1982", format: "cassette", notes: "Major US breakthrough"},
    { bandName: "Black Sabbath", albumName: "Paranoid", releaseYear: "1971", format: "vinyl", notes: "two albums in the same year"},              
  ];

  return Album.insertMany(seedData);
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe("Do I Have That Album app", function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedEntryData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  it("should return index html", function() {
    return chai
      .request(app)
      .get("/")
      .then(res => {
        res.should.have.status(200);
        res.should.be.html;
      });
  });

  describe('GET endpoint', function() {

    it('should return all albums', function() {
      let res;
      return chai.request(app)
        .get('/albums')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          res.body.should.have.lengthOf.at.least(1);

          return Album.count();
        })
        .then(count => {
          res.body.should.have.lengthOf(count);
        });
    });

    it('should return albums with right fields', function() {
      let resAlbum;
      return chai.request(app)
        .get('/albums')
        .then(function (res) {

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.lengthOf.at.least(1);

          res.body.forEach(function (post) {
            post.should.be.a('object');
            post.should.include.keys('id', 'bandName', 'albumName', 'releaseYear', 'format', 'notes', 'dateAdded');
          });
          // just check one of the posts that its values match with those in db
          // and we'll assume it's true for rest
          resAlbum = res.body[0];
          return Album.findById(resAlbum.id);
        })
        .then(album => {
          resAlbum.bandName.should.equal(album.bandName);
          resAlbum.albumName.should.equal(album.albumName);
          resAlbum.releaseYear.should.equal(album.releaseYear);
          resAlbum.format.should.equal(album.format);
        });
    });

    it('should return 5 most recent albums', function() {
        let res;
        return chai.request(app)
          .get('/recent')
          .then(_res => {
            res = _res;
            res.should.have.status(200);
            res.body.should.have.lengthOf.at.least(5);
          })
      });

    it('should return albums from a specific band', function() {

        let band = "Motorhead";
        let res;

        return chai.request(app)
          .get('/bands/' + band)
          .then(_res => {
            res = _res;
            res.should.have.status(200);
          })
      });

      it('should return an array of band names', function() {

        return chai.request(app)
          .get('/bands')
          .then(_res => {
            res = _res;
            res.should.have.status(200);
          })
      });
    });  

  describe('POST endpoint', function() {
    it('should add a new album', function() {

      const newAlbum = {
        bandName: "Kiss",
        albumName: "Love Gun",
        releaseYear: "1977",
        format: "8 track",
        notes: "I have the painting too"
      };

      return chai.request(app)
      .post('/albums')
      .send(newAlbum)
      .then(function (res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'bandName', 'albumName', 'releaseYear', 'format', 'notes');
        // cause Mongo should have created id on insertion
        res.body.id.should.not.be.null;
        res.body.bandName.should.equal(newAlbum.bandName);
        res.body.albumName.should.equal(newAlbum.albumName);
        res.body.releaseYear.should.equal(newAlbum.releaseYear);
        res.body.format.should.equal(newAlbum.format);        
        res.body.notes.should.equal(newAlbum.notes);   
        return Album.findById(res.body.id);
      })
      .then(function (post) {
        post.bandName.should.equal(newAlbum.bandName);
        post.albumName.should.equal(newAlbum.albumName);
        post.releaseYear.should.equal(newAlbum.releaseYear);
        post.format.should.equal(newAlbum.format);
        post.notes.should.equal(newAlbum.notes);
      });
    });
  });

  describe('PUT endpoint', function() {
  it('update an album', function() {
      const updateAlbum  = {
        bandName: "Motorhead",
        albumName: "Ace Of Spades",
        releaseYear: "1981",
        format: "LP",
        notes: "major US break through"
      };

      return Album
        .findOne()
        .then(album => {
            updateAlbum.id = album.id;

          return chai.request(app)
            .put(`/albums/${album.id}`)
            .send(updateAlbum);
        })
        .then(res => {
          res.should.have.status(204);
          return Album.findById(updateAlbum.id);
        })
        .then(album => {
          album.bandName.should.equal(updateAlbum.bandName);
          album.albumName.should.equal(updateAlbum.albumName);
          album.releaseYear.should.equal(updateAlbum.releaseYear);
          album.format.should.equal(updateAlbum.format);     
          album.notes.should.equal(updateAlbum.notes);
        });
    });
  });
  
  describe('DELETE endpoint', function() {
    it('delete an album by id', function() {

    let album;

    return Album
        .findOne()
        .then(_album => {
        album = _album;
        return chai.request(app).delete(`/albums/${album.id}`);
        })
        .then(res => {
        res.should.have.status(204);
        return Album.findById(album.id);
        })
    });
  });
});
