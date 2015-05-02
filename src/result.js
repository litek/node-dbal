'use strict';

exports.extend = function(res) {
  res.all = function() {
    return res.rows;
  };

  res.row = function(i) {
    return res.rows[i || 0];
  };
  
  res.col = res.column = function(key) {
    if (!res.rowCount) return undefined;
    key = key || Object.keys(res.rows[0])[0];
    return res.rows[0][key];
  };

  return res;
};

exports.promise = function(p) {
  ['all', 'row', 'col', 'column'].forEach(function(fn) {
    p[fn] = function() {
      var args = [].slice.call(arguments);

      return p.then(function(res) {
        return res[fn].apply(res, args);
      });
    };
  });

  return p;
};
