# 📧 Correo Masivo - Web

Aplicación web para gestionar y enviar campañas de correo electrónico de forma masiva. Administra tus listas de contactos, crea campañas y visualiza estadísticas de envíos de manera sencilla.

## 🚀 Características

- **Dashboard** con resumen de actividad y estadísticas clave.
- Gestión de **listas de contactos**.
- Creación y envío de **campañas** de correo.
- Autenticación de usuarios.
- Interfaz moderna y responsiva.

## 📦 Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/correo.masivo.git
   cd correo.masivo/correo-web
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm start
   ```

## ⚙️ Estructura del proyecto

```
src/
  ├── components/      # Componentes reutilizables (Sidebar, ProtectedRoute, etc.)
  ├── pages/           # Vistas principales (Dashboard, Listas, Enviar, Login)
  ├── context/         # Contextos globales (AuthContext)
  └── App.tsx          # Componente principal
```

## 🛡️ Autenticación

El acceso a las funciones principales requiere autenticación. Si no estás autenticado, serás redirigido a la pantalla de login.

## 📚 Tecnologías

- React + TypeScript
- React Router
- CSS Modules / Tailwind (según configuración)
- Context API

## ✨ Próximos pasos

- Integración con la API backend.
- Importación de contactos desde archivos.
- Programación avanzada de envíos.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o envía un pull request.

---

**Correo Masivo** ©