#!/usr/bin/env python3
"""
Generador del Manual de Usuario - Panel de Administración
Sitio: angelgiolitti.com.ar
"""

from fpdf import FPDF
import os

FONT_DIR = r"C:\Windows\Fonts"
OUTPUT = os.path.join(os.path.dirname(__file__), "manual-usuario-admin.pdf")


class ManualPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("DejaVu", "", os.path.join(FONT_DIR, "DejaVuSans.ttf"))
        self.add_font("DejaVu", "B", os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf"))
        self.add_font("DejaVu", "I", os.path.join(FONT_DIR, "DejaVuSans-Oblique.ttf"))
        self.add_font("DejaVuMono", "", os.path.join(FONT_DIR, "DejaVuSansMono.ttf"))
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("DejaVu", "I", 8)
        self.set_text_color(140, 140, 140)
        self.cell(0, 8, "Manual de Usuario - Panel de Administración", align="L")
        self.cell(0, 8, f"Página {self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font("DejaVu", "I", 7)
        self.set_text_color(160, 160, 160)
        self.cell(0, 10, "angelgiolitti.com.ar", align="C")

    def cover_page(self):
        self.add_page()
        self.ln(60)
        self.set_font("DejaVu", "B", 28)
        self.set_text_color(30, 30, 30)
        self.cell(0, 14, "Manual de Usuario", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_font("DejaVu", "", 16)
        self.set_text_color(80, 80, 80)
        self.cell(0, 10, "Panel de Administración", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(8)
        self.set_draw_color(30, 30, 30)
        self.set_line_width(0.5)
        cx = self.w / 2
        self.line(cx - 30, self.get_y(), cx + 30, self.get_y())
        self.ln(12)
        self.set_font("DejaVu", "", 11)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "angelgiolitti.com.ar", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_font("DejaVu", "", 10)
        self.cell(0, 8, "Versión 1.0 — 2026", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(40)
        self.set_font("DejaVu", "I", 9)
        self.set_text_color(140, 140, 140)
        self.cell(0, 8, "Este manual explica paso a paso cómo usar el panel", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "de administración para gestionar tu sitio web.", align="C", new_x="LMARGIN", new_y="NEXT")

    def toc_page(self):
        self.add_page()
        self.section_title("Índice")
        self.ln(4)
        items = [
            ("1.", "Introducción", "Qué es el panel y para qué sirve"),
            ("2.", "Iniciar Sesión", "Acceder al panel de control"),
            ("3.", "Navegación General", "Menú lateral y botones comunes"),
            ("4.", "Dashboard — Resumen", "Métricas rápidas y acciones directas"),
            ("5.", "Música", "Álbumes, EPs, singles y canciones"),
            ("6.", "Eventos", "Agenda de shows y presentaciones"),
            ("7.", "Proyectos", "Videoclips, bandas y producciones"),
            ("8.", "Galería", "Álbumes fotográficos"),
            ("9.", "Bio & Documentos", "Perfil del artista y prensa"),
            ("10.", "Consejos y Errores Comunes", "Soluciones a problemas frecuentes"),
        ]
        for num, title, desc in items:
            self.set_font("DejaVu", "B", 11)
            self.set_text_color(30, 30, 30)
            self.cell(10, 8, num)
            self.cell(50, 8, title)
            self.set_font("DejaVu", "", 9)
            self.set_text_color(120, 120, 120)
            self.cell(0, 8, desc, new_x="LMARGIN", new_y="NEXT")
            self.ln(2)

    # ── Helpers ──

    def section_title(self, text):
        self.set_font("DejaVu", "B", 18)
        self.set_text_color(20, 20, 20)
        self.cell(0, 12, text, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(30, 30, 30)
        self.set_line_width(0.4)
        self.line(self.l_margin, self.get_y(), self.l_margin + 40, self.get_y())
        self.ln(6)

    def subsection(self, text):
        self.ln(2)
        self.set_font("DejaVu", "B", 13)
        self.set_text_color(40, 40, 40)
        self.cell(0, 9, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def sub_subsection(self, text):
        self.ln(1)
        self.set_font("DejaVu", "B", 11)
        self.set_text_color(60, 60, 60)
        self.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text):
        self.set_font("DejaVu", "", 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def step(self, num, text):
        self.set_font("DejaVu", "B", 10)
        self.set_text_color(30, 30, 30)
        x = self.get_x()
        self.cell(8, 6, f"{num}.")
        self.set_font("DejaVu", "", 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def tip(self, text):
        self.ln(2)
        self.set_fill_color(245, 245, 245)
        self.set_draw_color(200, 200, 200)
        x = self.l_margin
        y = self.get_y()
        self.set_font("DejaVu", "B", 9)
        self.set_text_color(80, 80, 80)
        self.set_x(x + 4)
        self.cell(0, 6, "Consejo:", new_x="LMARGIN", new_y="NEXT")
        self.set_font("DejaVu", "", 9)
        self.set_text_color(90, 90, 90)
        self.set_x(x + 4)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 8, 5, text)
        self.ln(3)

    def warning(self, text):
        self.ln(2)
        self.set_fill_color(255, 250, 240)
        self.set_draw_color(220, 180, 100)
        x = self.l_margin
        self.set_font("DejaVu", "B", 9)
        self.set_text_color(160, 100, 20)
        self.set_x(x + 4)
        self.cell(0, 6, "Importante:", new_x="LMARGIN", new_y="NEXT")
        self.set_font("DejaVu", "", 9)
        self.set_text_color(130, 90, 20)
        self.set_x(x + 4)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 8, 5, text)
        self.ln(3)

    def field_desc(self, name, desc):
        self.set_font("DejaVu", "B", 10)
        self.set_text_color(30, 30, 30)
        self.cell(0, 6, name, new_x="LMARGIN", new_y="NEXT")
        self.set_font("DejaVu", "", 9)
        self.set_text_color(90, 90, 90)
        self.set_x(self.l_margin + 6)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 6, 5, desc)
        self.ln(1)

    def button_desc(self, name, desc):
        self.set_font("DejaVu", "B", 9)
        self.set_text_color(30, 30, 30)
        self.cell(50, 6, f"Botón: {name}")
        self.set_font("DejaVu", "", 9)
        self.set_text_color(90, 90, 90)
        self.cell(0, 6, desc, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def check_page(self, min_space=60):
        if self.get_y() > self.h - self.r_margin - min_space:
            self.add_page()


# ──────────────────────────────────────
# Contenido del manual
# ──────────────────────────────────────

def build_manual():
    pdf = ManualPDF()
    pdf.set_margins(20, 20, 20)

    # Portada e índice
    pdf.cover_page()
    pdf.toc_page()

    # ═══════════════════════════════════
    # CAPÍTULO 1: Introducción
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("1. Introducción")
    pdf.body(
        "El Panel de Administración es el lugar desde donde gestionás todo el contenido "
        "de tu sitio web: tu música, eventos, proyectos, fotos y tu perfil como artista."
    )
    pdf.body(
        "No necesitás conocimientos técnicos. El panel está diseñado para que puedas "
        "sumar y modificar contenido de forma sencilla, como si estuvieras completando "
        "un formulario."
    )
    pdf.subsection("Qué podés hacer desde aquí")
    items = [
        "Subir y administrar tus discos, EPs y singles",
        "Agregar canciones (tracks) a cada lanzamiento",
        "Crear y editar eventos de tu agenda de shows",
        "Gestionar proyectos audiovisuales (videoclips, bandas, etc.)",
        "Subir y organizar fotos en galerías",
        "Editar tu biografía y redes sociales",
        "Subir documentos de prensa (dossier, CV)",
        "Ver estadísticas de reproducciones, likes y visitas",
    ]
    for i, item in enumerate(items, 1):
        pdf.step(i, item)

    # ═══════════════════════════════════
    # CAPÍTULO 2: Iniciar Sesión
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("2. Iniciar Sesión")
    pdf.body(
        "Para entrar al panel de administración, seguí estos pasos:"
    )
    pdf.step(1, "Abrí el navegador (Chrome, Firefox, Safari o Edge).")
    pdf.step(2, "En la barra de direcciones, escribí la dirección de tu sitio seguida de /admin. Por ejemplo: angelgiolitti.com.ar/admin")
    pdf.step(3, "Aparecerá una pantalla de inicio de sesión con un formulario.")
    pdf.step(4, "Completá los campos:")
    pdf.field_desc("Correo", "Tu dirección de email de administrador.")
    pdf.field_desc("Contraseña", "Tu contraseña de acceso.")
    pdf.step(5, "Hacé clic en el botón blanco que dice \"Entrar\".")
    pdf.tip(
        "Si te equivocás al escribir la contraseña, verás un mensaje rojo que dice "
        "\"Credenciales incorrectas\". Revisá mayúsculas y minúsculas e intentá de nuevo."
    )

    pdf.subsection("Cerrar Sesión")
    pdf.body(
        "Cuando termines de usar el panel, siempre cerrá sesión por seguridad. "
        "En el menú de la izquierda, al fondo, hacé clic en \"Cerrar Sesión\"."
    )

    # ═══════════════════════════════════
    # CAPÍTULO 3: Navegación General
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("3. Navegación General")

    pdf.subsection("El menú lateral (izquierda)")
    pdf.body(
        "Al ingresar, verás un menú del lado izquierdo de la pantalla con 6 secciones. "
        "Cada sección tiene un nombre y un ícono:"
    )
    menu_items = [
        ("Resumen", "Vista general con estadísticas y accesos rápidos"),
        ("Música", "Gestionar álbumes, EPs, singles y canciones"),
        ("Eventos", "Administrar tu agenda de shows"),
        ("Proyectos", "Videoclips, bandas y producciones audiovisuales"),
        ("Galería", "Álbumes y fotos"),
        ("Bio & Docs", "Tu perfil y documentos de prensa"),
    ]
    for name, desc in menu_items:
        pdf.set_font("DejaVu", "B", 10)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(30, 6, f"  {name}")
        pdf.set_font("DejaVu", "", 9)
        pdf.set_text_color(90, 90, 90)
        pdf.cell(0, 6, desc, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    pdf.body("Para ir a una sección, hacé clic en su nombre del menú.")

    pdf.subsection("Otros botones del menú")
    pdf.button_desc("Ver sitio público", "Abre tu sitio web en una nueva pestaña para ver cómo se ve.")
    pdf.button_desc("Cerrar Sesión", "Cierra tu sesión y vuelve a la pantalla de login.")

    pdf.subsection("En pantallas chicas (celular)")
    pdf.body(
        "Si abrís el panel desde un celular, el menú lateral no se ve siempre. "
        "Para abrirlo, tocá el ícono de tres líneas (hamburguesa) que aparece arriba a la izquierda. "
        "Para cerrarlo, tocá afuera del menú o el ícono de cruz (X)."
    )

    pdf.subsection("Botones comunes en todo el panel")
    pdf.body("En casi todas las pantallas vas a encontrar estos botones:")
    pdf.button_desc("Nuevo ... / +", "Abre un formulario para crear algo nuevo (álbum, evento, etc.)")
    pdf.button_desc("Guardar", "Guarda lo que completaste en el formulario.")
    pdf.button_desc("Cancelar", "Cierra el formulario sin guardar cambios.")
    pdf.button_desc("Editar (ícono lápiz)", "Abre un elemento existente para modificarlo.")
    pdf.button_desc("Eliminar (ícono tacho)", "Borra un elemento. Siempre te pide confirmación.")

    # ═══════════════════════════════════
    # CAPÍTULO 4: Dashboard — Resumen
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("4. Dashboard — Resumen")
    pdf.body(
        "La primera pantalla que ves al ingresar es el Resumen. Es como un \"panel de "
        "control\" que muestra estadísticas rápidas de tu sitio."
    )

    pdf.subsection("Acciones rápidas")
    pdf.body(
        "Arriba hay 5 botones grandes para ir directamente a crear contenido nuevo. "
        "Cada uno te lleva a la sección correspondiente:"
    )
    actions = [
        ("Subir música", "Te lleva a la sección Música para crear un álbum o single."),
        ("Crear evento", "Te lleva a la sección Eventos para agendar un show."),
        ("Nuevo proyecto", "Te lleva a la sección Proyectos."),
        ("Subir fotos", "Te lleva a la sección Galería."),
        ("Editar bio", "Te lleva a la sección Bio & Docs."),
    ]
    for name, desc in actions:
        pdf.set_font("DejaVu", "B", 10)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(35, 6, f"  {name}")
        pdf.set_font("DejaVu", "", 9)
        pdf.set_text_color(90, 90, 90)
        pdf.cell(0, 6, desc, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    pdf.subsection("Las 4 tarjetas principales (KPIs)")
    pdf.body("Debajo de las acciones rápidas verás 4 tarjetas con números importantes:")
    kpis = [
        ("Reproducciones", "Total de veces que tus canciones fueron escuchadas."),
        ("Canciones", "Cantidad total de tracks subidos."),
        ("Me Gusta", "Total de \"likes\" que recibieron tus canciones."),
        ("Visitas", "Cantidad de veces que visitaron tu sitio web."),
    ]
    for name, desc in kpis:
        pdf.field_desc(name, desc)

    pdf.subsection("Contadores secundarios")
    pdf.body("Más abajo hay 4 contadores más pequeños: Lanzamientos, Eventos, Proyectos y Álbumes de fotos.")

    pdf.subsection("Botón Actualizar")
    pdf.body(
        "Si hacés clic en el botón \"Actualizar\" (arriba a la derecha), los datos se "
        "vuelven a cargar desde la base de datos. Útil si acabás de subir algo y querés "
        "ver los números refrescados."
    )

    pdf.subsection("Sub-pestañas del Resumen")
    pdf.body("Dentro del Resumen hay 4 pestañas para ver diferentes datos:")
    tabs = [
        ("resumen", "Muestra la distribución de escuchas por tipo (álbum, EP, single), el top 5 de canciones más escuchadas y las páginas con más tráfico."),
        ("canciones", "Un listado completo de todas tus canciones con búsqueda y ordenamiento. Podés buscar por nombre de canción o álbum."),
        ("lanzamientos", "Tabla con cada lanzamiento, cuántos tracks tiene, cuántas reproducciones y qué porcentaje del total representa."),
        ("trafico", "Listado de todas las páginas del sitio con la cantidad de vistas de cada una."),
    ]
    for name, desc in tabs:
        pdf.field_desc(name, desc)

    pdf.tip(
        "En la pestaña \"canciones\" podés ordenar haciendo clic en los botones "
        "\"Plays\", \"Likes\" o \"Fidelidad\". Hacé clic dos veces para cambiar "
        "entre orden descendente (mayor a menor) y ascendente (menor a mayor)."
    )

    # ═══════════════════════════════════
    # CAPÍTULO 5: Música
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("5. Música")
    pdf.body(
        "Desde esta sección administrás tus lanzamientos musicales: álbumes, EPs y singles. "
        "Cada lanzamiento puede tener varias canciones (tracks)."
    )

    pdf.subsection("Ver tus lanzamientos")
    pdf.body(
        "Al entrar a la pestaña \"Música\", verás una tabla con todos tus lanzamientos. "
        "Cada fila muestra: la portada, el nombre, el tipo (album/ep/single), el año y "
        "los botones de acción."
    )

    pdf.subsection("Crear un nuevo lanzamiento")
    pdf.step(1, "Hacé clic en el botón blanco \"Nuevo Lanzamiento\" (arriba a la derecha).")
    pdf.step(2, "Se abrirá un formulario. Completá los campos:")
    pdf.field_desc("Título del Lanzamiento", "El nombre del disco, EP o single. Ejemplo: \"Populares\".")
    pdf.field_desc("Tipo", "Elegí entre: Álbum Completo, EP, o Single / Sencillo.")
    pdf.field_desc("Año de Lanzamiento", "El año en que se publicó.")
    pdf.field_desc("Proyecto Relacionado", "Opcional. Si tenés un proyecto creado (ej: una banda), podés vincularlo.")
    pdf.field_desc("Descripción", "Opcional. Una reseña o información sobre el disco.")
    pdf.field_desc("Imagen de Portada", "Hacé clic en la zona de carga o arrastrá una imagen. La imagen se comprimirá automáticamente.")
    pdf.step(3, "Hacé clic en \"Guardar Lanzamiento\".")
    pdf.tip(
        "Si no tenés portada, podés guardar sin ella y agregarla después editando el lanzamiento."
    )

    pdf.subsection("Editar un lanzamiento")
    pdf.body(
        "En la tabla de lanzamientos, hacé clic en el ícono de lápiz (Editar) de la fila "
        "que querés modificar. Se abrirá el mismo formulario de creación con los datos "
        "ya completados. Modificá lo que necesites y guardá."
    )

    pdf.subsection("Eliminar un lanzamiento")
    pdf.body(
        "Hacé clic en el ícono de tacho (Eliminar). Aparecerá un mensaje pidiendo "
        "confirmación. Si confirmás, se borrará el lanzamiento y TODAS sus canciones."
    )
    pdf.warning(
        "Eliminar un lanzamiento borra también todas sus canciones. Esta acción no se "
        "puede deshacer."
    )

    pdf.subsection("Agregar canciones (tracks) a un lanzamiento")
    pdf.body("Para agregar canciones, primero entrá al lanzamiento:")
    pdf.step(1, "En la tabla de lanzamientos, hacé clic en la fila del álbum que querés (en cualquier parte menos en los botones de editar/eliminar).")
    pdf.step(2, "Se abrirá el formulario del lanzamiento. Scrolléate hacia abajo hasta ver la sección \"Canciones\".")
    pdf.step(3, "Del lado derecho, verás \"Agregar Canciones\". Hací clic en la zona de carga o arrastrá archivos MP3.")
    pdf.step(4, "Podés seleccionar varios archivos a la vez. Aparecerán en una lista llamada \"Cola de carga\".")
    pdf.step(5, "Revisá los títulos de cada canción. El sistema toma el nombre del archivo, pero podés editarlo haciendo clic en el campo de texto.")
    pdf.step(6, "Para quitar una canción de la cola, hacé clic en el ícono de tacho a su derecha.")
    pdf.step(7, "Cuando estén todas listas, hacé clic en \"Subir X canciones\".")
    pdf.tip(
        "Los archivos deben ser MP3. La duración de cada canción se detecta "
        "automáticamente."
    )

    pdf.subsection("Reordenar canciones")
    pdf.body(
        "Dentro del formulario del lanzamiento, cada canción tiene flechas arriba/abajo "
        "para cambiar su orden. Hacé clic en las flechas y el orden se guarda "
        "automáticamente."
    )

    pdf.subsection("Eliminar una canción")
    pdf.body(
        "Poné el mouse sobre la canción que querés borrar y aparecerá un ícono de tacho "
        "a la derecha. Hacé clic y confirmá."
    )

    # ═══════════════════════════════════
    # CAPÍTULO 6: Eventos
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("6. Eventos")
    pdf.body(
        "La sección de Eventos es tu agenda de shows y presentaciones. Los eventos se "
        "dividen en dos grupos: \"Próximos\" (los que aún no pasaron) e \"Historial\" "
        "(los que ya finalizaron)."
    )

    pdf.subsection("Ver eventos")
    pdf.body(
        "Al entrar, verás primero los eventos próximos y después el historial. Los "
        "eventos pasados aparecen un poco más opacos (atenados) para distinguirlos."
    )

    pdf.subsection("Crear un nuevo evento")
    pdf.step(1, "Hacé clic en \"Nuevo Evento\" (arriba a la derecha).")
    pdf.step(2, "Completá el formulario:")
    pdf.field_desc("Nombre del Show / Evento", "Ej: \"Ángel Giolitti Live en Niceto\".")
    pdf.field_desc("Descripción del Evento", "Opcional. Información adicional sobre el show.")
    pdf.field_desc("Fecha y Hora", "Seleccioná la fecha y hora del evento.")
    pdf.field_desc("Estado", "\"Próximo\" si el evento aún no pasó, \"Finalizado / Pasado\" si ya ocurrió.")
    pdf.field_desc("Lugar / Recinto", "Ej: \"Niceto Club\".")
    pdf.field_desc("Ciudad / Provincia", "Ej: \"Buenos Aires, CABA\".")
    pdf.field_desc("Enlace de Google Maps", "Opcional. Pegá el link de Google Maps del lugar.")
    pdf.field_desc("Enlace de Compra de Tickets", "Opcional. Link a Passline, StubHub, etc.")
    pdf.field_desc("Precio de Entrada (ARS)", "Opcional. El precio en pesos. Si es gratis, dejalo vacío.")
    pdf.field_desc("Destacar este evento", "Si activás esta casilla, el evento se mostrará como destacado en el sitio.")
    pdf.field_desc("Flyer del Show", "Subí la imagen del flyer. Se comprimirá automáticamente.")
    pdf.step(3, "Hacé clic en \"Guardar Evento\".")

    pdf.subsection("Editar un evento")
    pdf.body(
        "En la tabla de eventos, hacé clic en el ícono de lápiz. Modificá lo que "
        "necesites y guardá."
    )

    pdf.subsection("Marcar un evento como finalizado")
    pdf.body(
        "Cuando un show ya pasó, editá el evento y cambiá el \"Estado\" de \"Próximo\" "
        "a \"Finalizado / Pasado\". Así se moverá a la sección de Historial."
    )

    pdf.subsection("Eliminar un evento")
    pdf.body("Hacé clic en el ícono de tacho y confirmá.")

    # ═══════════════════════════════════
    # CAPÍTULO 7: Proyectos
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("7. Proyectos")
    pdf.body(
        "Los proyectos son producciones audiovisuales más amplias: videoclips, bandas, "
        "live sessions, documentales u otros proyectos especiales. Desde acá podés "
        "vincular álbumes y galerías de fotos a cada proyecto."
    )

    pdf.subsection("Crear un nuevo proyecto")
    pdf.step(1, "Hacé clic en \"Nuevo Proyecto\".")
    pdf.step(2, "Completá el formulario:")
    pdf.field_desc("Título", "Nombre del proyecto. Ej: \"Handangel\", \"Live at Teatro Colón\".")
    pdf.field_desc("Categoría", "Elegí: Banda, Videoclip, Live Session, Documental, o Proyecto.")
    pdf.field_desc("Año de Inicio", "El año en que empezó.")
    pdf.field_desc("Año de Cierre", "Opcional. Si el proyecto sigue activo, dejalo vacío.")
    pdf.field_desc("Resumen", "Una breve descripción del proyecto.")
    pdf.field_desc("URL de Video Principal", "Opcional. Link de YouTube o Vimeo.")
    pdf.field_desc("Lanzamientos Vinculados", "Opcional. Marcá con la casilla los discos/singles que pertenecen a este proyecto.")
    pdf.field_desc("Galerías de Fotos Vinculadas", "Opcional. Marcá las galerías de fotos de este proyecto.")
    pdf.field_desc("Imagen de Portada", "Subí una imagen. Se optimizará automáticamente.")
    pdf.step(3, "Hacé clic en \"Guardar Proyecto\".")

    pdf.subsection("Editar o eliminar un proyecto")
    pdf.body(
        "Igual que en las otras secciones: usá los íconos de lápiz para editar y de "
        "tacho para eliminar."
    )
    pdf.tip(
        "Si un proyecto tiene un video principal, verás un ícono de enlace en la tabla. "
        "Hacé clic para abrir el video en YouTube o Vimeo."
    )

    # ═══════════════════════════════════
    # CAPÍTULO 8: Galería
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("8. Galería")
    pdf.body(
        "La galería te permite organizar tus fotos en álbumes. Cada álbum puede tener "
        "muchas fotos y una portada."
    )

    pdf.subsection("Ver álbumes")
    pdf.body(
        "Al entrar, verás tarjetas con la portada de cada álbum, su título y una "
        "descripción. Debajo de cada tarjeta hay 3 botones: Ver Fotos, Editar y Eliminar."
    )

    pdf.subsection("Crear un nuevo álbum de fotos")
    pdf.step(1, "Hacé clic en \"Nuevo Álbum\".")
    pdf.step(2, "Completá:")
    pdf.field_desc("Título del Álbum", "Ej: \"Fotos de Gira 2024\".")
    pdf.field_desc("Descripción", "Opcional. Información sobre el álbum.")
    pdf.field_desc("Proyecto Vinculado", "Opcional. Asociá este álbum a un proyecto existente.")
    pdf.field_desc("Foto de Portada", "Subí una imagen. Se comprimirá automáticamente.")
    pdf.step(3, "Hacé clic en \"Crear Álbum\".")

    pdf.subsection("Agregar fotos a un álbum")
    pdf.step(1, "En la tarjeta del álbum, hacé clic en \"Ver Fotos\".")
    pdf.step(2, "A la derecha verás la sección \"Subir Fotos\".")
    pdf.step(3, "Hací clic en la zona de carga y seleccioná las fotos. Podés elegir varias a la vez.")
    pdf.step(4, "Las fotos se comprimirán automáticamente a formato WebP (liviano y de buena calidad).")
    pdf.step(5, "Hacé clic en \"Subir X fotos\". Verás una barra de progreso.")
    pdf.step(6, "Cuando termine, las fotos aparecerán en la cuadrícula de la izquierda.")
    pdf.tip(
        "No hay límite de fotos por álbum. Subí todas las que quieras."
    )

    pdf.subsection("Eliminar una foto")
    pdf.body(
        "Poné el mouse sobre la foto que querés borrar. Aparecerá un círculo rojo con "
        "un tacho. Hacé clic y confirmá."
    )

    pdf.subsection("Eliminar un álbum")
    pdf.body(
        "En la tarjeta del álbum, hacé clic en el ícono de tacho. Se eliminará el álbum "
        "y TODAS sus fotos."
    )
    pdf.warning(
        "Eliminar un álbum borra también todas sus fotos. No se puede deshacer."
    )

    # ═══════════════════════════════════
    # CAPÍTULO 9: Bio & Documentos
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("9. Bio & Documentos")
    pdf.body(
        "Esta sección tiene dos partes: tu perfil como artista y los documentos de prensa."
    )

    pdf.subsection("Editar tu perfil")
    pdf.body("Completá o modificá los siguientes campos:")
    pdf.field_desc("Nombre Completo", "Tu nombre artístico o real.")
    pdf.field_desc("Biografía Corta", "Una o dos frases. Se muestra en resúmenes del sitio.")
    pdf.field_desc("Biografía Completa", "Tu trayectoria completa. Se muestra en la página /bio.")
    pdf.ln(2)
    pdf.body("Redes sociales (completá con tus URLs o usuarios):")
    pdf.field_desc("Instagram", "Tu usuario o link completo. Ej: \"@angelgiolitti\" o \"https://instagram.com/angelgiolitti\".")
    pdf.field_desc("YouTube", "Link a tu canal de YouTube.")
    pdf.field_desc("Spotify", "Link a tu perfil de Spotify for Artists.")
    pdf.field_desc("WhatsApp", "Tu número de WhatsApp con código de país. Ej: \"5491112345678\".")
    pdf.field_desc("Facebook", "Link a tu página de Facebook.")
    pdf.ln(2)
    pdf.body("Cuando termines, hacé clic en \"Guardar Perfil\". Verás un mensaje verde que dice \"¡Perfil guardado correctamente!\".")

    pdf.subsection("Documentos de Prensa")
    pdf.body(
        "Acá podés subir tu Dossier de Prensa (EPK) y tu Currículum Vitae en formato PDF."
    )

    pdf.sub_subsection("Subir un documento")
    pdf.step(1, "En \"Título del Documento\", escribí un nombre. Ej: \"Dossier de Prensa 2026\".")
    pdf.step(2, "En \"Tipo de Documento\", elegí: Dossier de Prensa / EPK o Currículum Vitae.")
    pdf.step(3, "Hací clic en \"Seleccionar archivo PDF\" y elegí el archivo de tu computadora.")
    pdf.step(4, "Hacé clic en \"Subir Documento\".")
    pdf.warning("Solo se aceptan archivos PDF. Si tu documento está en Word, exportalo como PDF antes.")

    pdf.sub_subsection("Ver o eliminar un documento")
    pdf.body(
        "Los documentos subidos aparecen en una lista. Cada uno tiene un ícono de enlace "
        "(para abrirlo en una nueva pestaña) y un ícono de tacho (para eliminarlo)."
    )

    # ═══════════════════════════════════
    # CAPÍTULO 10: Consejos y Errores
    # ═══════════════════════════════════
    pdf.add_page()
    pdf.section_title("10. Consejos y Errores Comunes")

    pdf.subsection("Formatos de imagen")
    pdf.body(
        "Podés subir imágenes en cualquier formato (JPG, PNG, GIF, etc.). El sistema las "
        "convierte automáticamente a formato WebP, que es más liviano y mantiene buena "
        "calidad."
    )
    pdf.body("Tamaños máximos de imagen recomendados:")
    pdf.field_desc("Portada de álbum", "Máximo 600x600 píxeles.")
    pdf.field_desc("Flyer de evento", "Máximo 800x1200 píxeles (vertical).")
    pdf.field_desc("Portada de proyecto", "Máximo 900x500 píxeles (horizontal).")
    pdf.field_desc("Portada de galería", "Máximo 800x800 píxeles.")
    pdf.field_desc("Fotos de galería", "Máximo 1200x900 píxeles.")

    pdf.subsection("Archivos de audio")
    pdf.body("Los archivos de audio deben ser MP3. No se aceptan WAV, OGG u otros formatos.")

    pdf.subsection("Documentos de prensa")
    pdf.body("Solo se aceptan archivos PDF. Si tu CV o dossier está en Word (.docx), exportalo como PDF.")

    pdf.subsection("Errores comunes y soluciones")

    errors = [
        ("\"Credenciales incorrectas\"", "Revisá que estés escribiendo bien tu email y contraseña. Las mayúsculas importan."),
        ("La imagen no se ve después de subirla", "Esperá unos segundos. A veces tarda en cargar. Si persiste, recargá la página."),
        ("No puedo subir un archivo", "Verificá que sea del formato correcto (MP3 para audio, PDF para documentos, imagen para portadas)."),
        ("El formulario no se cierra", "Hacé clic en \"Cancelar\" o en la flecha (←) arriba a la izquierda del formulario."),
        ("No se guardaron mis cambios", "Verificá que hayas hecho clic en \"Guardar\". Si el botón estaba gris, es porque faltaba completar un campo obligatorio."),
        ("Las fotos se ven borrosas", "El sistema comprime las imágenes para que el sitio cargue rápido. Es normal. Subí la mayor resolución posible y el sistema se encarga."),
    ]
    for title, solution in errors:
        pdf.set_font("DejaVu", "B", 10)
        pdf.set_text_color(180, 40, 40)
        pdf.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("DejaVu", "", 9)
        pdf.set_text_color(80, 80, 80)
        pdf.set_x(pdf.l_margin + 6)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin - 6, 5, solution)
        pdf.ln(2)

    pdf.subsection("Consejos finales")
    pdf.tip("Guardá siempre después de hacer un cambio. Si cerrás sin guardar, se pierde todo.")
    pdf.tip("Si no estás seguro de algo, recordá que siempre podés Editar después para corregir.")
    pdf.tip("Antes de Eliminar algo, pensá dos veces. Las eliminaciones no se pueden deshacer.")
    pdf.tip("Si algo se ve raro, recargá la página (F5 o Ctrl+R).")
    pdf.tip("Para ver cómo se ve tu sitio, hacé clic en \"Ver sitio público\" del menú.")

    # ═══════════════════════════════════
    # Generar PDF
    # ═══════════════════════════════════
    pdf.output(OUTPUT)
    print(f"Manual generado: {OUTPUT}")
    print(f"Total de páginas: {pdf.pages_count}")


if __name__ == "__main__":
    build_manual()
