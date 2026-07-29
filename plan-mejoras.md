🟢 Fase 1: Ajustes de UI y Maquetado Rápido (Baja complejidad)
Cambios visuales, accesos directos y componentes simples que no requieren manejo complejo de estado o backend.

[ ] Sección "Conectar" en /home:

Agregar la sección con enlaces directos a Instagram, YouTube y Spotify.

[ ] Botón WhatsApp en /eventos:

Agregar botón con mensaje predefinido del evento en cada ítem de la lista.

Agregar el botón también en la página de detalle del ítem.

[ ] Acción de Compartir:

Utilizar el icono de tres puntos suspensivos (...) para desplegar el menú de opciones para compartir.

[ ] Cabecera / Hero en /home:

Reubicar componentes al inicio de la página /home: colocar botón Play (estilo desktop), botón Seguir y menú de tres puntos por encima del título "Populares".

🟡 Fase 2: Layout Responsive, Unificación de Búsqueda y Navegación (Media complejidad)
Refactorización de UX/UI, unificación de componentes de búsqueda y navegación mobile.

[ ] Unificación del Buscador (Barra Superior y Sidebar):

Unificar la experiencia del buscador eliminando la versión duplicada/separada del sidebar y centralizándola en la barra superior.

Dejar el buscador en la barra superior junto a un input.

Corregir la barra actual (evitando que renderice sobre todo el contenido) e implementar la experiencia estilo Spotify: el input activo desplegará los resultados coincidentes directamente desde la barra sin solapar toda la pantalla.

[ ] Navegador Mobile:

Anclar la barra de navegación sobre el banner en vistas mobile.

Colocar accesos directos de Home y Búsqueda visibles a un lado del menú desplegable.

Implementar el menú hamburguesa para desplegar el resto de los enlaces.

🟠 Fase 3: Reproductor de Audio y Estado Global (Media - Alta complejidad)
Lógica de reproducción, sincronización entre componentes y reproductor global.

[ ] Sincronización de estado de reproducción:

Alinear y sincronizar el botón de Play / Pause de la interfaz de /home con el estado global del reproductor.

[ ] Lógica de reproducción no lineal:

Habilitar y sincronizar el reproductor con el botón "Aleatorio" (shuffle) para la reproducción de listas.

🔴 Fase 4: Base de Datos, Arquitectura y Algoritmos (Alta complejidad)
Lógica de backend, estructura de datos y cálculo de contenido dinámico.

[ ] Auditoría de DB para Playlists:

Revisar la arquitectura y esquemas de la Base de Datos para confirmar si ya soportan la creación, guardado y persistencia de playlists antes de conectar la interfaz.

[ ] Algoritmo de sección "Populares":

Implementar el algoritmo/cálculo para ordenar y obtener el contenido de la sección "Populares" en /home.

[ ] Nuevas secciones dinámicas en /home:

Integrar los módulos de Eventos / Próximos eventos, Multimedia y Playlists.