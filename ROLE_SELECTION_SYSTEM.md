# Sistema de Selección de Roles

## Descripción

Se ha implementado un sistema completo de selección de roles que permite a los usuarios con múltiples roles (ADMIN y CLIENT) elegir con qué rol desean ingresar al sistema. Cada sesión respeta el rol activo seleccionado y muestra únicamente la información y funcionalidades correspondientes a ese rol.

## Funcionalidades Implementadas

### 1. Modelo de Datos Actualizado

- **AuthUser**: Añadido campo `activeRole` para almacenar el rol actualmente activo
- **LoginResponse**: Actualizado para manejar la respuesta del backend correctamente
- **RolesUsers**: Enum con los roles del sistema (ADMIN, CLIENT, SUPER_ADMIN)

### 2. Servicio de Autenticación Mejorado

**Métodos añadidos:**

- `setActiveRole(role)`: Establece el rol activo del usuario
- `getActiveRole()`: Obtiene el rol activo actual
- `hasMultipleRoles()`: Verifica si el usuario tiene múltiples roles
- `getSelectableRoles()`: Obtiene los roles que permiten selección (ADMIN y CLIENT)
- `needsRoleSelection()`: Determina si el usuario necesita seleccionar un rol

### 3. Componente de Selección de Roles

**Ubicación:** `src/app/views/auth/role-selector/`

**Características:**

- Interfaz moderna con diseño responsive
- Tarjetas interactivas para cada rol disponible
- Iconos y descripciones específicas para cada rol
- Confirmación visual de la selección
- Botón de logout integrado

**Funcionalidades:**

- Muestra solo los roles ADMIN y CLIENT
- Navegación automática al dashboard correspondiente
- Manejo de casos edge (usuario sin múltiples roles)

### 4. Guards de Seguridad Actualizados

**auth.guard.ts:**

- Verifica autenticación básica
- Redirige a selección de roles si es necesario
- Valida roles activos para rutas protegidas

**admin.guard.ts:**

- Verifica que el rol activo sea ADMIN o SUPER_ADMIN
- Redirige a selección de roles si no hay rol activo
- Valida organizationId para administradores

**client.guard.ts:**

- Verifica que el rol activo sea CLIENT
- Redirige a selección de roles si no hay rol activo

### 5. Componentes de Layout Actualizados

**Header Component:**

- Muestra el rol activo en el menú de usuario
- Botón "Cambiar Rol" visible solo para usuarios con múltiples roles
- Navegación a selección de roles desde el menú

**Sidebar Component:**

- Filtra menús basado en el rol activo
- Métodos `hasActiveRole()` y `hasAnyActiveRole()` para verificaciones

### 6. Rutas Configuradas

- `/role-selector`: Componente de selección de roles
- `/admin/*`: Protegido por `adminGuard`
- `/client/*`: Protegido por `clientGuard`
- Rutas de autenticación en módulo separado

## Flujo de Usuario

### Caso 1: Usuario con un solo rol

1. Login exitoso
2. Navegación directa al dashboard correspondiente
3. No se muestra selección de roles

### Caso 2: Usuario con múltiples roles (ADMIN y CLIENT)

1. Login exitoso
2. Verificación de múltiples roles
3. Redirección automática a `/role-selector`
4. Usuario selecciona rol deseado
5. Establecimiento del rol activo
6. Navegación al dashboard correspondiente

### Caso 3: Cambio de rol durante la sesión

1. Usuario hace clic en "Cambiar Rol" en el header
2. Navegación a `/role-selector`
3. Selección de nuevo rol
4. Actualización del rol activo
5. Navegación al dashboard del nuevo rol

## Seguridad

### Validaciones Implementadas

- Autenticación obligatoria para todas las rutas protegidas
- Verificación de rol activo en guards específicos
- Redirección automática si falta selección de rol
- Filtrado de menús y funcionalidades por rol activo

### Manejo de Errores

- Redirección a login si no hay autenticación
- Redirección a selección de roles si es necesaria
- Manejo de casos donde el usuario no tiene roles válidos

## Archivos Modificados/Creados

### Nuevos Archivos

- `src/app/views/auth/role-selector/role-selector.component.ts`
- `src/app/views/auth/role-selector/role-selector.component.html`
- `src/app/views/auth/role-selector/role-selector.component.css`

### Archivos Modificados

- `src/app/core/models/auth.model.ts`
- `src/app/core/services/auth.service.ts`
- `src/app/core/auth/guards/auth.guard.ts`
- `src/app/core/auth/guards/admin.guard.ts`
- `src/app/core/auth/guards/client.guard.ts`
- `src/app/views/auth/auth.routes.ts`
- `src/app/app.routes.ts`
- `src/app/views/auth/login/login.component.ts`
- `src/app/shared/components/layout/header/header.component.ts`
- `src/app/shared/components/layout/header/header.component.html`
- `src/app/shared/components/layout/sidebar/sidebar.component.ts`

## Pruebas Recomendadas

1. **Login con usuario ADMIN únicamente**
   - Verificar navegación directa a `/admin/dashboard`

2. **Login con usuario CLIENT únicamente**
   - Verificar navegación directa a `/client/dashboard`

3. **Login con usuario ADMIN y CLIENT**
   - Verificar redirección a `/role-selector`
   - Probar selección de cada rol
   - Verificar navegación al dashboard correcto

4. **Cambio de rol durante sesión**
   - Verificar visibilidad del botón "Cambiar Rol"
   - Probar cambio entre roles
   - Verificar actualización de menús y permisos

5. **Acceso directo a rutas protegidas**
   - Verificar redirección a login sin autenticación
   - Verificar redirección a selección de roles si es necesaria
   - Verificar bloqueo de acceso con rol incorrecto

## Notas Técnicas

- El rol activo se almacena en `localStorage` junto con los datos del usuario
- Los guards verifican el rol activo, no solo la lista de roles del usuario
- El sistema mantiene compatibilidad con usuarios que tienen un solo rol
- La interfaz es completamente responsive y accesible
- Se utilizan animaciones CSS para mejorar la experiencia de usuario

## Estado Actual

✅ **COMPLETADO** - El sistema está completamente implementado y funcional. La aplicación compila sin errores y está lista para pruebas.
