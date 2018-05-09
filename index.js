const os = require('os')
const chalk = require('chalk') // TODO use chalk more
const objectHash = require('object-hash')
const {findMatches} = require('/Users/matthewarmstrong/Desktop/projects/find-css-matches/dist/index.cjs.js')

const INDENTATION = '  '

const OBJECT_ID = '___JEST__CSS__MATCH__SERIALIZER__OBJECT___'

const formatSelector = (a, b) => [a, b ? `???${b}???` : b]

const cssHashFormatter = (cssArray, indent) => chalk.dim(`${indent}${objectHash(cssArray)}`)

const cssListFormatter = (cssArray, indent) => chalk.dim(`${indent}${cssArray.join(`${os.EOL}${indent}`)}`)

/**
 * stringifies an object from find-css-matches
 * @param {Object} param0
 * @param {Array<Object>} param0.matches
 * @param {Array<Object>} param0.children
 * @param {Object} options
 * @param {Function} options.formatCss
 * @param {String} indent
 */
function stringify ({html, matches, children}, options, indent = '') {
  let result = html ? `${indent}${html}${os.EOL}` : ''
  result += matches.map(({selector, mediaText, css}) => {
    let str = `${indent}${selector}`
    if (mediaText) {
      str += `${os.EOL}${indent}${mediaText}`
    }

    if (css && options.formatCss) {
      str += `${os.EOL}${options.formatCss(css, indent)}`
    }

    return str
  }).join(os.EOL)

  indent += INDENTATION
  result += children.map(child => { // TODO add index? maybe just do that if html is not there
    return `${os.EOL}${os.EOL}${stringify(child, options, indent)}`
  }).join('')

  return result
}

/**
 * @param {Array|String|Object} styles
 * @param {Object} instanceOptions
 * @param {Object} expect
 * @returns {Function}
 */
function serializer (styles, instanceOptions, expect) {
  /**
   * @param {String} html
   * @param {Object} localOptions
   * @returns {Array}
   */
  async function findMatchesForSnapshot (html, localOptions) {
    const options = Object.assign({formatSelector}, instanceOptions, localOptions)

    let formatCss
    if (options.includeCssHash === true) {
      formatCss = cssHashFormatter
      options.includeCss = true
    } else if (options.includeCss === true) {
      formatCss = cssListFormatter
    }

    // TODO how should we format really long selectors?
    // TODO if a selector uses commas, put each part on a separate line
    const matches = await findMatches(styles, html, options)
    const value = stringify(matches, {formatCss}, '')
    return {value, [OBJECT_ID]: true}
  }

  findMatchesForSnapshot.test = test
  findMatchesForSnapshot.print = ({value}, serialize) => value

  if (expect && typeof expect.addSnapshotSerializer === 'function') {
    expect.addSnapshotSerializer(findMatchesForSnapshot)
  }

  return findMatchesForSnapshot
}

/**
 * @param {*} value
 * @returns {Boolean}
 */
function test (value) {
  return !!value && typeof value === 'object' && value[OBJECT_ID] === true
}

module.exports = serializer
