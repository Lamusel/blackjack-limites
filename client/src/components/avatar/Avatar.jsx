import { memo, useMemo } from 'react'
import { sanitizeAvatar } from '@/lib/avatar'
import NoirAvatar from './NoirAvatar'
import GamerAvatar from './GamerAvatar'

// Punto de entrada de los avatares: elige el dibujante según el estilo
// (clásico noir, táctico, armadura, bloques, robot o místico).
function Avatar({ avatar, seed = 'jugador', ...rest }) {
  const a = useMemo(() => sanitizeAvatar(avatar, seed), [avatar, seed])
  if (a.style === 'noir') return <NoirAvatar avatar={a} seed={seed} {...rest} />
  return <GamerAvatar avatar={a} {...rest} />
}

export default memo(Avatar)
