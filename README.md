## Example:

```js

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

const {serializer} = require('jest-css-match-serializer')

expect.addSnapshotSerializer(serializer)

// the serializer function takes 1..n objects that are
// used to style a page in the internal puppeteer instance

https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions

const getSelectors = serializer([{ path: './index.css' }])

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

it('works with jsx too', () => {
  return getSelectors(<div className="a b" />).then(selectors => {
    expect(selectors).toMatchSnapshot()
  })
})
```