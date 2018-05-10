const chalk = require('chalk') // TODO remove chalk
const objectHash = require('object-hash')
const {findMatches} = require('../find-css-matches/dist/index.cjs.js')

const INDENTATION = '  '

// TODO find a better name
const OBJECT_ID = '___JEST__CSS__MATCH__SERIALIZER__OBJECT___'

const OPTIONS_FOR_FIND_CSS_MATCHES = [
  'findPartialMatches',
  'recursive',
  'includeHtml',
  'includeCss'
]

const pick = (keys, obj) => keys.reduce((acc, key) => {
  if (obj[key] !== undefined) {
    acc[key] = obj[key]
  }

  return acc
}, {})

const formatSelector = (a, b) => [a, b ? chalk.underline(b) : b]

const cssHashFormatter = (cssArray, indent) => {
  return `${indent}${chalk.dim(objectHash(cssArray))}`
}

const cssListFormatter = (cssArray, indent) => {
  return `${indent}${cssArray.map(css => chalk.dim(css)).join(`\n${indent}`)}`
}

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
  let result = html ? `${indent}${html}\n` : ''
  if (matches.length) {
    result += matches.map(({selector, mediaText, css}) => {
      // split the selector into separate lines
      let str = `${indent}${selector.replace(/,\s*/g, `,\n${indent}`)}`
      if (mediaText) {
        str += `\n${indent}@media ${mediaText}`
      }

      if (css && options.formatCss) {
        str += `\n${options.formatCss(css, indent)}`
      }

      return str
    }).join('\n')
  } else {
    result += `${indent}<NULL>` // TODO mention this in the readme
  }

  indent += INDENTATION
  if (children) {
    result += children.map((child, index) => {
      return `\n${indent}${index}\n${stringify(child, options, indent)}`
    }).join('')
  }

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
    const userOptions = Object.assign({}, instanceOptions, localOptions)
    const options = pick(OPTIONS_FOR_FIND_CSS_MATCHES, userOptions)

    options.formatSelector = formatSelector

    let formatCss
    if (userOptions.includeCssHash === true) {
      formatCss = cssHashFormatter
      options.includeCss = true
    } else if (options.includeCss === true) {
      formatCss = cssListFormatter
    }

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
