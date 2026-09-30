# CINEFILOS — Documento de requerimientos

Sistema web para que un cine venda sus entradas online. Este documento resume **todo lo que pidió el cliente** en el intercambio de mails y lo ordena por módulos. Es un documento vivo: el estado de cada requisito se actualiza a medida que avanza el desarrollo.

**Estados:** ✅ hecho · 🔧 en curso · ⬜ pendiente · 🚫 fuera de alcance

**Fuente:** cada requisito indica la fecha del mail del que sale. "Mail 1" es el primer mail, sin fecha en el hilo.

---

## 1. Catálogo y cartelera

| ID | Requisito | Fuente | Estado |
|---|---|---|---|
| RF-01 | Toda película tiene nombre, sinopsis, duración e imagen. | Mail 1 | 🔧 Datos listos; falta subir imágenes (Supabase Storage) |
| RF-02 | El administrador elige qué películas aparecen al entrar a la página. | Mail 1 | ✅ Campo `publicada` |
| RF-03 | En la página principal se muestran primero las 3 películas más vendidas. | Mail sin fecha (reseñas) | ⬜ |
| RF-04 | El listado tiene buscador que filtra por título y por género. Una película puede tener varios géneros. | Mail sin fecha, 16/01 | 🔧 Búsqueda por título/género y filtros dinámicos; falta validar con datos reales |
| RF-05 | Sección "Próximamente" con las películas que se estrenan en las próximas semanas. | 08/03 | ⬜ |
| RF-06 | El usuario puede activar una alerta para avisarle cuando se abra la venta de una película. | 08/03 | ⬜ |
| RF-07 | Preventa: se abre la venta 7 días antes del estreno con un precio especial, que vuelve al normal al pasar esa fecha. Configurable película por película. | 08/03 | ⬜ |
| RF-08 | Películas con restricción de edad (18, 13 o sin restricción): los menores no pueden comprar esas entradas, y toda entrada de esas películas aclara que debe ir un adulto. | 12/02 | ⬜ |

## 2. Salas y funciones

| ID | Requisito | Fuente | Estado |
|---|---|---|---|
| RF-10 | El cine tiene varias salas con 20 filas (A a T) y 28 butacas por fila en tres bloques de 4, 20 y 4. | Mail 1 | 🔧 Filas normales, incluidas J/K, en bloques 4/20/4; E/F accesibles en el mismo esquema; migración y generador de Supabase pendientes |
| RF-11 | Dos filas accesibles para personas con discapacidad, con 28 butacas por fila. | 12/02 | 🔧 E/F accesibles, celestes y distribuidas 4/20/4; migración de butacas y actualización del generador pendientes de aplicar en Supabase |
| RF-12 | Las filas R, S y T son VIP, con precio más alto. | 10/03 | 🔧 Tipo de butaca listo; falta el recargo |
| RF-13 | Cada función tiene película, sala, horario, formato (2D, 3D, 4D, 5D) e idioma (castellano o subtitulada). | Mail 1 | 🔧 El detalle muestra horarios, sala, formato, idioma y precio; falta reservar/comprar |
| RF-14 | Debe pasar al menos media hora entre el fin de una función y el inicio de la siguiente en la misma sala. | Mail 1 | ✅ Trigger `validar_funcion` |
| RF-15 | Bajo ningún término dos funciones coinciden en la misma sala al mismo tiempo. | 06/02 | ✅ Mismo trigger |
| RF-16 | Asignación automática de sala: el administrador indica película, días y hora (por ejemplo lunes, martes y viernes a las 18 h) y el sistema elige una sala libre. | 06/02 | ⬜ |
| RF-17 | Fechas y horas se ingresan de forma ágil, sin largas búsquedas ni scroll excesivo. | 28/02 | ⬜ |

## 3. Compra de entradas

| ID | Requisito | Fuente | Estado |
|---|---|---|---|
| RF-20 | Se puede comprar registrado o como anónimo, siempre que se pague. | Mail 1 | 🔧 Selección visual de butacas implementada; falta confirmar la compra y resolver el pago |
| RF-21 | Una butaca no puede venderse dos veces para la misma función. | Mail 1 | ✅ Índice único |
| RF-22 | El mapa de butacas muestra en tiempo real cuáles ya están ocupadas por otra compra. | 12/02 | 🔧 RPC segura y difusión Realtime preparadas en migración; falta ejecutarla en Supabase y validar entre clientes |
| RF-23 | Las butacas accesibles se resaltan de forma distinta; las VIP también, y el usuario debe saber que compra una VIP antes de pagar. | 12/02 y 10/03 | 🔧 E/F accesibles celestes con 28 butacas en bloques 4/20/4; J/K normales 4/20/4; VIP rosadas con recargo visible. Migraciones SQL pendientes de ejecutar |
| RF-24 | Cada compra genera un PDF con los datos de la entrada y un QR único. | Mail 1 | ⬜ |
| RF-25 | El QR deja de funcionar cuando la entrada se valida o el producto se entrega. | 06/02 | 🔧 Campo `codigo_qr` y estados listos; falta la validación |
| RF-26 | El usuario puede cancelar hasta 2 horas antes de la función. No hay devolución de dinero: recibe crédito en su cuenta, visible en su perfil, que puede usar junto con otros métodos de pago. | 10/03 | ⬜ |

## 4. Candy Bar y combos

