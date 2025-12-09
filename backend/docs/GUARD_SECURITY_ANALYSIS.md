# Análisis de Seguridad de Guards y Autorización

## Resumen Ejecutivo

✅ **ACTUALIZADO**: Los problemas de seguridad han sido resueltos. Los guards están correctamente implementados y se ha agregado validación de ownership donde corresponde.

**Nota importante:** Documents y Folders son recursos compartidos por diseño - todos los usuarios autenticados pueden acceder a todos los documentos y folders. Esto es el comportamiento esperado del sistema.

---

## Problemas Encontrados

### ✅ RESUELTO: Users Service

**Guards implementados:**
- `GET /users` - `ApiKeyOrJwtGuard` ✅ (mantenido para admin access)
- `GET /users/:id` - `JwtAuthGuard` ✅ (users solo pueden ver su propio perfil)
- `POST /users` - `ApiKeyGuard` ✅ (solo admin)
- `PUT /users/:id` - `ApiKeyOrJwtGuard` ✅ (validación de ownership en service)
- `DELETE /users/:id` - `ApiKeyOrJwtGuard` ✅ (validación de ownership en service)

**Estado:** ✅ Resuelto - Validación de ownership implementada en service

---

### ✅ CORRECTO: Documents Service

**Guard actual:** `ApiKeyOrJwtGuard` ✅

**Diseño:**
- Los documentos son **recursos compartidos** por diseño - todos los usuarios pueden acceder a todos los documentos
- `GET /documents` - Devuelve todos los documentos (comportamiento esperado)
- `GET /documents/:id` - Cualquier usuario puede ver cualquier documento (comportamiento esperado)
- `GET /documents/:id/url` - Cualquier usuario puede obtener URL firmada (comportamiento esperado)

**Estado:** ✅ Correcto - Los guards están bien implementados para recursos compartidos

---

### ✅ CORRECTO: Folders Service

**Guard actual:** `ApiKeyOrJwtGuard` ✅

**Diseño:**
- Los folders son **recursos compartidos** por diseño - todos los usuarios pueden acceder a todos los folders
- `GET /folders` - Devuelve todos los folders (comportamiento esperado)
- `GET /folders/:id` - Cualquier usuario puede ver cualquier folder (comportamiento esperado)
- `POST /folders` - Cualquier usuario autenticado o admin puede crear folders (comportamiento esperado)
- `PUT /folders/:id` - Cualquier usuario autenticado o admin puede actualizar (comportamiento esperado)
- `DELETE /folders/:id` - Cualquier usuario autenticado o admin puede eliminar (comportamiento esperado)

**Estado:** ✅ Correcto - Los guards están bien implementados para recursos compartidos

---

### ✅ RESUELTO: Comments Service

**Guard actual:** `JwtAuthGuard` ✅

**Implementación:**
- ✅ `PUT /comments/:id` - Valida ownership antes de actualizar
- ✅ `DELETE /comments/:id` - Valida ownership antes de eliminar
- ✅ Verifica que `comment.user_id === req.user.id` antes de permitir operación

**Estado:** ✅ Resuelto - Validación de ownership implementada

---

### ✅ RESUELTO: Reactions Service

**Guard actual:** `JwtAuthGuard` ✅

**Implementación:**
- ✅ `PUT /reactions/:id` - Valida ownership antes de actualizar
- ✅ `DELETE /reactions/:id` - Valida ownership antes de eliminar
- ✅ Verifica que `reaction.user_id === req.user.id` antes de permitir operación

**Estado:** ✅ Resuelto - Validación de ownership implementada

---

### ✅ CORRECTO: Collections Service

**Guard actual:** `JwtAuthGuard` ✅

**Implementación:**
- ✅ Valida ownership correctamente en `update()` y `delete()`
- ✅ Valida acceso a colecciones privadas en `find_by_id()`
- ✅ Filtra por `user_id` o muestra solo públicas en `find_all()`

**No requiere cambios.**

---

## Recomendaciones Generales

### 1. Decisión de Diseño: Recursos Públicos vs Privados

**Pregunta clave:** ¿Los recursos (users, documents, folders) son públicos o privados?

- **Si son públicos/compartidos:** `ApiKeyOrJwtGuard` está bien, pero necesita validación de permisos específicos
- **Si son privados:** Cambiar a `JwtAuthGuard` y agregar validación de ownership

### 2. Patrón de Validación de Ownership

Para todos los servicios que manejan recursos privados:

```typescript
// En el service
async update(id: string, user_id: string, update_dto: UpdateDto) {
  const resource = await this.find_by_id(id);
  
  if (resource.user_id !== user_id) {
    throw new ForbiddenException('You do not have permission to update this resource');
  }
  
  // ... resto del código
}
```

### 3. Filtrado Automático por Usuario

Para `find_all()`, siempre filtrar por el usuario autenticado:

```typescript
async find_all(query_params: QueryDto, user_id: string) {
  let query = this.supabase.from('table').select('*');
  
  // Filtrar por usuario autenticado
  query = query.eq('user_id', user_id);
  
  // ... resto de filtros
}
```

### 4. Endpoints de Creación

En `POST` endpoints, validar que el `user_id` en el DTO sea el usuario autenticado:

```typescript
@Post()
async create(@Body() dto: CreateDto, @Req() req: any) {
  // Forzar user_id del usuario autenticado
  const create_dto = { ...dto, user_id: req.user.id };
  return this.service.create(create_dto);
}
```

---

## Prioridad de Corrección

1. **ALTA:** Documents, Folders (acceso a datos privados)
2. **MEDIA:** Users (si son privados), Comments, Reactions (autorización de escritura)
3. **BAJA:** Documentar si Users/Documents/Folders son públicos por diseño

---

## Checklist de Seguridad

Para cada endpoint, verificar:

- [ ] ¿El guard es el adecuado para el tipo de recurso?
- [ ] ¿Los métodos GET filtran por usuario cuando corresponde?
- [ ] ¿Los métodos PUT/DELETE validan ownership?
- [ ] ¿Los métodos POST validan que el user_id sea el autenticado?
- [ ] ¿Hay validación de permisos para recursos compartidos/públicos?

