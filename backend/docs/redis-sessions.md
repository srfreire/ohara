# Redis Sessions - Keys y Funcionamiento

## Resumen

Las sesiones de autenticación se almacenan en Redis usando dos tipos de keys que trabajan juntas para permitir validación de sesiones y funcionalidad de logout-all.

---

## Keys de Redis

### 1. `session:{session_id}` (String)

**Tipo**: String (JSON)  
**TTL**: 2 horas (auto-expira)

**Contenido**:
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "created_at": 1704067200000
}
```

**Propósito**: Almacena los datos de una sesión individual.

**Cuándo se crea**: Al hacer login o refresh token.

**Cuándo se elimina**: 
- Al hacer logout (sesión individual)
- Al hacer logout-all (todas las sesiones del usuario)
- Automáticamente después de 2 horas (TTL)

**Ejemplo de key**:
```
session:550e8400-e29b-41d4-a716-446655440000
```

---

### 2. `user_sessions:{user_id}` (Set)

**Tipo**: Redis Set  
**TTL**: Ninguno (se gestiona manualmente)

**Contenido**: Lista de todos los `session_id` de un usuario
```
["session-id-1", "session-id-2", "session-id-3"]
```

**Propósito**: Rastrear todas las sesiones activas de un usuario para poder hacer logout-all.

**Cuándo se crea**: Cuando se crea la primera sesión de un usuario.

**Cuándo se actualiza**:
- Se añade un `session_id` cuando se crea una nueva sesión
- Se elimina un `session_id` cuando se hace logout de esa sesión
- Se elimina completamente cuando se hace logout-all

**Ejemplo de key**:
```
user_sessions:123e4567-e89b-12d3-a456-426614174000
```

---

## Flujos de Operación

### Login / Crear Sesión

1. Se genera un nuevo `session_id` (UUID)
2. Se crea `session:{session_id}` con los datos del usuario
3. Se añade el `session_id` al Set `user_sessions:{user_id}`

**Resultado**: 
- Una nueva entrada en `session:{session_id}`
- El `session_id` añadido al Set del usuario

---

### Validar Sesión (cada request)

1. Se extrae el `session_id` del JWT
2. Se busca `session:{session_id}` en Redis
3. Si existe → sesión válida
4. Si no existe → sesión expirada o inválida

**Resultado**: Se valida si el usuario está autenticado.

---

### Logout (sesión individual)

1. Se obtiene el `session_id` del JWT
2. Se lee `session:{session_id}` para obtener el `user_id`
3. Se elimina el `session_id` del Set `user_sessions:{user_id}`
4. Se elimina `session:{session_id}`

**Resultado**: 
- La sesión específica eliminada
- El `session_id` removido del Set del usuario
- Las otras sesiones del usuario siguen activas

---

### Logout All (todas las sesiones)

1. Se obtiene el `user_id` del JWT
2. Se leen todos los `session_id` del Set `user_sessions:{user_id}`
3. Se eliminan todas las keys `session:{session_id}` encontradas
4. Se elimina el Set `user_sessions:{user_id}`

**Resultado**: 
- Todas las sesiones del usuario eliminadas
- El Set del usuario eliminado
- El usuario queda deslogueado de todos los dispositivos

---

## Ventajas de esta Estructura

✅ **Validación rápida**: Búsqueda directa por `session_id`  
✅ **Logout-all eficiente**: No necesita iterar todas las keys de Redis  
✅ **Auto-limpieza**: TTL de 2 horas elimina sesiones abandonadas  
✅ **Escalable**: Cada usuario tiene su propio Set de sesiones  

---

## Ejemplo Visual

```
Usuario: user@example.com (ID: abc123)

Redis contiene:

1. session:uuid-1 → { user_id: "abc123", email: "user@example.com", ... }
2. session:uuid-2 → { user_id: "abc123", email: "user@example.com", ... }
3. session:uuid-3 → { user_id: "abc123", email: "user@example.com", ... }

4. user_sessions:abc123 → Set["uuid-1", "uuid-2", "uuid-3"]
```

Cuando el usuario hace logout-all:
- Se eliminan `session:uuid-1`, `session:uuid-2`, `session:uuid-3`
- Se elimina `user_sessions:abc123`

