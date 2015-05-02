'use strict';

exports.extend = function(res) {
  res.all = function() {
    return res.rows;
  };

  res.row = function(i) {
    return res.rows[i || 0];
  };
  
  res.column = function(key) {
    if (!res.rowCount) return undefined;
    key = key || Object.keys(res.rows[0])[0];
    return res.rows[0][key];
  };

  res.assign = function(target) {
    if (res.rowCount) {
      Object.keys(res.rows[0]).forEach(function(key) {
        target[key] = res.rows[0][key];
      });
    }

    return target;
  };

  return res;
};

exports.promise = function(p) {
  ['all', 'row', 'column', 'assign'].forEach(function(fn) {
    p[fn] = function() {
      var args = [].slice.call(arguments);

      return p.then(function(res) {
        return res[fn].apply(res, args);
      });
    };
  });

  return p;
};
