const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require('mongoose');

const {Album} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {DATABASE_URL} = require('../config');

const expect = chai.should();

chai.use(chaiHttp);

describe("Do I Have That Album app", function() {
  before(function() {
    return runServer(DATABASE_URL);
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

  it("should return add-album html", function() {
    return chai
      .request(app)
      .get("/add-album.html")
      .then(res => {
        res.should.have.status(200);
        res.should.be.html;
      });
  });
  
  it("should return update-album html", function() {
    return chai
      .request(app)
      .get("/update-album.html")
      .then(res => {
        res.should.have.status(200);
        res.should.be.html;
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
        .then(_album => {
        should.not.exist(_album);
        });
    });
  });
});
