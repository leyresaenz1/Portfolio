# Portfolio — guía de uso

Sitio estático (HTML + CSS + JavaScript, sin compilación). Todo el contenido vive en la carpeta `content/`: para añadir o cambiar publicaciones **solo se editan archivos `.yml`**.

## Estructura

```
portfolio/
├── index.html          Home: presentación + selección de trabajos
├── research.html       Data & Research: 4–6 informes destacados + proyectos de código
├── writing.html        Selected Writing: columnas firmadas + blog de India
├── media.html          Media & Interviews: selección de entrevistas, citas y cobertura
├── archive.html        Publications Archive: los 33 informes, con buscador y filtros
├── about.html          CV & Contact
├── content/
│   ├── profile.yml     Nombre, presentación, contacto, cifras, formación
│   ├── reports.yml     Los 33 informes (destacados y archivo)
│   ├── writing.yml     Columnas y entradas del blog
│   ├── media.yml       Selección de apariciones en medios + frase de alcance
│   └── projects.yml    Proyectos de GitHub
├── files/              PDFs propios (CV, informes que no estén online)
├── assets/             Diseño (style.css) y lógica (site.js). No hace falta tocarlos.
└── vista-previa.bat    Abre la vista previa local
```

## Las tres categorías de autoría

| Etiqueta en la web | Color | Qué es | Archivo |
|---|---|---|---|
| **Bylined column / blog post** | azul | Escrito y firmado por ti | `writing.yml` |
| **Collective report** | verde | Informe de equipo en el que participaste; tus roles se indican en cada uno | `reports.yml` |
| **Interview / Cites my research / Covers a report** | ámbar | Trabajo de otros periodistas | `media.yml` |

Los enlaces entre informes y cobertura son automáticos: si una nota de `media.yml` tiene `report: r05`, aparece en la ficha del informe r05 y en el archivo como "Media coverage (n)". Una columna con `related_report: r05` también se enlaza.

## Vista previa local

1. Haz doble clic en `vista-previa.bat`.
2. Se abre `http://localhost:8000`. Recarga la página tras editar un `.yml`.
3. En la vista previa verás en amarillo los campos **PENDING** y los elementos `draft: true`. En la web pública se ocultan solos. Para ver la versión pública en local, comenta temporalmente esas entradas o mira la web publicada.
   Truco: en la web publicada, añadir `?preview` a la URL muestra también los pendientes.

> No abras los `.html` con doble clic: el navegador bloquea la lectura de los `.yml`. Usa siempre `vista-previa.bat`.

## Añadir una publicación

1. Abre el `.yml` correspondiente (con el Bloc de notas o VS Code).
2. Copia un bloque completo de la plantilla (desde `- id:` hasta antes del siguiente `- id:`).
3. Pégalo al final de la lista, cambia el `id` (debe ser único) y rellena los campos.
4. Pon `draft: false` cuando esté listo.
5. Para destacarlo en la portada: `home: 1` (2, 3…). Para la página Data & Research: `featured: true`.

Errores típicos de formato (la web te mostrará el archivo y la línea del error):
- Sangría con tabuladores → usa espacios.
- Textos con `:` o `#` sin comillas → `title: "Educación: un balance"`.
- Comillas dentro de comillas → usa comillas simples por fuera: `title: 'El "efecto" escuela'`.

## Publicar online (GitHub Pages, gratis)

Sin instalar nada, desde el navegador:

1. Entra en github.com con tu cuenta `leyresaenz1`.
2. **New repository** → nombre exacto: `leyresaenz1.github.io` → Public → Create.
3. En el repositorio vacío: **uploading an existing file** → arrastra **el contenido** de la carpeta `portfolio` (no la carpeta en sí; incluye `.nojekyll`, `assets`, `content`, `files`) → **Commit changes**.
   - En Windows `.nojekyll` puede estar oculto; si no aparece, no pasa nada: el sitio funciona igual.
4. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
5. En 1–3 minutos la web estará en **https://leyresaenz1.github.io**. Ese es el enlace para tus candidaturas.

Para actualizar después: en GitHub abre `content/reports.yml` (por ejemplo) → icono del lápiz → edita → **Commit changes**. La web se actualiza en un par de minutos.

Dominio propio (opcional, p. ej. `leyresaenz.com`): cómpralo en un registrador, y en Settings → Pages → Custom domain sigue las instrucciones de GitHub.

## Antes de enviar el enlace

- [ ] Ninguna página muestra huecos importantes (revisa la web pública, sin `?preview`).
- [ ] La cifra de alcance en medios usa la redacción exacta que quieres (ver nota en `media.yml`).
- [ ] CV en PDF subido a `files/` y `cv_pdf` actualizado en `profile.yml`.
- [ ] Todos los enlaces abren (sobre todo los de medios, que caducan a menudo).
- [ ] Revisado en el móvil.
