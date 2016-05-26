'use strict';

import { watch } from './chrome-bookmarks';

module.exports = ({ app, shell, logger, matchutil }) => {

  let bookmarks;

  function startup() {
    watch(function watchBookmarks(err, result) {
      if (err) {
        logger.log(`error: ${err.stack}`);
        return;
      }

      bookmarks = result;
    });
  };

  function search(query, res) {
    res.add(_makeCommandsHelp(query));
  };

  function execute(id) {
    const result = bookmarks.find(_ => _.name === id);

    if (result) {
      app.close();
      shell.openExternal(result.url);
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
