'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const albumSchema = mongoose.Schema({
  bandName: {type: String, required: true },
  albumName: {type: String, required: true },
  releaseYear: {type: String, required: true },
  format: {type: String, required: true },
  notes: {type: String, required: false },
  dateAdded: {type: Date, default: Date.now }
});

albumSchema.methods.serialize = function() {
  return {
    id: this._id,
    bandName: this.bandName,
    albumName: this.albumName,
    releaseYear: this.releaseYear,
    format: this.format,
    notes: this.notes,
    dateAdded: this.dateAdded
  };
};

const Album = mongoose.model('Album', albumSchema);

module.exports = {Album};
