# Cómo contribuir a este repositorio

## Flujo de trabajo

1. Actualizar `main` local: `git pull origin main`
2. Crear la rama: `git checkout -b docs/nombre-del-documento`
3. Agregar o modificar los archivos.
4. Confirmar: `git add .` y `git commit -m "docs: descripcion del cambio"`
5. Subir: `git push origin docs/nombre-del-documento`
6. Abrir el Pull Request en GitHub y solicitar revisión a otro integrante.
7. Tras la aprobación y el merge, eliminar la rama.

No se permite empujar directamente a `main`.

## Convención de commits

`tipo: descripción en minúscula, sin tildes y sin punto final`

| Tipo | Uso |
|---|---|
| `docs` | Agregar o actualizar documentación |
| `fix` | Corregir un error en un documento existente |
| `chore` | Cambios de estructura, nombres u organización |
| `refactor` | Reescribir contenido sin alterar su significado |

## Convención de ramas

| Prefijo | Uso |
|---|---|
| `docs/` | Documento nuevo o actualizado |
| `fix/` | Corrección de un pendiente identificado |
| `adr/` | Decisión de arquitectura |

## Revisión

Todo Pull Request requiere la aprobación de un integrante distinto al autor.
La revisión verifica que el documento esté completo, que respete las normas
APA 7 y que no contradiga el backlog, que es la fuente de verdad del proyecto.