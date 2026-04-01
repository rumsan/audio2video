import { Outlet } from '@tanstack/react-router'
import { Film } from 'lucide-react'

export function RootLayout() {
  return (
    <div className="min-h-screen font-sans">
      <Outlet />
    </div>
  )
}

export function AppLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
        <Film className="h-4 w-4 text-white" />
      </div>
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>
        Audio<span className="text-blue-600">2</span>Video
      </span>
    </div>
  )
}
