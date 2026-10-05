import Avatar from './Avatar'

// Punto único para dibujar avatares en toda la app (cualquier estilo).
// - avatar:   config personalizada (del estudio). Si no hay, se genera por nickname
//             (el mismo nickname siempre da el mismo personaje en todos los dispositivos).
// - mood:     expresión temporal (happy, sad, shock, focus, think, smug, dizzy, win, love, angry)
// - animated: parpadeo + respiración (para la mesa y el estudio)
export default function AvatarRenderer({
  nickname = 'Jugador', avatar = null, size = 48, framing = 'tight', className = '', mood = null, animated = false,
}) {
  return (
    <Avatar
      avatar={avatar}
      seed={nickname || 'Jugador'}
      size={size}
      framing={framing}
      className={className}
      mood={mood}
      animated={animated}
      title={`Avatar de ${nickname}`}
    />
  )
}
