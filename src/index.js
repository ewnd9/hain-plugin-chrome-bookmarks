'use strict';

import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';

module.exports = ({ app, shell, matchutil }) => {
  const bookmarksPath = process.platform === 'linux' ?
    path.join(process.env.HOME, '.config', 'google-chrome', 'Default', 'Bookmarks') :
    path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'Bookmarks');

  let bookmarks;

  function loadBookmarks() {
    fs.readFile(bookmarksPath, 'utf-8', (err, content) => {
      const data = JSON.parse(content);

      bookmarks = Object.keys(data.roots).reduce((total, key) => {
        return total.concat(data.roots[key] && data.roots[key].children || []);
      }, []);
    });
  };

  function startup() {
    loadBookmarks();

    chokidar
      .watch(bookmarksPath, { usePolling: true })
      .on('change', () => loadBookmarks())
  };

  function search(query, res) {
    res.add(_makeCommandsHelp(query));
  };

  function execute(id) {
    const result = bookmarks.find(_ => _.name === id);

    if (result) {
      shell.openExternal(result.url);
      app.close();
    }
  };

  // https://github.com/appetizermonster/hain/blob/e5385c07196b11825f2e9e24a19a774161c6fdbb/app/main-es6/plugins/hain-commands/index.js#L61
  function _makeCommandsHelp(query) {
    if (!bookmarks) {
      return [];
    }

    const ret = matchutil.head(bookmarks.map(_ => _.name), query, x => x).map(x => {
      return {
        id: x.elem,
        title: matchutil.makeStringBoldHtml(x.elem, x.matches),
        desc: '@ewnd9/hain-plugin-chrome-bookmarks'
      };
    });

    return ret;
  };

  return { startup, search, execute };
};
