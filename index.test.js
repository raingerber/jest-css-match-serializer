/* eslint-env jest */

const serializerFactory = require('./index')

describe('testing the different options', () => {
  // TODO test <html>, <head>, and <body> tags
  const styles = `
    ${/* full match */''}
    #container {
      color: magenta;
    }
    ${/* partial match */''}
    #container-container > #container {
      color: purple;
      transform: scale(.5);
    }
    ${/* each part of the selector will be on a separate line
         in the snapshot; some of them are partial matches */''}
    ul li.aa,
    body > section > #container li.bb,
    #container > div > ul > li:not(li) {
      opacity: .5;
    }
    ${/* should have a mediaText property in the snapshot */''}
    @media (max-width: 599px) {
      li + li:nth-child(2n) {
        font-size: 12px;
        padding: 20px;
        margin: 30px;
      }
    }
  `
  const html = `
    <div id="container">
      <div class="xx">
        <ul class="yy">
          <li class="aa">one</li>
          <li class="bb">two</li>
        </ul>
      <div>
    </div>
  `
  const options = {
    recursive: false,
    findPartialMatches: false,
    includeHtml: false,
    includeCss: false,
    includeCssHash: false
  }
  const findMatches = serializerFactory(styles, options, expect)
  function executeFindMatchesTest (message, options) {
    it(message, async () => {
      expect(await findMatches(html, options)).toMatchSnapshot()
    })
  }
  executeFindMatchesTest(
    'all options === false',
    {}
  )
  executeFindMatchesTest(
    'recursive === true',
    {
      recursive: true
    }
  )
  // using "recursive" so the snapshots will have more data
  executeFindMatchesTest(
    'findPartialMatches === true',
    {
      recursive: true,
      findPartialMatches: true
    }
  )
  executeFindMatchesTest(
    'includeHtml === true',
    {
      recursive: true,
      includeHtml: true
    }
  )
  executeFindMatchesTest(
    'includeCss === true',
    {
      recursive: true,
      includeCss: true
    }
  )
  // the next two snapshots should be the same
  executeFindMatchesTest(
    'includeCssHash === true',
    {
      recursive: true,
      includeCssHash: true
    }
  )
  executeFindMatchesTest(
    'options.includeCssHash takes precedence over options.includeCss',
    {
      includeCss: true,
      includeCssHash: true
    }
  )
})
