/**
 * Babel configuration file for Expo.
 *
 * @param {Object} api - The Babel API object.
 * @returns {Object} The Babel configuration object.
 */
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
