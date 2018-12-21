'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/albumDb';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/testAlbumDb';
exports.PORT = process.env.PORT || 8080;