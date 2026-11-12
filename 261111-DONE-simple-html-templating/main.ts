// Pages, the layout and components are plain HTML files that get combined
// with regular expressions and placeholder replacement.

// Resolve files relative to this script, not to the current directory
const website = new URL('./website/', import.meta.url)

const routes = [
  {
    path: '/',
    file: 'index.html'
  },
  {
    path: '/inquiry',
    file: 'inquiry.html'
  }
]

const errors = {
  '404': '404.html',
  '500': '500.html'
}

const layoutFile = 'layout.html'

// TODO: These should come directly from the file system, linking the component name with a file name.
const componentFiles = [
  {
    name: 'Component1',
    file: 'components/component1.html'
  },
  {
    name: 'Component2',
    file: 'components/component2.html'
  },
  {
    name: 'Component3',
    file: 'components/component3.html'
  }
]

// Expanding again and again means a component is (directly or indirectly) using itself
const maxExpansionPasses = 100

export type Component = {
  name: string,
  template: string,
  style: string
}

const readWebsiteFile = (file: string) => Deno.readTextFile(new URL(file, website))

const styleRegExp = /<style>[\s\S]*?<\/style>/g

// Components are read on every request, like pages, so edits show up without a restart.
// Their <style> blocks are split out so they can go in the <head> only once per page.
const loadComponents = (): Promise<Component[]> => Promise.all(componentFiles.map(async (componentFile) => {
  const source = await readWebsiteFile(componentFile.file)

  return {
    name: componentFile.name,
    template: source.replace(styleRegExp, '').trim(),
    style: (source.match(styleRegExp) ?? []).join('\n')
  }
}))

//////////////////////////////////////////////////
// Build the head of the page

export const extractHead = (page: string): string => {
  const head = /<Head>([\s\S]*)<\/Head>/.exec(page)

  return head
    ? head[1]
    : '<title>Error</title>'
}

//////////////////////////////////////////////////
// Build the body of the page

export const extractBody = (page: string): string => {
  const body = /<Template>([\s\S]*)<\/Template>/.exec(page)

  return body
    ? body[1]
    : "<h1>Couldn't build the requested page</h1>"
}

// Replace every <ComponentName>content</ComponentName> with the component's
// template, putting the content in place of its {{body}}. Passes repeat until
// nothing changes, so components can be nested inside different components.
// A component nested inside itself still breaks: the non-greedy regex pairs
// the outer opening tag with the inner closing tag. That needs a real parser.
// NOTE: Quick solution, TODO: use a more functional style
export const expandComponents = (body: string, components: Component[]) => {
  const used = new Set<Component>()

  for (let pass = 0; pass < maxExpansionPasses; pass++) {
    const previous = body

    for (const component of components) {
      const componentRegExp = new RegExp(`<${component.name}>([\\s\\S]*?)</${component.name}>`, 'g')

      // Replacement functions instead of strings, otherwise `$&`, `$$`, etc.
      // inside the content are treated as special replacement patterns
      body = body.replace(componentRegExp, (_match, content: string) => {
        used.add(component)
        return component.template.replace('{{body}}', () => content)
      })
    }

    if (body === previous) {
      return { body, used: [...used] }
    }
  }

  throw new Error(`Components were still expanding after ${maxExpansionPasses} passes, is a component using itself?`)
}

//////////////////////////////////////////////////
// Merge the page and the layout

export const renderPage = (page: string, layout: string, components: Component[]): string => {
  const { body, used } = expandComponents(extractBody(page), components)

  // Styles of the components used on this page, once each
  const styles = used.map(component => component.style).filter(style => style)
  const head = [extractHead(page), ...styles].join('\n')

  // A single pass so a literal {{body}} inside the head isn't replaced too
  return layout.replace(/{{(head|body)}}/g, (_match, slot: string) => slot === 'head' ? head : body)
}

const respond = async (file: string, status: number): Promise<Response> => {
  const [page, layout, components] = await Promise.all([
    readWebsiteFile(file),
    readWebsiteFile(layoutFile),
    loadComponents()
  ])

  return new Response(renderPage(page, layout, components), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  })
}

//////////////////////////////////////////////////
// Serve the website

export const handler = async (req: Request): Promise<Response> => {
  // Get a proper URL object from the request
  const url = new URL(req.url)

  // Find the requested page
  const route = routes.find(route => route.path === url.pathname)

  try {
    return route
      ? await respond(route.file, 200)
      : await respond(errors[404], 404)
  } catch (error) {
    console.error(error)
    return await respond(errors[500], 500)
  }
}

if (import.meta.main) {
  Deno.serve(handler)
}
