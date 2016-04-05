'use strict';

require('./dist/chrome-bookmarks').watch(100, function(err, bookmarks) {
  console.log(bookmarks.length, bookmarks.slice(-2).map(_ => ({ name: _.name })));
});
