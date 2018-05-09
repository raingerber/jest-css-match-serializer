# jest-css-match-serializer

Take snapshots of the CSS selectors that apply to each element of an HTML snippet. Uses [find-all-matches](https://github.com/raingerber/find-all-matches).

## Why?

TODO

## Example:

```js
const { serializer } = require('jest-css-match-serializer')

const findMatches = serializer([{ path: './index.css' }], expect)

/*
index.css

.a {
  color: blue;
}

.a.b {
  color: red;
}

.a .b {
  color: green;
}

.a .b .c {
  color: purple;
}
*/

it('should make sure the selectors do not change', async () => {
  const html = '<div class="a b"></div>'

  // the getSelectors function will find all the selectors
  // from index.css that could potentially match the given 
  // html fragment; in this example, the html matches the
  // selectors ".a", ".a.b", and ".a .b" (because it will
  // match that selector if it has a parent with ".a")
  const matches = await findMatches(html)
  expect(matches).toMatchSnapshot()
})
```

## API

TODO rename "serializer"

`serializer(styles, [instanceOptions], [expect]) => findMatches`

Returns the function that will create the snapshots

**IMPORTANT:** if you don't pass `expect` as the third parameter, the returned function should be passed to [expect.addSnapshotSerializer](https://facebook.github.io/jest/docs/en/expect.html#expectaddsnapshotserializerserializer).


```js
// passing expect as the third parameter
const findMatches = serializer(styles, options, expect)

// is a shorter way of doing this
const findMatches = serializer(styles, options)
expect.addSnapshotSerializer(findMatches)
```

**styles**

type: `string | object | array`

Either a CSS string, object, or array of objects that each have a **url**, **path**, or **content** property. Objects are forwarded to [Puppeteer#addStyleTag](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions)

**instanceOptions**

type: `object`

TODO

**expect**

Jest `expect` object, which is used to register the snapshot serializer

`findMatch(html, [options])`

Returns an object

This function is returned by `serializer`. It takes an HTML string and returns the selectors that apply to each element. The return value should be passed to `expect`, which will create the snapshot.

**html**

type: `string`

**options**

type: `object`

These are merged with the `instanceOptions`, and the result is passed to [find-all-matches](https://github.com/raingerber/find-all-matches).

**options.recursive**

**options.findPartialMatches**

**options.formatSelector**

**options.includeHtml**

**options.includeCss**

**options.includeCssHash**

## React Example

```js
// helper.js

const ReactDOMServer = require('react-dom/server')

const { serializer } = require('jest-css-match-serializer')

const getSelectors = serializer([{ path: './index.css' }])

function getSelectorsFromJsx (jsx) {
  return getSelectors(ReactDOMServer.renderToString(jsx))
}

export { serializer, getSelectorsFromJsx }

// index.test.js

import { serializer, getSelectorsFromJsx } from './helper'

expect.addSnapshotSerializer(serializer)

it('works with jsx too', () => {
  const element = <div className="a b" />
  return getSelectorsFromJsx(element).then(selectors => {
    expect(selectors).toMatchSnapshot()
  })
})
```
