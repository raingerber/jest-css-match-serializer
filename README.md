## Example:
https://github.com/raingerber/find-all-matches
```js
const { serializer } = require('jest-css-match-serializer')

expect.addSnapshotSerializer(serializer)

// the serializer function takes 1..n objects that are
// used to style a page in the internal puppeteer instance

https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions

const getSelectors = serializer([{ path: './index.css' }])

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

it('should make sure the selectors do not change', () => {
  const html = '<div class="a b"></div>'

  // the getSelectors function will find all the selectors
  // from index.css that could potentially match the given 
  // html fragment; in this example, the html matches the
  // selectors ".a", ".a.b", and ".a .b" (because it will
  // match that selector if it has a parent with ".a")
  return getSelectors(html).then(selectors => {
    expect(selectors).toMatchSnapshot()
  })
})

it('works with jsx too (if React and ReactDom are available in the project)', () => {
  return getSelectors(<div className="a b" />).then(selectors => {
    expect(selectors).toMatchSnapshot()
  })
})
```

TODO add screenshots to show what the output actually looks like (matching selectors + changed snapshots)


## API

`serializer(styles, [options]) => serialize`

Returns a serialize function

NOTE: this function should also be passed to Jest's `expect.addSnapshotSerializer` to register the serializer

**styles**

an array of objects, where each object has a `url`, `path`, or `content` key. These objects are forwarded to [Puppeteer#addStyleTag](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions)

**options**

optional config

**options.recursive**

when this is **true**, we return matches for the child elements along with the top-level element

`serialize(html)`

Takes JSX or an HTML string and returns an object with the selectors that match the given elements. The return value should not be used directly; it should be passed to `expect`, which will serialize the result for creating a snapshot.
