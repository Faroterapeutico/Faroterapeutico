# Contexto operativo para Codex

Este archivo es la fuente de contexto operativo del proyecto **Faro Terapéutico**. Léelo antes de modificar, publicar o diagnosticar la web.

## 1. Proyecto y repositorio

- Carpeta local: `C:\Users\Aaron\OneDrive\Escritorio\Pagina web Psicologo`
- Repositorio: `https://github.com/Faroterapeutico/Faroterapeutico.git`
- Rama principal: `main`
- Dominio público de producción: `https://faroterapeutico.com`
- Zona horaria de reservas: `America/Santiago`
- El proyecto es una web estática con un worker y una integración externa de reservas.

No asumir que una publicación en Codex Sites actualiza el dominio público. Son destinos separados.

## 2. Cómo ejecutar la web localmente

Desde la raíz del proyecto:

```powershell
.\local-server.ps1
```

Después abrir:

```text
http://localhost:3000/
```

El servidor local sirve los archivos de la raíz y resuelve URLs sin extensión hacia su archivo `.html` correspondiente.

## 3. Cómo construir y publicar la web

### Construcción local

Ejecutar:

```powershell
.\build-site.ps1
```

El script:

- recrea `dist/client` y `dist/server`;
- copia los archivos públicos rastreados por Git;
- copia `worker/index.js` como servidor en `dist/server/index.js`;
- comprueba que las páginas HTML incluyan `button-system.css`;
- falla si falta un archivo público o el servidor no se genera.

Importante: `build-site.ps1` usa `git ls-files`. Los archivos nuevos no rastreados por Git no se incluyen en la construcción pública hasta ser agregados al repositorio.

### Flujo de publicación de producción

El flujo confirmado para `faroterapeutico.com` es:

1. Modificar únicamente el alcance solicitado.
2. Ejecutar `build-site.ps1`.
3. Revisar el diff y validar localmente.
4. Ejecutar pruebas o comprobaciones específicas de la modificación.
5. Crear un commit descriptivo.
6. Ejecutar `git push origin main`.
7. Verificar la URL pública y el comportamiento afectado.

No afirmar que la producción está actualizada sin comprobar el dominio público después del push.

Antes de publicar, si el cambio afecta reservas, precios, terapeutas, pagos, correo, DNS o analítica, mostrar un resumen de los cambios y pedir confirmación cuando la acción pueda producir un efecto externo irreversible o gasto.

## 4. Apps Script y sistema de reservas

El archivo principal de la integración de reservas es:

- `encuadrado-webhook.gs`

Este archivo se despliega como una aplicación web independiente de Google Apps Script. El frontend consume su endpoint desde `agendar.html`; publicar el repositorio no vuelve a desplegar Apps Script automáticamente.

### Flujo de actualización de Apps Script

Cuando cambia `encuadrado-webhook.gs`:

1. Revisar el diff del archivo.
2. Actualizar el proyecto de Google Apps Script correspondiente.
3. Confirmar las propiedades de script necesarias, sin exponer sus valores.
4. Volver a implementar la aplicación web.
5. Ejecutar como el propietario.
6. Configurar acceso para usuarios que necesiten reservar.
7. Probar configuración pública, disponibilidad y creación de reserva.
8. Verificar también la agenda desde `faroterapeutico.com/agendar`.

Nunca incluir valores de API keys, tokens, contraseñas o propiedades privadas en este archivo, en títulos de chats, en commits o en mensajes.

### Propiedades privadas esperadas

El backend utiliza propiedades de Apps Script con nombres como:

- `ENCUADRADO_API_KEY`
- `ENCUADRADO_API_KEY_AARON`
- `ENCUADRADO_API_KEY_BENJAMIN`
- `ENCUADRADO_API_KEY_ISIDORA`
- `ENCUADRADO_API_KEY_VICENTE`
- `ENCUADRADO_BOOKING_REDIRECT_URL`
- `BOOKING_NOTIFICATION_EMAIL_<THERAPIST>`
- `BOOKING_NOTIFICATION_FALLBACK_EMAIL`

Solo comprobar si existen y están configuradas. Nunca leer, copiar ni mostrar sus valores.

El archivo `clinical-assessment-webhook.gs` corresponde a otra integración independiente de evaluación clínica. No modificarlo cuando el cambio solicitado sea solo sobre reservas.

## 5. Archivos principales por sistema

### Frontend y contenido público