| ID | Requisito | Fuente | Estado |
|---|---|---|---|
| RF-30 | El administrador crea productos (pochoclos, bebidas, etc.) y los agrupa en categorías. | 30/01 | ⬜ |
| RF-31 | Los productos se compran junto con la entrada, y con el mismo QR se retiran. | 30/01 | ⬜ |
| RF-32 | Combos especiales (entrada, pochoclos y bebida) a precio fijo configurable, destacados en la página de compra. | 03/03 | ⬜ |

## 5. Usuarios, cupones y fidelización

| ID | Requisito | Fuente | Estado |
|---|---|---|---|
| RF-40 | Registro con mail, nombre, apellido, fecha de nacimiento, tipo de sangre, color de ojos y días de vacaciones por año. | Mail 1 | 🔧 Base lista; formulario a ajustar |
| RF-41 | Cupón de 20 % de descuento en la primera compra de cada usuario registrado. | Mail 1 | 🔧 Tabla y trigger listos; falta aplicarlo en la compra |
| RF-42 | El porcentaje de ese cupón lo configura el administrador cuando quiera. | 30/01 | ⬜ |
| RF-43 | El administrador puede crear cupones que solo afecten a usuarios de más de 50 años. | 30/01 | ⬜ |
| RF-44 | Programa de puntos: 1 punto por cada peso gastado, solo usuarios registrados. | 03/03 | ⬜ |
| RF-45 | Los puntos se canjean por entradas gratis o productos del Candy Bar. El administrador configura cuántos puntos cuesta cada recompensa. | 03/03 | ⬜ |
| RF-46 | El usuario ve en su perfil sus puntos y el historial de canjes. Los puntos no se transfieren entre usuarios. | 03/03 | ⬜ |
| RF-47 | Reseñas: cada persona califica una película con estrellas y deja un comentario corto, visible antes de comprar. | Mail sin fecha | ⬜ |
| RF-48 | Se muestra la puntuación promedio de cada película. | Mail sin fecha | ⬜ |
| RF-49 | Sección "Mis películas": historial visual de lo que el usuario vio, con póster, fecha y su calificación. | 08/03 | ⬜ |

## 6. Administración y empleados

| ID | Requisito | Fuente | Estado |
|---|---|---|---|
| RF-50 | Usuario administrador que controla salas, funciones, distribución de butacas, productos y demás configuración. | 06/02 | 🔧 Rol `admin` y políticas listas; falta el panel |
| RF-51 | Usuarios empleados que escanean el QR para validar entradas y entregas del Candy Bar. | 06/02 | ⬜ |
| RF-52 | Si el lector no funciona, el empleado puede ingresar el código a mano. | 06/02 | ⬜ |
| RF-53 | Reporte de facturación por día y de cantidad de entradas vendidas. | 28/02 | ⬜ |
| RF-54 | El reporte de facturación se exporta a PDF y a Excel. | 10/03 | ⬜ |
| RF-55 | Gráfico de películas más vistas por semana y por mes, y del producto del Candy Bar que más se vende. | 10/03 | ⬜ |
| RF-56 | Log de actividad con fecha y hora: quién creó una función, quién cambió un precio, quién validó un QR. | 10/03 | ⬜ |

## 7. Requisitos transversales

| ID | Requisito | Fuente | Estado |
|---|---|---|---|
| RNF-01 | Interfaces fáciles de navegar y entender, para clientes y empleados, con poco scroll. | 28/02 | 🔧 Cartelera, detalle y selección responsive con estados claros, leyenda y resumen de precio; falta aplicar al resto de pantallas |
| RNF-02 | Estilo visual único y producido. | Consigna | 🔧 Identidad de boletería en cartelera y detalle: pósteres, entradas/talones, paleta oscura rojo-violeta, microinteracciones; falta aplicar al resto de pantallas |
| RNF-03 | Angular con buenas prácticas y técnicas vistas en clase. | Consigna | 🔧 |
| RNF-04 | Integración con Supabase (base, autenticación, seguridad, tiempo real). | Consigna | 🔧 |
| RNF-05 | PWA instalable. | Consigna | 🔧 Manifiesto, íconos y service worker configurados; falta validar instalación/offline tras desplegar |
| RNF-06 | Aplicación desplegada con URL funcional, código en GitHub y README con arquitectura y decisiones técnicas. | Consigna | 🔧 Código en GitHub; falta despliegue |
| RNF-07 | Defensa oral de las decisiones. | Consigna | ⬜ |

## 8. Fuera de alcance

| ID | Requisito | Motivo |
|---|---|---|
| FA-01 | Pantalla con un mapa de todo el cine que indique la sala de la entrada. | El cliente aclaró en el mail del 30/01 que todavía no tiene luz verde. |


## 9. Plan de trabajo

| Fase | Contenido | Requisitos |
|---|---|---|
| 1. Núcleo de compra | Mapa de butacas en tiempo real, pago, cupón, PDF con QR | RF-20 a RF-25, RF-41 |
| 2. Operación | Panel de administración, rol empleado, validación de QR y código manual | RF-50 a RF-52, RF-16 |
| 3. Candy Bar | Productos, categorías, combos, QR compartido | RF-30 a RF-32 |
| 4. Fidelización | Cupones configurables, puntos, canjes, crédito y cancelación | RF-26, RF-42 a RF-46 |
| 5. Comunidad y estrenos | Reseñas, más vendidas, próximamente, alertas, preventa, mis películas | RF-03, RF-05 a RF-08, RF-47 a RF-49 |
| 6. Reportes y cierre | Facturación PDF y Excel, gráficos, log de actividad, PWA, despliegue, README | RF-53 a RF-56, RNF-05, RNF-06 |
