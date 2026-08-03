# IPTV Viewer (Frontend)

Este es el repositorio del Frontend para el proyecto **IPTV Viewer**. Está construido con React, Vite y Vanilla CSS, priorizando un diseño premium con modo oscuro, glassmorphism y alto rendimiento.

## 🚀 Tecnologías

- **Framework:** React + Vite
- **Estilos:** Vanilla CSS (sin frameworks, control total del diseño)
- **Ruteo:** React Router DOM
- **Reproductor:** HLS.js (para streaming de video)

## 📦 Instalación y Uso

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🌿 Flujo de Trabajo (Git Flow)

Este repositorio sigue **exactamente** las mismas reglas de control de versiones que el backend:

### Ramas
* `main`: Producción (código 100% estable).
* `develop`: Integración (aquí unimos todo el trabajo nuevo).
* `release/vX.X.X`: Ramas para preparar una nueva versión antes de pasarla a main.

### Reglas
* ❌ No commits directos a `main`
* ❌ No desarrollo directo en `develop` (se usan ramas feature/ o fix/)
* ✅ Commits semánticos en **español**

### Convención de Commits

```text
<tipo>(opcional-alcance): descripción breve en infinitivo
```
Ejemplos:
* `feat(auth): agregar pantalla de login con diseño premium`
* `fix(player): corregir error al cargar stream hls`
* `chore: inicializar proyecto react con vite`

---
*Desarrollado en conjunto con iptv-viewer-backend*
