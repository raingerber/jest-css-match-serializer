const objectHash = require('object-hash')
const underline = require('ansi-underline')
const {findMatches} = require('../find-css-matches/dist/index.cjs.js')

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
  const isRoot = indent === ''

  let result = ''
  if (isRoot) {
    result += '[0]\n'
  }

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
    result += '\n' + children.map((child, index) => {
      return `${indent}[${index}]\n${stringify(child, options, indent)}`
    }).join('\n')
  }

  if (isRoot) {
    result = result.replace(/\n$/, '')
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

    const matches = await findMatches(styles, html, options)
    const value = stringify(matches, {formatCss}, '')
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
