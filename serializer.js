const OBJECT_ID = '___JEST__CSS__MATCH__SERIALIZER__OBJECT___'

const chalk = require('chalk')

function stringify ({selectors, children}, indent = '') {
  let result = selectors.map(({mediaText, selector, hash}) => {
    return `${indent}\n${formatSelector(mediaText, selector, hash, indent)}`
  }).join('\n')

  result += children.map(child => {
    return `\n\n${stringify(child, `${indent}  `)}`
  }).join('')

  return result
}

function formatSelector (mediaText, selectors, hash, indent) {
  const selector = selectors.map(([unmatched, matched]) => {
    let result = chalk.yellow(unmatched)
    if (unmatched && matched) result += ' '
    result += chalk.green.underline(matched)
    return result
  }).join(', ')

  return `${indent}${mediaText ? `${chalk.yellow(mediaText)}\n${indent}` : ''}${selector} ${chalk.dim(hash)}`
}

/**
 * @param {*} value
 * @return {Boolean}
 */
function test (value) {
  return !!value && typeof value === 'object' && value[OBJECT_ID] === true
}

/**
 * @param {Object} value
 * @param {Function} serialize
 * @return {String}
 */
function print (value, serialize) {
  return serialize(`${OBJECT_ID}\n${stringify(value)}`)
}

module.exports = {
  OBJECT_ID,
  stringify,
  test,
  print
}
