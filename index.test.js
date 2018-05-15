/* eslint-env jest */

const serializerFactory = require('./index')

describe('test with different option combinations', () => {
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
    body > section li.bb,
    #container li:not(li) {
      opacity: .5;
    }
    ${/* should have a mediaText property in the snapshot */''}
    @media (max-width: 599px) {
      ul,
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
          <li class="aa"></li>
          <li class="bb">
            <span>no css for me</span>
          </li>
          <li class="cc"></li>
        </ul>
      </div>
    </div>
  `
  const options = {
    recursive: false,
    includeHtml: false,
    includeCss: false,
    includeCssHash: false,
    includePartialMatches: false
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
    'includePartialMatches === true',
    {
      recursive: true,
      includePartialMatches: true
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
  executeFindMatchesTest(
    'includeCssHash === true',
    {
      recursive: true,
      includeCssHash: true
    }
  )
  executeFindMatchesTest(
    'includeCssHash takes precedence over includeCss',
    {
      includeCss: true,
      includeCssHash: true
    }
  )
})

describe('html with multiple root elements', () => {
  it('create a snapshot with multiple roots', async () => {
    const html = `
      <div></div>
      <div>
        <div></div>
      </div>
      <div></div>
      <div>
        <span></span>
        <span></span>
      </div>
    `
    const styles = `
      div {
        color: red;
      }
    `
    const options = {
      recursive: true,
      includeHtml: true,
      includeCssHash: true,
      includePartialMatches: false
    }
    const findMatches = serializerFactory(styles, options, expect)
    expect(await findMatches(html, options)).toMatchSnapshot()
  })
})
