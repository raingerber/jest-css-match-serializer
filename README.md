# jest-css-match-serializer

Take snapshots of the CSS selectors that apply to each element of an HTML snippet. Uses [find-css-matches](https://github.com/raingerber/find-css-matches).

## Why?

HTML and CSS have a fragile relationship. Small changes to either one can inadvertently change the styling, often in places you didn't expect or intend.

## Example:

```js
const serializerFactory = require('jest-css-match-serializer')

const css = `
  .b {
    color: blue;
  }

  .a .b {
    color: purple;
  }

  .c {
    color: red;
  }
`

const options = {
  findPartialMatches: true
}

const findMatches = serializerFactory(css, options, expect)

// the findMatches function will find all the selectors
// from index.css that could potentially match the given 
// html fragment; in this example, the html matches the
// selectors ".a", ".a.b", and ".a .b" (because it will
// match that selector if it has a parent with ".a")

it('should make sure the selectors do not change', async () => {
  const html = '<div class="b"></div>'
  const matches = await findMatches(html)
  expect(matches).toMatchSnapshot()
})

it('should make sure the selectors do not change', () => {
  const html = '<div class="b"></div>'
  return findMatches(html).then(matches => {
    expect(matches).toMatchSnapshot()
  })
})

// TODO add the snapshot

```

## API

TODO rename "serializer"

## serializerFactory(styles, [instanceOptions], [expect]) => findMatches

Returns the function that will create the snapshots

**styles**

type: `string | object | array`

Either a CSS string, object, or array of objects that each have a **url**, **path**, or **content** property. Objects are forwarded to [Puppeteer#addStyleTag](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions)

**instanceOptions**

type: `object`

TODO

**expect**

Jest's `expect` object, which is used to register the serializer. Alternatively, you can omit this parameter and manually call [expect.addSnapshotSerializer](https://facebook.github.io/jest/docs/en/expect.html#expectaddsnapshotserializerserializer) with the returned function. This can be useful if you create `findMatches` in a separate file:

`test-utils.js`

```js
const serializerFactory = require('jest-css-match-serializer')

const styles = [
   { path: './local-stylesheet.css' },
   { url: 'www.files.com/remote-stylesheet.css' },
   { content: '.random-css { color: green; }' }
]

const options = { recursive: true }

// we don't pass "expect" to the factory function,
// because we're using the function in a separate file
// (which is going to have a different expect object)
const findMatches = serializerFactory(styles, options)

module.exports = { findMatches }
```

`index.test.js`

```js
const { findMatches } = require('./test-utils')

// register the serializer
expect.addSnapshotSerializer(findMatches)

it('can now use the findMatch serializer', () => {
  expect(findMatches('<div></div>')).toMatchSnapshot()
})
```

## findMatch(html, [options])

Returns an object

This function is returned by `serializer`. It takes an HTML string and returns the selectors that apply to each element. The return value should be passed to `expect`, which will create the snapshot.

**html**

type: `string`

**options**

type: `object`

These are merged with the `instanceOptions`, and the result is passed to [find-css-matches](https://github.com/raingerber/find-css-matches).

**options.findPartialMatches**

**options.recursive**

**options.includeHtml**

**options.includeCss**

**options.includeCssHash**

## React Example

```js
// helper.js

const ReactDOMServer = require('react-dom/server')

const { serializer } = require('jest-css-match-serializer')

const styles = [{ path: './index.css' }]

const options = {}

const findMatches = serializer(styles, options, expect)

function findMatchesFromJsx (jsx) {
  return findMatches(ReactDOMServer.renderToString(jsx))
}

it('works with jsx too', async () => {
  const element = <div className="a b" />
  const matches = await findMatchesFromJsx(element)
  expect(matches).toMatchSnapshot()
})
```
