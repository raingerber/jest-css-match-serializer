# jest-css-match-serializer

Take snapshots of the CSS that applies to an HTML snippet. Uses [find-css-matches](https://github.com/raingerber/find-css-matches).

## Why?

HTML and CSS have a fragile relationship. Changing either one can have unexpected results, and modifying a selector is perilous when you're not sure what HTML it's targeting.

By using `jest-css-match-serializer`, you can monitor these changes more effectively:

1. When you change a selector, know what elements were targeted before and after the change

2. When you change the CSS within a selector, know what elements were affected

3. When you change some HTML, know if that changed the applicable selectors

## Example:

```js
const serializerFactory = require('jest-css-match-serializer')

const styles = `
  .parent {
    color: blue;
  }
  .parent .child {
    color: purple;
  }
  .parent .child + .child {
    color: green;
  }
`

const html = `
  <div class="parent">
    <div class="child">one</div>
    <div class="child">two</div>
  </div>
`

const options = {
  recursive: true,
  includePartialMatches: false
}


const findMatches = serializerFactory(styles, options, expect)

it('should verify the selectors did not change', async () => {
  expect(await findMatches(html)).toMatchSnapshot()
})
```

**snapshot:**

```
[0]
.parent

  [0]
  .parent .child

  [1]
  .parent .child

  .parent .child + .child
```

## API

## serializerFactory(styles, [instanceOptions], [expect]) => Function

Returns a `findMatches` function for creating snapshots

**styles**

type: `string | object | array`

Either a CSS string, object, or array of objects that each have a **url**, **path**, or **content** property. Objects are forwarded to [Puppeteer#addStyleTag](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions)

**instanceOptions**

type: `object`

See the `findMatches#options` description

**expect**

Jest's `expect` object, which is used to register the serializer. Alternatively, you can omit this parameter and call [expect.addSnapshotSerializer](https://facebook.github.io/jest/docs/en/expect.html#expectaddsnapshotserializerserializer) with the returned function. This can be helpful if you export `findMatches` for use in separate files:

`test-utils.js`

```js
const serializerFactory = require('jest-css-match-serializer')

const styles = [
   { path: './styles.css' },
   { url: 'www.files.com/styles.css' },
   { content: '.other-css { color: green; }' }
]

// not passing "expect" to the factory function
const findMatches = serializerFactory(styles, options)

module.exports = { findMatches }
```

`index.test.js`

```js
const { findMatches } = require('./test-utils')

// register the serializer
expect.addSnapshotSerializer(findMatches)

it('can now use the css match serializer', async () => {
  expect(await findMatches('<div></div>')).toMatchSnapshot()
})
```

## findMatches(html, [options]) => Object

Async function that's returned by `serializerFactory`. It takes an HTML string and returns the selectors that apply to each element (if no selectors apply, the snapshot will contain `<NULL>`). To create the snapshot, the `findMatches` return value should be passed to `expect`.

**html**

type: `string`

**options**

type: `object`

These are merged into the `instanceOptions`, and the result is passed to [find-css-matches](https://github.com/raingerber/find-css-matches).

**options.includePartialMatches**

type: `boolean`

default: `true`

Include [partial matches](https://github.com/raingerber/find-css-matches#partial-matching).

**options.recursive**

type: `boolean`

default: `true`

Include matches for the child elements. In the snapshot, each child is preceded by its index.

**options.includeHtml**

type: `boolean`

default: `false`

Include an HTML string for each element that's visited.

```
[0]
<div class="parent">
.parent

  [0]
  <div class="child">
  .parent .child
```

**options.includeCss**

type: `boolean`

default: `false`

Include the CSS declarations for each matching selector. If any declaration changes for a selector, you will know exactly what changed.

```
[0]
.parent
color: blue

  [0]
  .parent .child
  color: purple
```

**options.includeCssHash**

type: `boolean`

default: `false`

Include a hash for the CSS in each selector. This option is more concise than `includeCss` (which it overrides), but it gives you less information. You will know when the CSS changes for an element, but you won't know the declarations that changed. Uses [object-hash](https://www.npmjs.com/package/object-hash).

```
[0]
.parent
cdb0a17684dda4bd0f66b197b66ded10088f867c

  [0]
  .parent .child
  d080809f96f43a17d2441766c5d230c2152567e5
```

## React Example

```js
const ReactDOMServer = require('react-dom/server')

const serializerFactory = require('jest-css-match-serializer')

const { TabComponent } = require('./TabComponent')

const styles = { path: './tab.css' }

const findMatches = serializerFactory(styles, {}, expect)

function findMatchesFromJsx (jsx) {
  return findMatches(ReactDOMServer.renderToString(jsx))
}

it('works with jsx too', async () => {
  const matches = await findMatchesFromJsx(<TabComponent />)
  expect(matches).toMatchSnapshot()
})
```
