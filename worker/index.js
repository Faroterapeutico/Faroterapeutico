const extensionPattern = /\.[a-z0-9]+$/i;
const assessmentPaths = new Set(["/evaluacion-clinica", "/evaluacion-clinica.html"]);
const assessmentRecipient = "psicologo.aams@gmail.com";
const assessmentCookie = "ft_clinical_access";
const maxAssessmentBodyBytes = 32_000;

const ASRS = {
  name: "ASRS-v1.1 (6 preguntas) · TDAH en adultos",
  questions: [
    "¿Con qué frecuencia tiene usted dificultad para acabar los detalles finales de un proyecto, una vez que ha terminado con las partes difíciles?",
    "¿Con qué frecuencia tiene usted dificultad para ordenar las cosas cuando está realizando una tarea que requiere organización?",
    "¿Con qué frecuencia tiene usted problemas para recordar citas u obligaciones?",
    "Cuando tiene que realizar una tarea que requiere pensar mucho, ¿con qué frecuencia evita o retrasa empezarla?",
    "¿Con qué frecuencia mueve continuamente o retuerce las manos o los pies cuando tiene que permanecer sentado por mucho tiempo?",
    "¿Con qué frecuencia se siente demasiado activo e impulsado a hacer cosas, como si lo empujase un motor?"
  ],
  ids: ["asrs1", "asrs2", "asrs3", "asrs4", "asrs5", "asrs6"],
  labels: ["Nunca", "Rara vez", "A veces", "A menudo", "Muy a menudo"],
  originalThresholds: [2, 3, 2, 3, 3, 2]
};

const PHQA = {
  name: "PHQ-9 modificado para adolescentes (PHQ-A)",
  questions: [
    "¿Se ha sentido deprimido, irritable o sin esperanza?",
    "¿Ha tenido poco interés o placer al hacer cosas?",
    "¿Ha tenido dificultad para dormirse, permanecer dormido o ha dormido demasiado?",
    "¿Ha tenido poco apetito, pérdida de peso o ha comido demasiado?",
    "¿Se ha sentido cansado o con poca energía?",
    "¿Se ha sentido mal consigo mismo, como si fuera un fracaso o como si se hubiera fallado a sí mismo o a su familia?",
    "¿Ha tenido problemas para concentrarse en cosas como tareas escolares, leer o ver televisión?",
    "¿Se ha movido o hablado tan lentamente que otras personas podrían haberlo notado? O, por el contrario, ¿ha estado tan inquieto que se mueve más de lo habitual?",
    "¿Ha tenido pensamientos de que estaría mejor muerto o de hacerse daño de alguna manera?",
    "Durante el último año, ¿se ha sentido deprimido o triste la mayoría de los días, incluso si algunas veces se sentía bien?",
    "Si ha tenido alguno de estos problemas, ¿qué tan difícil le han hecho realizar sus tareas, encargarse de las cosas en casa o relacionarse con otras personas?",
    "Durante el último mes, ¿hubo algún momento en que pensó seriamente en terminar con su vida?",
    "¿Alguna vez intentó matarse o intentó suicidarse?"
  ],
  ids: ["phq1", "phq2", "phq3", "phq4", "phq5", "phq6", "phq7", "phq8", "phq9", "phq10", "phq11", "phq12", "phq13"],
  frequencyLabels: ["En ningún momento", "Varios días", "Más de la mitad de los días", "Casi todos los días"],
  impactLabels: {
    nada: "Nada difícil",
    algo: "Un poco difícil",
    muy: "Muy difícil",
    extremo: "Sumamente difícil"
  },
  yesNoLabels: { no: "No", si: "Sí" }
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

function textResponse(message, status = 404) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      "Referrer-Policy": "no-referrer"
    }
  });
}

function addClinicalPageHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function fetchAsset(request, env, pathname) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  return env.ASSETS.fetch(new Request(assetUrl, request));
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function calculateAge(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const birth = new Date(`${dateString}T12:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDifference = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDifference < 0 || (monthDifference === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }
  return "";
}

async function hashAccessToken(secret) {
  const bytes = new TextEncoder().encode(`faro-clinical-access:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}

async function hasAssessmentAccess(request, env) {
  const secret = String(env.ASSESSMENT_ACCESS_TOKEN || "");
  if (secret.length < 16) return false;
  const expectedCookie = await hashAccessToken(secret);
  return constantTimeEqual(getCookie(request, assessmentCookie), expectedCookie);
}

async function handleClinicalPage(request, env, url) {
  const secret = String(env.ASSESSMENT_ACCESS_TOKEN || "");
  if (secret.length < 16) return textResponse("Evaluación temporalmente no disponible.", 503);

  const suppliedToken = url.searchParams.get("access") || "";
  if (suppliedToken && constantTimeEqual(suppliedToken, secret)) {
    const cookieValue = await hashAccessToken(secret);
    const cleanUrl = new URL(url);
    cleanUrl.pathname = "/evaluacion-clinica";
    cleanUrl.searchParams.delete("access");
    return new Response(null, {
      status: 303,
      headers: {
        Location: cleanUrl.toString(),
        "Set-Cookie": `${assessmentCookie}=${encodeURIComponent(cookieValue)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Strict`,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet"
      }
    });
  }

  if (!(await hasAssessmentAccess(request, env))) return textResponse("Página no encontrada.", 404);
  const pageResponse = await fetchAsset(request, env, "/evaluacion-clinica.html");
  return addClinicalPageHeaders(pageResponse);
}

function validateSameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

function getIntegerAnswer(answers, id, minimum, maximum) {
  const value = answers && answers[id];
  if (!Number.isInteger(value) || value < minimum || value > maximum) throw new Error(`Respuesta inválida: ${id}`);
  return value;
}

function getChoiceAnswer(answers, id, allowed) {
  const value = answers && answers[id];
  if (!allowed.includes(value)) throw new Error(`Respuesta inválida: ${id}`);
  return value;
}

function scoreAsrs(answers) {
  const values = ASRS.ids.map((id) => getIntegerAnswer(answers, id, 0, 4));
  const score24 = values.reduce((total, value) => total + value, 0);
  const shadedCount = values.reduce((total, value, index) => total + Number(value >= ASRS.originalThresholds[index]), 0);
  let rangeLabel = "Intervalo negativo bajo";
  if (score24 >= 18) rangeLabel = "Intervalo positivo alto";
  else if (score24 >= 14) rangeLabel = "Intervalo positivo bajo";
  else if (score24 >= 10) rangeLabel = "Intervalo negativo alto";
  return {
    instrument: "asrs",
    score24,
    rangeLabel,
    updatedPositive: score24 >= 14,
    shadedCount,
    originalPositive: shadedCount >= 4,
    riskFlag: false,
    values
  };
}

function scorePhqa(answers) {
  const values = PHQA.ids.slice(0, 9).map((id) => getIntegerAnswer(answers, id, 0, 3));
  const pastYear = getChoiceAnswer(answers, "phq10", ["no", "si"]);
  const impairment = getChoiceAnswer(answers, "phq11", ["nada", "algo", "muy", "extremo"]);
  const seriousThoughtLastMonth = getChoiceAnswer(answers, "phq12", ["no", "si"]);
  const lifetimeAttempt = getChoiceAnswer(answers, "phq13", ["no", "si"]);
  const total = values.reduce((sum, value) => sum + value, 0);
  let severityLabel = "Síntomas ausentes o mínimos";
  if (total >= 20) severityLabel = "Síntomas graves";
  else if (total >= 15) severityLabel = "Síntomas moderadamente graves";
  else if (total >= 10) severityLabel = "Síntomas moderados";
  else if (total >= 5) severityLabel = "Síntomas leves";

  const positiveSymptoms = values.slice(0, 8).filter((value) => value >= 2).length + Number(values[8] >= 1);
  const mddAidPattern = (values[0] >= 2 || values[1] >= 2)
    && positiveSymptoms >= 5
    && impairment !== "nada";
  const currentRiskFlag = values[8] >= 1 || seriousThoughtLastMonth === "si";
  const historyRiskFlag = lifetimeAttempt === "si";

  return {
    instrument: "phqa",
    total,
    severityLabel,
    positiveSymptoms,
    mddAidPattern,
    pastYear,
    impairment,
    seriousThoughtLastMonth,
    lifetimeAttempt,
    currentRiskFlag,
    historyRiskFlag,
    riskFlag: currentRiskFlag || historyRiskFlag,
    values
  };
}

function answerRows(instrument, answers) {
  if (instrument === "asrs") {
    return ASRS.questions.map((question, index) => ({
      number: index + 1,
      question,
      answer: ASRS.labels[answers[ASRS.ids[index]]],
      score: answers[ASRS.ids[index]],
      keyResponse: answers[ASRS.ids[index]] >= ASRS.originalThresholds[index]
    }));
  }

  return PHQA.questions.map((question, index) => {
    const id = PHQA.ids[index];
    const value = answers[id];
    let answer = "";
    let score = "No puntúa";
    if (index <= 8) {
      answer = PHQA.frequencyLabels[value];
      score = value;
    } else if (id === "phq11") {
      answer = PHQA.impactLabels[value];
    } else {
      answer = PHQA.yesNoLabels[value];
    }
    return { number: index + 1, question, answer, score, keyResponse: false };
  });
}

function formatSantiagoDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

function buildAssessmentEmail(record) {
  const { instrument, patient, answers, result } = record;
  const instrumentName = instrument === "asrs" ? ASRS.name : PHQA.name;
  const rows = answerRows(instrument, answers);
  const alertLabel = result.riskFlag ? " · ALERTA DE SEGURIDAD" : "";
  const subject = `[Evaluación clínica] ${instrument === "asrs" ? "ASRS-v1.1" : "PHQ-A"} · ${patient.name}${alertLabel}`;
  const scoreLines = instrument === "asrs"
    ? [
        `Puntaje actualizado: ${result.score24}/24 (${result.rangeLabel})`,
        `Regla clínica original: ${result.shadedCount}/6 respuestas sombreadas (${result.originalPositive ? "positiva" : "negativa"}; corte 4)`
      ]
    : [
        `Puntaje PHQ-A: ${result.total}/27 (${result.severityLabel})`,
        `Síntomas positivos para ayuda diagnóstica: ${result.positiveSymptoms}/9`,
        `Patrón de ayuda diagnóstica para TDM: ${result.mddAidPattern ? "Sí" : "No"}`,
        `Ánimo depresivo la mayoría de los días del último año: ${PHQA.yesNoLabels[result.pastYear]}`,
        `Dificultad funcional: ${PHQA.impactLabels[result.impairment]}`,
        `Alerta actual/último mes: ${result.currentRiskFlag ? "SÍ — requiere entrevista clínica" : "No"}`,
        `Antecedente de intento a lo largo de la vida: ${result.historyRiskFlag ? "SÍ — requiere entrevista clínica" : "No"}`
      ];

  const textRows = rows.map((row) => [
    `${row.number}. ${row.question}`,
    `   Respuesta: ${row.answer}${row.score === "No puntúa" ? "" : ` (puntaje ${row.score})`}${row.keyResponse ? " [RESPUESTA CLAVE ASRS]" : ""}`
  ].join("\n")).join("\n\n");

  const textBody = [
    "EVALUACIÓN CLÍNICA RECIBIDA",
    result.riskFlag ? "*** ALERTA: revisar preguntas de seguridad y realizar seguimiento clínico ***" : "",
    "",
    `Instrumento: ${instrumentName}`,
    `Paciente: ${patient.name}`,
    `Fecha de nacimiento: ${patient.birthDate} (${patient.age} años)`,
    `Código/iniciales: ${patient.patientCode || "No informado"}`,
    `Contacto: ${patient.contact || "No informado"}`,
    `Fecha de envío: ${formatSantiagoDate()}`,
    "",
    "RESULTADO",
    ...scoreLines,
    "",
    "RESPUESTAS DEL PACIENTE",
    textRows,
    "",
    "IMPORTANTE",
    "El resultado corresponde a un tamizaje y no constituye por sí solo un diagnóstico. Las respuestas de seguridad positivas requieren entrevista clínica."
  ].filter((line, index, list) => line !== "" || list[index - 1] !== "").join("\n");

  const htmlRows = rows.map((row) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e1ddd6;vertical-align:top;color:#5b625f;width:42px;">${row.number}</td>
      <td style="padding:12px;border-bottom:1px solid #e1ddd6;vertical-align:top;">
        <div style="margin-bottom:6px;color:#202826;font-weight:600;">${escapeHtml(row.question)}</div>
        <div style="color:${row.keyResponse ? "#8c2f2a" : "#4b5a55"};"><strong>Respuesta:</strong> ${escapeHtml(row.answer)}${row.score === "No puntúa" ? "" : ` · ${row.score} punto${row.score === 1 ? "" : "s"}`}${row.keyResponse ? " · respuesta clave ASRS" : ""}</div>
      </td>
    </tr>
  `).join("");
  const scoreHtml = scoreLines.map((line) => `<li style="margin:6px 0;">${escapeHtml(line)}</li>`).join("");
  const riskHtml = result.riskFlag
    ? '<div style="margin:0 0 18px;padding:16px;border:1px solid #e3a5a0;border-radius:12px;background:#fff0ee;color:#7b2621;font-weight:700;">ALERTA: hay al menos una respuesta de seguridad positiva. Revisar el detalle y realizar seguimiento mediante entrevista clínica.</div>'
    : "";
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:760px;margin:0 auto;color:#202826;line-height:1.55;">
      <h1 style="margin:0 0 6px;font-size:24px;color:#6f4325;">Evaluación clínica recibida</h1>
      <p style="margin:0 0 20px;color:#59625f;">${escapeHtml(instrumentName)}</p>
      ${riskHtml}
      <table style="width:100%;margin-bottom:18px;border-collapse:collapse;border:1px solid #e1ddd6;border-radius:12px;">
        <tr><th style="padding:9px 12px;text-align:left;background:#f6f1e9;">Paciente</th><td style="padding:9px 12px;">${escapeHtml(patient.name)}</td></tr>
        <tr><th style="padding:9px 12px;text-align:left;background:#f6f1e9;">Nacimiento</th><td style="padding:9px 12px;">${escapeHtml(patient.birthDate)} · ${patient.age} años</td></tr>
        <tr><th style="padding:9px 12px;text-align:left;background:#f6f1e9;">Código</th><td style="padding:9px 12px;">${escapeHtml(patient.patientCode || "No informado")}</td></tr>
        <tr><th style="padding:9px 12px;text-align:left;background:#f6f1e9;">Contacto</th><td style="padding:9px 12px;">${escapeHtml(patient.contact || "No informado")}</td></tr>
        <tr><th style="padding:9px 12px;text-align:left;background:#f6f1e9;">Envío</th><td style="padding:9px 12px;">${escapeHtml(formatSantiagoDate())}</td></tr>
      </table>
      <div style="margin-bottom:20px;padding:16px;border-radius:12px;background:#e4efeb;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#36594f;">Resultado automático</h2>
        <ul style="margin:0;padding-left:20px;">${scoreHtml}</ul>
      </div>
      <h2 style="margin:0 0 10px;font-size:19px;">Respuestas del paciente</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e1ddd6;">${htmlRows}</table>
      <p style="margin:18px 0 0;color:#59625f;font-size:12px;">Este resultado es un tamizaje y no constituye por sí solo un diagnóstico. Las respuestas de seguridad positivas requieren entrevista clínica.</p>
    </div>
  `;
  return { subject, textBody, htmlBody };
}

async function sendAssessmentEmail(env, email) {
  const webhookUrl = String(env.ASSESSMENT_WEBHOOK_URL || "");
  const webhookToken = String(env.ASSESSMENT_WEBHOOK_TOKEN || "");
  if (webhookUrl && webhookToken) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: webhookToken,
        recipient: assessmentRecipient,
        subject: email.subject,
        textBody: email.textBody,
        htmlBody: email.htmlBody
      }),
      redirect: "follow"
    });
    const responseText = await response.text();
    let responseData = {};
    try { responseData = JSON.parse(responseText); } catch { responseData = {}; }
    if (!response.ok || responseData.ok !== true) throw new Error("El servicio de correo no confirmó la entrega.");
    return;
  }

  const resendKey = String(env.RESEND_API_KEY || "");
  const resendFrom = String(env.ASSESSMENT_EMAIL_FROM || "");
  if (resendKey && resendFrom) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: resendFrom,
        to: [assessmentRecipient],
        subject: email.subject,
        text: email.textBody,
        html: email.htmlBody
      })
    });
    if (!response.ok) throw new Error("El servicio de correo no confirmó la entrega.");
    return;
  }

  throw new Error("El envío de correo todavía no está configurado.");
}

