const fs = require('fs');

const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;

fs.readlink = function(path, ...args) {
  const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
  if (cb) {
    args[args.length - 1] = function(err, linkString) {
      if (err && (err.code === 'EISDIR' || err.code === 'EINVAL')) {
        err.code = 'EINVAL';
      }
      return cb(err, linkString);
    };
  }
  return origReadlink.apply(this, [path, ...args]);
};

fs.readlinkSync = function(path, options) {
  try {
    return origReadlinkSync.call(this, path, options);
  } catch (err) {
    if (err && (err.code === 'EISDIR' || err.code === 'EINVAL')) {
      err.code = 'EINVAL';
    }
    throw err;
  }
};

// Also for fs.promises.readlink
if (fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function(path, options) {
    try {
      return await origPromisesReadlink.call(this, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'EINVAL')) {
        err.code = 'EINVAL';
      }
      throw err;
    }
  };
}
