import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { RootLayout } from './routes/__root'
import { HomePage } from './routes/home'
import { StudioPage } from './routes/studio'
import { ProgressPage } from './routes/progress'
import { PreviewPage } from './routes/preview'
import { AboutPage } from './routes/about'
import { GuidePage } from './routes/guide'
import { ApiDocsPage } from './routes/api-docs'

const rootRoute = createRootRoute({ component: RootLayout })

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const studioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/studio',
  component: StudioPage,
})

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progress/$jobId',
  component: ProgressPage,
})

const previewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/preview/$jobId',
  component: PreviewPage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
})

const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guide',
  component: GuidePage,
})

const apiDocsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/api-docs',
  component: ApiDocsPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  studioRoute,
  progressRoute,
  previewRoute,
  aboutRoute,
  guideRoute,
  apiDocsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
