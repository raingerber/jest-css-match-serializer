const OBJECT_ID = '___JEST__CSS__MATCH__SERIALIZER__OBJECT___'

const chalk = require('chalk')

const identity = text => text

const DEFAULT_TRANSFORMS = {
  unmatched: identity,
  matched: identity,
  hash: identity
}

const SNAPSHOT_TRANSFORMS = {
  unmatched: identity,
  matched: (text) => chalk.underline(text),
  hash: (text) => chalk.dim(text)
}

const SNAZZY_TRANSFORMS = {
  unmatched: (text) => chalk.yellow(text),
  matched: (text) => chalk.green.underline(text),
  hash: (text) => chalk.dim(text)
}

/**
 * @param {Object} transforms
 * @param {Object} tree
 * @param {Array<Object>} tree.selectors
 * @param {Array<Object>} tree.children
 * @param {String} indent
 * @return {String}
 */
function stringify (transforms, {selectors, children}, indent) {
  let result = selectors.map(({mediaText, selector, hash}) => {
    const formatted = formatSelector(transforms, mediaText, selector, hash, indent)
    return `${indent}\n${formatted}`
  }).join('\n')

  indent += '  '
  result += children.map(child => {
    return `\n\n${stringify(transforms, child, indent)}`
  }).join('')

  return result
}

stringify.DEFAULT_TRANSFORMS = DEFAULT_TRANSFORMS
stringify.SNAPSHOT_TRANSFORMS = SNAPSHOT_TRANSFORMS
stringify.SNAZZY_TRANSFORMS = SNAZZY_TRANSFORMS

/**
 * @param {Object} transforms
 * @param {String} mediaText
 * @param {Array<Array<String>>} selectors
 * @param {String} hash
 * @param {String} indent
 * @return {String}
 */
function formatSelector (transforms, mediaText, selector, hash, indent) {
  const fullSelector = selector.map(([unmatched, matched]) => {
    let result = transforms.unmatched(unmatched)
    if (unmatched && matched) result += ' '
    result += transforms.matched(matched)
    return result
  }).join(', ')

  mediaText = mediaText ? `${transforms.unmatched(mediaText)}\n${indent}` : ''
  return `${indent}${mediaText}${fullSelector} ${transforms.hash(hash)}`
}

/**
 * Jest addSnapshotSerializer method
 * @param {*} value
 * @return {Boolean}
 */
function test (value) {
  return !!value && typeof value === 'object' && value[OBJECT_ID] === true
}

/**
 * Jest addSnapshotSerializer method
 * @param {Object} tree
 * @param {Function} serialize
 * @return {String}
 */
function print (tree, serialize) {
  return stringify(SNAPSHOT_TRANSFORMS, tree, '')
}

module.exports = {
  OBJECT_ID,
  stringify,
  test,
  print
}