async function handleAssessmentSubmission(request, env) {
  if (!validateSameOrigin(request)) return jsonResponse({ ok: false, message: "Solicitud no autorizada." }, 403);
  if (!(await hasAssessmentAccess(request, env))) return jsonResponse({ ok: false, message: "La invitación no es válida o expiró." }, 403);
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) return jsonResponse({ ok: false, message: "Formato de solicitud no válido." }, 415);
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > maxAssessmentBodyBytes) return jsonResponse({ ok: false, message: "La solicitud es demasiado grande." }, 413);

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > maxAssessmentBodyBytes) throw new Error("La solicitud es demasiado grande.");
    const payload = JSON.parse(rawBody);
    if (payload.consent !== true) throw new Error("Falta la autorización de envío.");
    if (!["asrs", "phqa"].includes(payload.instrument)) throw new Error("Instrumento no válido.");

    const name = cleanText(payload.patient && payload.patient.name, 100);
    const birthDate = cleanText(payload.patient && payload.patient.birthDate, 10);
    const patientCode = cleanText(payload.patient && payload.patient.patientCode, 30);
    const contact = cleanText(payload.patient && payload.patient.contact, 120);
    const age = calculateAge(birthDate);
    if (name.length < 3 || age === null || age < 0 || age > 110) throw new Error("Los datos de identificación no son válidos.");
    if (payload.instrument === "asrs" && age < 18) throw new Error("El ASRS-v1.1 de esta página requiere 18 años o más.");
    if (payload.instrument === "phqa" && (age < 12 || age > 17)) throw new Error("El PHQ-A de esta página requiere una edad de 12 a 17 años.");

    const duration = Number(payload.submittedAt) - Number(payload.startedAt);
    if (!Number.isFinite(duration) || duration < 3000) throw new Error("La evaluación se envió demasiado rápido. Revisa tus respuestas e inténtalo de nuevo.");

    const result = payload.instrument === "asrs" ? scoreAsrs(payload.answers) : scorePhqa(payload.answers);
    const patient = { name, birthDate, patientCode, contact, age };
    const email = buildAssessmentEmail({ instrument: payload.instrument, patient, answers: payload.answers, result });
    await sendAssessmentEmail(env, email);
    return jsonResponse({ ok: true, result });
  } catch (error) {
    const message = error instanceof SyntaxError
      ? "No se pudieron leer las respuestas. Inténtalo nuevamente."
      : cleanText(error && error.message ? error.message : "No se pudo enviar la evaluación.", 220);
    const status = /correo|entrega|configurado/i.test(message) ? 502 : 400;
    return jsonResponse({ ok: false, message }, status);
  }
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (assessmentPaths.has(url.pathname) && (request.method === "GET" || request.method === "HEAD")) {
      return handleClinicalPage(request, env, url);
    }

    if (url.pathname === "/api/evaluacion-clinica") {
      if (request.method !== "POST") return jsonResponse({ ok: false, message: "Método no permitido." }, 405, { Allow: "POST" });
      return handleAssessmentSubmission(request, env);
    }

    let response = await env.ASSETS.fetch(request);

    if (response.status !== 404) return response;
    if (url.pathname === "/") return fetchAsset(request, env, "/index.html");

    if (url.pathname.endsWith("/")) {
      response = await fetchAsset(request, env, `${url.pathname}index.html`);
    } else if (!extensionPattern.test(url.pathname)) {
      response = await fetchAsset(request, env, `${url.pathname}.html`);
    }

    return response;
  }
};

export { buildAssessmentEmail, scoreAsrs, scorePhqa };
export default worker;
