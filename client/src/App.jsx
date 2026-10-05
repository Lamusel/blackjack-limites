import { Routes, Route, Navigate } from 'react-router-dom'
import { SocketProvider } from '@/hooks/useSocket'
import { GameProvider }   from '@/hooks/useGame'
import { SettingsProvider } from '@/hooks/useSettings'

import Home         from '@/pages/Home'
import Rooms        from '@/pages/Rooms'
import CreateRoom   from '@/pages/CreateRoom'
import Lobby        from '@/pages/Lobby'
import Game         from '@/pages/Game'
import HowToPlay    from '@/pages/HowToPlay'
import AvatarStudio from '@/pages/AvatarStudio'
import Profile      from '@/pages/Profile'

export default function App() {
  return (
    <SettingsProvider>
      <SocketProvider>
        <GameProvider>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/rooms"       element={<Rooms />} />
            <Route path="/rooms/new"   element={<CreateRoom />} />
            <Route path="/lobby/:code" element={<Lobby />} />
            <Route path="/game/:code"  element={<Game />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/avatar"      element={<AvatarStudio />} />
            <Route path="/profile"     element={<Profile />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </GameProvider>
      </SocketProvider>
    </SettingsProvider>
  )
}