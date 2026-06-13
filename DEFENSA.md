# SYSTEM CONTEXT & INSTRUCTIONS: SISTEMA ACADÉMICO PREUNIVERSITARIO FICCT

## 1. PROPÓSITO DEL DOCUMENTO
Este archivo sirve como el "Contexto de Verdad Absoluta" para cualquier Agente de IA que asista en el desarrollo del backend/frontend del proyecto de Sistemas de Información I para el Segundo Examen Parcial. Contiene las reglas del negocio, la arquitectura técnica, las restricciones estrictas y los criterios de evaluación de la Ing. Angélica Garzón.

---

## 2. ARQUITECTURA TÉCNICA GENERAL
* **Framework Principal:** Laravel 10+ (Arquitectura Monolítica limpia).
* **Base de Datos:** PostgreSQL hospedado en Neon DB.
* **Seguridad:** Control de Acceso Basado en Roles (RBAC) estricto.
* **Pasarela de Pagos:** Stripe Sandbox (Integración mediante Webhooks para cambiar estados de pago de forma asíncrona).

### Perfiles de Usuario (Roles)
1.  **Administrador:** Acceso y control total, auditorías y parametrización de la gestión.
2.  **Administrativo:** Verificación manual de requisitos físicos, aprobación/rechazo de documentos.
3.  **Docente:** Visualización de carga horaria, agenda de clases, generación de QR dinámico para asistencia y registro de calificaciones.
4.  **Postulante:** Subida de requisitos, pago de matrícula, consulta de grupo asignado, marcas de asistencia y visualización de notas parciales/finales.

---

## 3. ALCANCE TÉCNICO - CASOS DE USO (CICLO 2)

### CU11 – Gestionar Grupos
* **Regla de Negocio:** El sistema calcula automáticamente la cantidad de grupos necesarios por materia basándose en los postulantes habilitados (con requisitos aprobados y pago confirmado en Stripe).
* **Criterio de Turno:** Los postulantes ya eligieron su turno (Mañana, Tarde, Noche) en fases previas. El algoritmo debe separar la población por turno y dividir el total entre la capacidad máxima permitida del aula (`capacidad_max_grupo`, por defecto 40 alumnos).
* **Fórmula:** $CantidadGrupos = \lceil TotalPostulantesTurno / CapacidadAula \rceil$. Los grupos se nombran según el turno (Ej: MA, MB para mañana; TA, TB para la tarde).

### CU12 – Gestionar Horarios (Validación Estricta de Cruces)
* **Invariante del Aula:** El sistema debe impedir mediante transacciones en el backend que una misma `aula_id` sea asignada a dos grupos diferentes en el mismo `dia`, dentro de un rango de tiempo intersectado (`hora_inicio` y `hora_fin`).
* **Invariante del Turno:** Los horarios deben coincidir con las ventanas de tiempo del turno configurado (Mañana: 07:00-12:00, Tarde: 12:00-18:00, Noche: 18:00-22:00).
* **Manejo de Errores:** Cualquier colisión debe abortar el `INSERT` y retornar una respuesta HTTP `422 Unprocessable Entity` explicando detalladamente el cruce.

### CU13 – Gestionar Aulas
* **Propósito:** CRUD de la infraestructura física de la FICCT.
* **Campos Requeridos:** `numero_aula`, `pabellon`, `capacidad_fisica`.
* **Restricción:** No se puede asignar un grupo cuyo número de alumnos calculados supere la `capacidad_física` real del aula asignada en el CU12.

### CU14 – Gestionar Asignación y Carga Horaria Docente
* **Límite de Carga Horaria:** Un docente puede tener asignados como **máximo 4 grupos** en la gestión activa. El backend debe hacer un `count()` antes de guardar. Si el docente tiene $\ge 4$ grupos, se bloquea la operación.
* **Cruce de Horario Docente:** El sistema debe verificar que los horarios del nuevo grupo a asignar no colisionen con las horas de los grupos que el docente ya tiene previamente asignados.

### CU15 – Registrar Asistencia Estudiante y Docente
* **Asistencia Docente:** Registro de entrada y salida mediante entorno web. Habilitado únicamente por rangos de tolerancia en base a la hora del servidor y su horario asignado.
* **Asistencia Estudiante (Aporte Propio):** El docente genera un **Código QR Dinámico con tokens temporales de expiración (15 segundos)** proyectado en el aula. El postulante escanea el QR desde su sesión activa en el smartphone para registrar su presencia de forma inmediata, evitando fraudes de asistencia remota.

---

## 4. CRITERIOS CRÍTICOS DE EVALUACIÓN (PREGUNTAS DE DEFENSA)
Cuando generes código o lógica, asegúrate de que cumpla perfectamente con estas respuestas ante la ingeniera:

1.  **Trazabilidad:** Todo endpoint de ruta, controlador (`HorarioController`, `GrupoController`) y modelo debe responder al identificador del Caso de Uso (`CU11`, `CU12`, etc.).
2.  **Decisión de Entrada por Cupos (Corte de Gestión):** Si una carrera oferta 100 cupos y hay 120 aprobados, el sistema ejecuta un proceso de cierre basado en **Orden de Mérito (Promedio Final de Notas)** de forma descendente. En caso de empates exactos en la nota, el desempate se decide por el `Timestamp` de la confirmación de aprobación de requisitos. Los primeros 100 cambian a "Inscrito Regular", el resto a "Cupo No Alcanzado / Lista de Espera".
3.  **Flujo del Clic a la Base de Datos:** Toda inserción crítica debe envolverse en una transacción de base de datos (`DB::beginTransaction()`, `DB::commit()`, `DB::rollBack()`) y pasar por un `FormRequest` de validación y sanitización de datos antes de tocar PostgreSQL.
4.  **Formatos de Reporte:** El sistema debe permitir exportar actas finales y listas en dos formatos: **PDF** (estático, inalterable para firmas oficiales) y **Excel/CSV** (dinámico, para manipulación de datos administrativos).

---

## 5. REGLAS PARA EL AGENTE DE IA
* **Lógica Defensiva:** Escribe código priorizando validaciones en el backend (Controladores de Laravel) antes de procesar transacciones en la base de datos para evitar quiebres de restricciones fatales.
* **Clean Code:** Mantén los controladores limpios, delegando validaciones pesadas de cruces de horarios a servicios dedicados (`App\Services\AcademicValidationService`) o métodos privados testeables.
* **Respuestas en JSON:** Los controladores de API deben responder siempre con códigos de estado HTTP correctos (`200 OK`, `201 Created`, `422 Unprocessable Entity`, `400 Bad Request`) junto con mensajes claros y descriptivos en español.



