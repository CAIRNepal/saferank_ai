import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { OverviewPage } from '../pages/OverviewPage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import { ModelDetailPage } from '../pages/ModelDetailPage'
import { ArenaPage } from '../pages/ArenaPage'
import { MethodologyPage } from '../pages/MethodologyPage'
import { ChangelogPage } from '../pages/ChangelogPage'
import { SubmitPage } from '../pages/SubmitPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const appRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to="/overview" replace /> },
  { path: '/overview', element: <OverviewPage /> },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/models/:modelId', element: <ModelDetailPage /> },
  { path: '/arena', element: <ArenaPage /> },
  { path: '/methodology', element: <MethodologyPage /> },
  { path: '/changelog', element: <ChangelogPage /> },
  { path: '/submit', element: <SubmitPage /> },
  { path: '*', element: <NotFoundPage /> },
]
