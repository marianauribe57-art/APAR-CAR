# APAR-CAR — Documentación del proyecto

Plataforma web de gestión de parqueaderos.
Proyecto formativo — SENA, ficha 3229209.

## Equipo

| Integrante | Rol |
|---|---|
| Mariana Uribe Muñoz | Analista y líder |
| Ismael Mira Correa | Frontend |
| Valeria Usuga Penagos | Backend |

## Estructura

| Carpeta | Contenido |
|---|---|
| `01_inicio_y_planeacion` | Acta de constitución (Formulación), análisis de interesados y entregables GA1 |
| `02_requerimientos` | Alcance y requisitos, backlog, historias de usuario, casos de uso y matriz de trazabilidad |
| `03_diseno` | Modelado de procesos (BPMN), modelo UML y diagramas de arquitectura C4 |
| `04_calidad` | Métricas e informes de calidad |
| `05_manuales` | Manuales de usuario y técnico — fase de construcción |
| `06_cierre` | Documentos de cierre del proyecto — fase final |
| `07_evaluacion` | Evaluación del proyecto — fase final |
| `adr` | Registro de decisiones de arquitectura (ADR) |

Las carpetas `05`, `06` y `07` están creadas y vacías: corresponden a fases aún no ejecutadas.

## Cómo trabajamos

- `main` contiene solo documentación revisada y aprobada.
- Todo cambio entra por rama y Pull Request, con revisión de otro integrante.
- Convención de ramas: `docs/<artefacto>`, `adr/<numero>`, `fix/<descripcion>`.
- Se versiona únicamente la versión vigente de cada documento; el historial lo conserva Git.
- El backlog es la fuente de verdad: si cambia, se regeneran los documentos que dependen de él.