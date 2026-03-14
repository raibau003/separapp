# Órbita App

**Dos mundos, un centro**

App de coparentalidad para padres separados con hijos en LATAM.

## Stack Técnico

- **Frontend:** React Native + Expo
- **Web:** React Native Web + Expo Router
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Lenguaje:** TypeScript (strict mode)
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Iniciar el servidor de desarrollo:
```bash
npm start
```

## Comandos Disponibles

```bash
npm start          # Iniciar dev server
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en web
npm run reset      # Reiniciar caché de Expo
```

## Estructura del Proyecto

```
orbita-app/
├── app/              # Rutas (Expo Router)
├── components/       # Componentes reutilizables
├── hooks/           # Custom hooks
├── lib/             # Utilidades y configuración
├── store/           # Estado global (Zustand)
├── types/           # TypeScript types
└── assets/          # Imágenes y recursos
```

## Documentación Completa

Ver [CLAUDE.md](./CLAUDE.md) para el contexto completo del proyecto.

## Credenciales

- GitHub: `raibau003`
- Repo: https://github.com/raibau003/orbita-app.git
- Supabase: proyecto `orbita-app`

---

🚀 Desarrollado con React Native + Expo + Supabase
