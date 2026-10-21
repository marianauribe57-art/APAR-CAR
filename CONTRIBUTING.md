# Cómo contribuir a este repositorio

## Ramas principales

| Rama | Propósito |
|---|---|
| `main` | Versión estable. Solo recibe código probado y documentación revisada. |
| `develop` | Integración del código. Aquí se juntan las funcionalidades antes de pasar a `main`. |

No se permite empujar directamente a `main` ni a `develop`. Todo cambio entra por Pull Request.

## Flujo de trabajo para documentación

1. Actualizar `main` local: `git pull origin main`
2. Crear la rama: `git checkout -b docs/nombre-del-documento`
3. Agregar o modificar los archivos.
4. Confirmar: `git add .` y `git commit -m "docs: descripcion del cambio"`
5. Subir: `git push origin docs/nombre-del-documento`
6. Abrir el Pull Request **hacia `main`** y solicitar revisión a otro integrante.
7. Tras la aprobación y el merge, eliminar la rama.

## Flujo de trabajo para código

1. Actualizar `develop` local:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Crear la rama desde `develop`: `git checkout -b feat/nombre-de-la-funcionalidad`
3. Desarrollar el cambio y **probarlo localmente** antes de confirmar.
4. Confirmar con commits pequeños y con sentido (un commit = un cambio que se pueda explicar en una frase).
5. Subir: `git push origin feat/nombre-de-la-funcionalidad`
6. Abrir el Pull Request **hacia `develop`** y solicitar revisión a otro integrante.
7. Tras la aprobación y el merge, eliminar la rama.

### Paso de `develop` a `main`

Cuando un conjunto de funcionalidades está completo y funciona integrado en `develop`, se abre un Pull Request de `develop` hacia `main`. Este PR lo revisa todo el equipo.

## Convención de commits

`tipo: descripcion en minuscula, sin tildes y sin punto final`

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corregir un error (en código o en un documento) |
| `test` | Agregar o corregir pruebas |
| `docs` | Agregar o actualizar documentación |
| `chore` | Cambios de estructura, configuración, dependencias, nombres u organización |
| `refactor` | Reescribir código o contenido sin alterar su comportamiento o significado |

Ejemplos:

- `feat: agrega endpoint de salud del servidor`
- `fix: corrige calculo de cobro minimo por hora`
- `test: agrega pruebas del calculo de tarifa diaria`
- `chore: configura prisma con base de datos en neon`

## Convención de ramas

| Prefijo | Uso | Sale de | PR hacia |
|---|---|---|---|
| `feat/` | Nueva funcionalidad | `develop` | `develop` |
| `fix/` | Corrección de un error o pendiente | `develop` (código) o `main` (documentos) | la rama de origen |
| `test/` | Pruebas | `develop` | `develop` |
| `chore/` | Configuración u organización | `develop` (código) o `main` (documentos) | la rama de origen |
| `docs/` | Documento nuevo o actualizado | `main` | `main` |
| `adr/` | Decisión de arquitectura | `main` | `main` |

## Revisión

Todo Pull Request requiere la aprobación de un integrante distinto al autor.

**Para documentación**, la revisión verifica que el documento esté completo, que respete las normas APA 7 y que no contradiga el backlog, que es la fuente de verdad del proyecto.

**Para código**, la revisión verifica que:

1. El código corre en el computador del revisor (no solo en el del autor).
2. El revisor entiende qué hace cada parte. Si algo no se entiende, se pregunta en el PR antes de aprobar.
3. El cambio corresponde a una historia de usuario del backlog.
4. No se suben credenciales, contraseñas ni archivos `.env`.