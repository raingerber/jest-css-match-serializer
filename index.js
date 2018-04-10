const {getMatchingSelectors} = require('find-all-matches')

const {OBJECT_ID, stringify, test, print} = require('./serializer')

let ReactDOMServer

try {
  ReactDOMServer = require('react-dom/server')
} catch (e) {
  ReactDOMServer = {renderToString: input => input}
}

/**
 * @param {Object} instanceOptions
 * @param {Object} localOptions
 * @return {Object}
 */
function getOptions (instanceOptions, localOptions) {
  let {recursive} = localOptions
  if (typeof recursive === 'undefined') {
    recursive = !!instanceOptions.recursive
  } else {
    recursive = !!recursive
  }

  return {recursive}
}

/**
 * @param {Array<Object>} styles
 * @param {Object} instanceOptions
 * @return {Function}
 */
function serializer (styles, instanceOptions = {}) {
  /**
   * @param {String|ReactComponent} source
   * @return {Array}
   */
  async function parse (source, localOptions = {}) {
    let html = source
    if (typeof html !== 'string') {
      html = ReactDOMServer.renderToString(html)
    }

    const options = getOptions(instanceOptions, localOptions)
    const result = await getMatchingSelectors(html, styles, options)
    Object.defineProperty(result, OBJECT_ID, {value: true})
    return result
  }

  parse.test = test
  parse.print = print
  return parse
}

serializer.test = test
serializer.print = print

module.exports = {
  stringify,
  serializer
}