- `index.html`: portada.
- `agendar.html`: flujo público de selección, disponibilidad y reserva.
- `confirmacion-reserva.html`: confirmación y medición posterior a la reserva.
- `aaron.html`, `benjamin.html`, `isidora.html`, `vicente.html`, `david.html`: perfiles profesionales.
- `fonasa.html`, `isapre.html` y páginas de aseguradoras: landings de cobertura y reembolso.
- `blog.html` y archivos de artículos: contenido editorial y SEO.
- `style.css`, `critical.css`, `button-system.css` y hojas específicas: estilos.
- `script.js`: funciones compartidas, analítica y comportamiento general.

### Publicación y ejecución

- `build-site.ps1`: construcción reproducible.
- `local-server.ps1`: servidor local de revisión.
- `_headers`: cabeceras y política de seguridad.
- `_redirects`: redirecciones públicas.
- `_worker.js` y `worker/index.js`: worker de la plataforma de publicación.

### SEO, identidad y metadatos

- `sitemap.xml`
- `robots.txt`
- `llms.txt`
- `humans.txt`
- `faro-terapeutico.vcf`
- carpeta `images/`

Al cambiar datos de contacto, perfiles o URLs, buscar también referencias en metadatos, sitemap, datos estructurados, enlaces `mailto`, imágenes y landings relacionadas.

## 6. Estado operativo de terapeutas y servicios

Esta sección resume la configuración conocida en el código. Antes de cambiarla, verificar frontend, Apps Script y disponibilidad real en Encuadrado.

### Terapeutas

- Aaron Millán Solís: terapeuta activo; agenda FONASA presencial activa.
- Benjamín Reyes: activo para terapia individual, pareja, infanto-juvenil y FONASA según la configuración actual.
- Isidora Sanhueza: atención exclusivamente con Isapre en la agenda pública actual.
- Vicente Camilo Leiva Vega: activo para terapia individual, de pareja y familiar; modalidad presencial y online.
- David Walter Salinas: agenda cerrada.

### Reglas de servicios conocidas

- Terapia de pareja: Aaron, Benjamín y Vicente.
- Terapia familiar: Vicente.
- Terapia infanto-juvenil: Isidora y Benjamín.
- FONASA: Aaron (presencial), Benjamín y Vicente.
- Valor FONASA configurado actualmente para Benjamín y Vicente: `$14.420`.
- Valor base mostrado en el frontend para servicios particulares/Isapre: `$30.000`; verificar contra Encuadrado antes de modificar o comunicarlo.
- Vicente: lunes a viernes, entre las 18:00 y las 20:00, según la regla del backend.

La disponibilidad real depende de Encuadrado y del despliegue activo de Apps Script. No basta con que el nombre aparezca en `agendar.html`.

## 7. Analítica y publicidad

Los puntos principales de medición están en:

- `script.js`
- `agendar.html`
- `confirmacion-reserva.html`

Después de cambios en formularios, WhatsApp, reservas o confirmaciones, comprobar que los eventos no se dupliquen y que sigan enviándose a Google Analytics y Google Ads.

Google Ads, Cloudflare y otros paneles externos no se actualizan mediante un `git push`. Tratar cada cambio externo como una tarea separada y confirmar exactamente qué cuenta, campaña, dominio o registro se modificará.

## 8. Límites de seguridad y alcance

Codex debe:

- trabajar solo en el alcance indicado;
- preservar cambios locales no relacionados;
- revisar `git status` antes de modificar;
- mostrar el diff antes de una publicación sensible;
- verificar producción después de publicar;
- evitar exponer datos de pacientes, credenciales o información privada;
- distinguir siempre entre frontend, Apps Script, Encuadrado, GitHub, Cloudflare, Google Ads y Codex Sites.

Codex no debe:

- inventar claves, UUIDs, servicios o disponibilidad;
- modificar registros DNS, campañas, pagos o reservas sin una instrucción explícita;
- publicar Apps Script suponiendo que `git push` lo actualiza;
- sobrescribir cambios no relacionados;
- agregar automáticamente archivos de diseño o adjuntos sin seguimiento de Git;
- incluir secretos en el repositorio o en este archivo;
- afirmar que una reserva funciona solo porque el botón aparece en la web.

## 9. Archivos locales no rastreados

Al revisar el estado actual del proyecto existen archivos y carpetas locales no rastreados, principalmente capturas, adjuntos, imágenes y diseños de carteles. No incluirlos en commits ni publicaciones salvo que el usuario solicite expresamente incorporarlos.

## 10. Última publicación conocida

- Fecha: 2026-11-13.
- Commit: `66a82a6`.
- Mensaje: `Agregar agenda de Vicente`.
- Rama: `main`.
- Estado observado al crear este archivo: `main` sincronizada con `origin/main`, con archivos locales no rastreados.

Este dato es histórico. Después de cualquier cambio, obtener nuevamente `git status`, `git log` y una verificación del dominio antes de actualizar esta sección.
