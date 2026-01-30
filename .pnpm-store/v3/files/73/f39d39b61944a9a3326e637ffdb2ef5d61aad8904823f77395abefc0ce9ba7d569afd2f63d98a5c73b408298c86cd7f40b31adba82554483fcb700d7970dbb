'use strict'

/**
 * Calls the given function with the minimist-parsed command line options and exit the process with the returned number of the main function.
 * @param {Function} main The main function of the cli
 * @param {Object} opts The options
 * @param {string[]} argv The command line arguments. Default is process.argv.slice(2).
 */
module.exports = (main, opts, argv) => {
  argv = argv || process.argv.slice(2)

  return main(require('minimist')(argv, opts))
}
