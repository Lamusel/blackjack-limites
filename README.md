# 🎰 Blackjack de Límites

Juego educativo multijugador para aprender límites matemáticos.

---

## 🚀 Setup inicial

### 1. Instalar dependencias
```bash
npm run install:all
```

### 2. Configurar variables de entorno

**Cliente** — copia `/client/.env.example` → `/client/.env`:
```env
VITE_SOCKET_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

**Servidor** — copia `/server/.env.example` → `/server/.env`:
```env
PORT=3001
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
```

### 3. Crear base de datos en Supabase
1. Ir a [supabase.com](https://supabase.com) → New project
2. En el SQL Editor, ejecutar el contenido de `supabase/schema.sql`

### 4. Arrancar el proyecto
```bash
npm run dev
```
Esto levanta cliente (puerto 5173) y servidor (puerto 3001) simultáneamente.

---

## 📱 Probar en celular y PC al mismo tiempo

```bash
# El cliente ya está configurado con --host en vite.config.js
npm run dev

# Verás algo como:
#   Local:   http://localhost:5173
#   Network: http://192.168.x.x:5173  ← abre esto en tu celular
```
Los dos deben estar en el **mismo WiFi**.

---

## 📁 Estructura
```
blackjack-limites/
├── client/       # React + Vite + Tailwind (frontend)
├── server/       # Node + Express + Socket.io (backend)
└── supabase/     # Schema SQL
```

---

## 🎮 Stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Socket.io
- **BD:** Supabase (PostgreSQL)
- **IA:** Claude API (generación de ejercicios)
- **Audio:** Howler.js
