import assert from 'node:assert/strict'
import { type Component, expandComponents, handler, renderPage } from './main.ts'

const layout = '<head>{{head}}</head><body>{{body}}</body>'

const component = (name: string, template: string, style = ''): Component => ({ name, template, style })

const outer = component('Outer', '<div class="outer">{{body}}</div>')
const inner = component('Inner', '<span class="inner">{{body}}</span>')

Deno.test('dollar signs in content are kept as they are', () => {
  const page = "<Head><title>$$</title></Head><Template><p>$$5 $& $' $1</p></Template>"

  assert.equal(
    renderPage(page, layout, []),
    "<head><title>$$</title></head><body><p>$$5 $& $' $1</p></body>"
  )
})

Deno.test('a component at the very start of the page is expanded', () => {
  assert.equal(expandComponents('<Inner>x</Inner>', [inner]).body, '<span class="inner">x</span>')
})

Deno.test('every use of a component is expanded', () => {
  assert.equal(
    expandComponents('<Inner>a</Inner><Inner>b</Inner>', [inner]).body,
    '<span class="inner">a</span><span class="inner">b</span>'
  )
})

Deno.test('nested components are expanded in any registration order', () => {
  const expected = '<div class="outer"><span class="inner">x</span></div>'

  assert.equal(expandComponents('<Outer><Inner>x</Inner></Outer>', [outer, inner]).body, expected)
  assert.equal(expandComponents('<Outer><Inner>x</Inner></Outer>', [inner, outer]).body, expected)
})

Deno.test('components can use other components in their templates', () => {
  const card = component('Card', '<Outer><Inner>{{body}}</Inner></Outer>')

  assert.equal(
    expandComponents('<Card>x</Card>', [card, outer, inner]).body,
    '<div class="outer"><span class="inner">x</span></div>'
  )
})

Deno.test('a component using itself fails instead of looping forever', () => {
  const loop = component('Loop', '<Loop><b>{{body}}</b></Loop>')

  assert.throws(() => expandComponents('<Loop>x</Loop>', [loop]), /still expanding/)
})

Deno.test('component styles go in the head once, and only when used', () => {
  const styled = component('Styled', '<b>{{body}}</b>', '<style>b { color: red }</style>')
  const unused = component('Unused', '<i>{{body}}</i>', '<style>i { color: blue }</style>')
  const page = '<Head><title>T</title></Head><Template><Styled>a</Styled><Styled>b</Styled></Template>'

  assert.equal(
    renderPage(page, layout, [styled, unused]),
    '<head><title>T</title>\n<style>b { color: red }</style></head><body><b>a</b><b>b</b></body>'
  )
})

Deno.test('known routes return 200', async () => {
  const response = await handler(new Request('http://localhost/'))

  assert.equal(response.status, 200)
  assert.match(await response.text(), /<title>Home<\/title>/)
})

Deno.test('unknown routes return the 404 page with a 404 status', async () => {
  const response = await handler(new Request('http://localhost/missing'))

  assert.equal(response.status, 404)
  assert.match(await response.text(), /<title>Not found<\/title>/)
})
