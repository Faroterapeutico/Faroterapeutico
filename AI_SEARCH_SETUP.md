# Cloudflare AI Search setup

Fecha de preparacion: 2026-05-17
Dominio canonico: https://faroterapeutico.com

Este archivo deja lista la configuracion operativa para crear y probar una instancia de Cloudflare AI Search sin tener que decidir en caliente dentro del dashboard.

## Estado local

- El sitio tiene 41 URLs canonicas en `sitemap.xml`.
- Todas las URLs del sitemap tienen etiqueta `<main>`, por lo que el selector de contenido recomendado es `main`.
- `robots.txt` permite explicitamente el crawler `Cloudflare-AI-Search`.
- `_headers` ya permite cargar y consultar futuros endpoints `https://*.search.ai.cloudflare.com`.
- `llms.txt` contiene datos clave del centro y reglas prudentes para asistentes.

## Instancia recomendada

- Nombre: `faro-terapeutico-site`
- Tipo de fuente: Website
- Fuente: `https://faroterapeutico.com`
- Sitemap especifico: `https://faroterapeutico.com/sitemap.xml`
- Modo de renderizado: Static site
- Content selector: `main`
- Metodo de busqueda: Hybrid search
- Fusion method: `rrf`
- Metadata schema recomendado: `title`, `description`, `image`

## Path filters

Como el sitemap ya esta curado, no es necesario usar reglas `include_items`. Usar estas exclusiones defensivas para evitar que herramientas internas, archivos de app o assets entren al indice si Cloudflare descubre rutas fuera del sitemap:

```json
{
  "exclude_items": [
    "**/evaluacion*",
    "**/anamnesis-adolescente*",
    "**/bitacora-tabaco*",
    "**/faro-terapeutico.vcf",
    "**/manifest.webmanifest",
    "**/images/**",
    "**/*.css",
    "**/*.js"
  ]
}
```

## Public endpoint

Activar primero solo despues de probar el indice en el playground.

- Hosts autorizados: `https://faroterapeutico.com`, `https://www.faroterapeutico.com`
- Host local para pruebas: `http://localhost:3000`
- Rate limit inicial sugerido: mantener el valor por defecto de Cloudflare y bajarlo si aparece abuso.
- Endpoints: empezar con `/search`; activar `/chat/completions` solo despues de revisar las respuestas.

## Prompt de generacion

```text
Eres el asistente de Faro Terapeutico, un equipo de psicologos clinicos en Providencia, Santiago de Chile. Responde en espanol de Chile, con tono claro, prudente y humano.

Usa exclusivamente el contenido recuperado desde el sitio. Si la informacion no aparece en los documentos recuperados, dilo claramente y sugiere contactar a Faro Terapeutico por WhatsApp.

No diagnostiques, no indiques tratamientos personalizados, no reemplaces una consulta clinica y no prometas cobertura, reembolso o plazos que dependan del plan de salud del paciente.

Cuando la pregunta sea sobre valores, Fonasa, Isapre, agenda, terapeutas, modalidad online/presencial, ubicacion, primera sesion, confidencialidad o politicas de cancelacion, responde de forma directa y enlaza o menciona la pagina mas relevante.

Si el usuario describe urgencia, riesgo suicida, peligro inmediato, descompensacion severa o violencia, recomienda buscar ayuda presencial inmediata, contactar redes cercanas y usar servicios de emergencia locales.

Mantén las respuestas breves. Si hay varias opciones, ordenalas desde la accion mas util para el paciente.
```

## Query rewriting prompt

```text
Reformula la pregunta del usuario para buscar dentro del sitio de Faro Terapeutico. Conserva nombres propios, Isapres, Fonasa, valores, modalidad, terapeutas, ubicacion y terminos clinicos. Agrega sinonimos chilenos utiles como psicologo, psicologa, terapia, psicoterapia, reembolso, copago, bono, presencial, online y Providencia. Devuelve solo la consulta optimizada.
```

## Consultas de prueba

Probar estas preguntas antes de mostrar cualquier componente publico:

- Cuanto cuesta una sesion con Fonasa?
- Atienden por Colmena y cuanto me reembolsan?
- Que psicologo ve ansiedad?
- Puedo atenderme online?
- Donde queda Faro Terapeutico?
- Como compro un bono Fonasa?
- Que pasa si cancelo una sesion?
- Mi hijo de 15 anos puede atenderse?
- Me siento en crisis, que hago?

## Integracion visual posterior

Cuando exista el endpoint publico, usar el snippet actualizado desde el dashboard de Cloudflare. La forma esperada sera similar a:

```html
<script
  type="module"
  src="https://<PUBLIC_ENDPOINT_ID>.search.ai.cloudflare.com/assets/v0.0.25/search-snippet.es.js"
></script>

<search-modal-snippet
  api-url="https://<PUBLIC_ENDPOINT_ID>.search.ai.cloudflare.com/"
  placeholder="Buscar en Faro Terapéutico"
  max-results="8"
></search-modal-snippet>
```

Preferencia de producto: partir con modal de busqueda, no con burbuja de chat. Es menos invasivo, mantiene la web elegante y permite medir calidad antes de convertirlo en asistente conversacional.

## Wrangler opcional

Si se configura por CLI, confirmar primero que la cuenta de Cloudflare tiene el dominio onboarded y que `wrangler` esta autenticado:

```powershell
npx wrangler ai-search create faro-terapeutico-site --type web-crawler --source faroterapeutico.com
npx wrangler ai-search stats faro-terapeutico-site
npx wrangler ai-search search faro-terapeutico-site --query "Cuanto cuesta una sesion con Fonasa?"
```

Para esta web, el dashboard es preferible en la primera configuracion porque permite revisar visualmente sitemap especifico, content selector, endpoints publicos, CORS y filtros.

## Fuentes oficiales

- https://developers.cloudflare.com/ai-search/get-started/
- https://developers.cloudflare.com/ai-search/configuration/data-source/website/
- https://developers.cloudflare.com/ai-search/configuration/indexing/path-filtering/
- https://developers.cloudflare.com/ai-search/concepts/search-modes/
- https://developers.cloudflare.com/ai-search/configuration/retrieval/public-endpoint/
- https://developers.cloudflare.com/ai-search/configuration/retrieval/embed-search-snippets/
