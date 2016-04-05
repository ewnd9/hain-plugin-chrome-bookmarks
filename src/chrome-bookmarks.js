'use strict';

import fs from 'fs';
import path from 'path';

const bookmarksPath = process.platform === 'linux' ?
  path.join(process.env.HOME, '.config', 'google-chrome', 'Default', 'Bookmarks') :
  path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'Bookmarks');

function loadBookmarks(cb) {
  fs.readFile(bookmarksPath, 'utf-8', (err, content) => {
    if (err) {
      cb(err);
      return;
    }

    const data = JSON.parse(content);
    const bookmarks = Object.keys(data.roots).reduce((total, key) => {
      return total.concat(data.roots[key] && data.roots[key].children || []);
    }, []);

    cb(null, bookmarks);
  });
};

module.exports = loadBookmarks;

module.exports.watch = function(interval, cb) {
  if (typeof interval === 'function') {
    cb = interval;
    interval = 60 * 1000; // 60 seconds
  }

  loadBookmarks(cb);

  require('chokidar')
    .watch(bookmarksPath, {
      usePolling: true,
      interval
    })
    .on('change', () => loadBookmarks(cb));
};
