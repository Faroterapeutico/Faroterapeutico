/**
 * Faro Terapéutico — receptor privado de evaluaciones clínicas.
 *
 * Este archivo se despliega como un proyecto independiente de Google Apps Script.
 * Propiedades requeridas del script:
 *   ASSESSMENT_WEBHOOK_TOKEN  Token compartido con el Worker del sitio.
 *   ASSESSMENT_RECIPIENT      Destinatario clínico (por defecto psicologo.aams@gmail.com).
 */

const DEFAULT_ASSESSMENT_RECIPIENT = "psicologo.aams@gmail.com";

function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : "";
    if (!rawBody || rawBody.length > 120000) throw new Error("Solicitud no válida.");

    const payload = JSON.parse(rawBody);
    const properties = PropertiesService.getScriptProperties();
    const expectedToken = String(properties.getProperty("ASSESSMENT_WEBHOOK_TOKEN") || "");
    const suppliedToken = String(payload.token || "");
    if (expectedToken.length < 24 || !constantTimeEqual_(suppliedToken, expectedToken)) {
      return json_({ ok: false, message: "No autorizado." });
    }

    const configuredRecipient = clean_(properties.getProperty("ASSESSMENT_RECIPIENT"));
    const recipient = isValidEmail_(configuredRecipient) ? configuredRecipient : DEFAULT_ASSESSMENT_RECIPIENT;
    const subject = clean_(payload.subject).slice(0, 180);
    const textBody = String(payload.textBody || "").slice(0, 100000);
    const htmlBody = String(payload.htmlBody || "").slice(0, 100000);
    if (!subject || !textBody || !htmlBody) throw new Error("El correo está incompleto.");

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        body: textBody,
        htmlBody: htmlBody,
        name: "Faro Terapéutico · Evaluaciones clínicas"
      });
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    console.error("No se pudo enviar la evaluación clínica: " + publicError_(error));
    return json_({ ok: false, message: "No se pudo procesar el envío." });
  }
}

function authorizeClinicalAssessmentEmail() {
  return MailApp.getRemainingDailyQuota();
}

function constantTimeEqual_(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

function clean_(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function publicError_(error) {
  const message = error && error.message ? error.message : "Error desconocido";
  return String(message).replace(/[A-Za-z0-9_-]{24,}/g, "[dato protegido]");
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
