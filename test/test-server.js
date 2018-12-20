const chai = require("chai");
const chaiHttp = require("chai-http");

const {app, runServer, closeServer} = require('../server');
const {DATABASE_URL} = require('../config');

const expect = chai.expect;

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
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

  it("should return add-album html", function() {
    return chai
      .request(app)
      .get("/add-album.html")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
  
  it("should return update-album html", function() {
    return chai
      .request(app)
      .get("/update-album.html")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  }); 
});
