'use strict';

exports.DATABASE_URL = 'mongodb://localhost:27017/albumDb'|| process.env.DATABASE_URL ;
//exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/testAlbumDb';
exports.PORT = process.env.PORT || 8080;