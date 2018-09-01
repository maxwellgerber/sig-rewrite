const wrapDefaults = require('./lib/wrapDefaults.js');
const wrapToOptions = require('./lib/wrapToOptions.js');
const wrapToBuilderPattern = require('./lib/wrapToBuilderPattern.js');

const required = ['toOptions', 'toBuilderPattern', 'defaults'];

/**
 * How does JSDoc work? No idea...
 * @param fn - The function to rewrite and wrap
 * @param opts
 * @param opts.toOptions {bool | string[]}
 * @param opts.toBuilderPattern bool
 * @param opts.builderTemplate Function
 * @param opts.defaults Object
 * @return fn - The wrapped function
 */
module.exports = (fn, opts) => {
  if (typeof fn !== 'function') {
    throw Error('First argument must be a function');
  }

  if (!required.some(key => key in opts && opts[key])) {
    throw Error(`sig-rewrite requires one of: { ${required.join(', ')} } to be specified`);
  }

  if (opts.toOptions === true && opts.toBuilderPattern === true) {
    throw Error('full toOptions and builder pattern are not compatible');
  }

  if (opts.builderTemplate && typeof opts.builderTemplate !== 'function') {
    throw Error('builderTemplate must be a function');
  }

  if (opts.builderTemplate && !opts.toBuilderPattern) {
    throw Error('Specifying builderTemplate when toBuilderPattern is not true is invalid');
  }

  let wrapped = fn;

  if (opts.defaults) {
    wrapped = wrapDefaults(wrapped, opts.defaults);
  }

  if (opts.toOptions) {
    wrapped = wrapToOptions(wrapped, opts.toOptions);
  }

  if (opts.toBuilderPattern) {
    wrapped = wrapToBuilderPattern(wrapped, opts.toBuilderPattern, opts.builderTemplate);
  }

  return wrapped;
};
