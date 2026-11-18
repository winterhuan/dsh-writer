import { expect, it } from 'vitest'
import { markdownToSafeHtml } from '../src/client/markdown.ts'
import { applyEol, detectEol, eolLabel, normalizeEol } from '../src/client/eol.ts'

it('escapes HTML and renders headings, lists, and code', () => {
  const html = markdownToSafeHtml('# Title\n\n- a <b>x</b>\n\n```\ncode <em>\n```\n\n**bold** and *em*')
  expect(html).toContain('<h1 data-line="1">Title</h1>')
  expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
  expect(html).toContain('<li data-line="3">')
  expect(html).toContain('<strong>bold</strong>')
  expect(html).toContain('<em>em</em>')
  expect(html).toContain('code &lt;em&gt;')
  expect(html).not.toContain('<b>x</b>')
})

it('renders GFM tables with alignment and escaped cell content', () => {
  const html = markdownToSafeHtml('| Name | Author | Detail |\n|:---|:---:|---:|\n| <b>A</b> | **me** | ok |\n| B\\|C | you | `x|y` |')

  expect(html).toContain('<div class="writer-preview-table" data-line="1" tabindex="0"><table>')
  expect(html).toContain('<th scope="col" style="text-align:left">Name</th>')
  expect(html).toContain('<th scope="col" style="text-align:center">Author</th>')
  expect(html).toContain('<th scope="col" style="text-align:right">Detail</th>')
  expect(html).toContain('<td style="text-align:left">&lt;b&gt;A&lt;/b&gt;</td>')
  expect(html).toContain('<td style="text-align:center"><strong>me</strong></td>')
  expect(html).toContain('<td style="text-align:left">B|C</td>')
  expect(html).toContain('<td style="text-align:right"><code>x|y</code></td>')
  expect(html).not.toContain('<b>A</b>')
})

it('detects and restores EOL styles', () => {
  expect(detectEol('a\r\nb\r\n')).toBe('\r\n')
  expect(detectEol('a\nb\n')).toBe('\n')
  expect(detectEol('a\rb\r')).toBe('\r')
  expect(normalizeEol('a\r\nb\rc')).toBe('a\nb\nc')
  expect(applyEol('a\nb', '\r\n')).toBe('a\r\nb')
  expect(eolLabel('\r\n')).toBe('CRLF')
  expect(eolLabel('\n')).toBe('LF')
})
