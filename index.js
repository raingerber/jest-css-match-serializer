const objectHash = require('object-hash')
const underline = require('ansi-underline')
const {findMatches} = require('find-css-matches')

const INDENTATION = '  '

const SERIALIZER_ID = '___JEST__CSS__MATCH__SERIALIZER__OBJECT___'

const OPTIONS_KEY_ARRAY = [
  'recursive',
  'includeHtml',
  'includeCss',
  'includePartialMatches'
]

const formatSelector = (a, b) => [a, b ? underline(b) : b]

const cssHashFormatter = (cssArray, indent) => `${indent}${objectHash(cssArray)}`

const cssListFormatter = (cssArray, indent) => `${indent}${cssArray.join(`\n${indent}`)}`

/**
 * @param {Array<String>} keys
 * @param {Object} obj
 * @returns {Object}
 */
function pick (keys, obj) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key]
    }

    return acc
  }, {})
}

/**
 * stringifies an array of objects from find-css-matches
 * @param {Array<Object>} array
 * @param {Object} options
 * @param {String} indent
 * @returns {String}
 */
function stringifyArray (array, options, indent = '') {
  const result = array.map((child, index) => {
    return `${indent}[${index}]\n${stringify(child, options, indent)}`
  }).join('\n')

  if (indent === '') {
    return result.replace(/\n$/, '')
  }

  return result
}

/**
 * stringifies an object from find-css-matches
 * @param {Object} param0
 * @param {String} param0.html
 * @param {Array<Object>} param0.matches
 * @param {Array<Object>} param0.children
 * @param {Object} options
 * @param {Function} options.formatCss
 * @param {String} indent
 * @returns {String}
 */
function stringify ({html, matches, children = []}, options, indent = '') {
  let result = ''
  if (html) {
    result += `${indent}${html}\n`
  }

  if (matches.length) {
    result += matches.map(({selector, mediaText, css}) => {
      // split the selector into separate lines for each comma
      let str = `${indent}${selector.replace(/,\s*/g, `,\n${indent}`)}\n`
      if (mediaText) {
        str += `${indent}@media ${mediaText}\n`
      }

      if (css && options.formatCss) {
        str += `${options.formatCss(css, indent)}\n`
      }

      return str
    }).join('\n')
  } else {
    result += `${indent}<NULL>\n`
  }

  if (children.length) {
    indent += INDENTATION
    result += `\n${stringifyArray(children, options, indent)}`
  }

  return result
}

/**
 * @param {String|Object|Array<Object>} styles
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
    const options = pick(OPTIONS_KEY_ARRAY, userOptions)
    if (options.includePartialMatches) {
      options.formatSelector = formatSelector
    }

    let formatCss
    if (userOptions.includeCssHash === true) {
      formatCss = cssHashFormatter
      options.includeCss = true
    } else if (options.includeCss === true) {
      formatCss = cssListFormatter
    }

    let matches = await findMatches(styles, html, options)
    if (!Array.isArray(matches)) {
      matches = [matches]
    }

    const value = stringifyArray(matches, {formatCss}, '')
    return {value, [SERIALIZER_ID]: true}
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
  return !!value && typeof value === 'object' && value[SERIALIZER_ID] === true
}

module.exports = serializer
