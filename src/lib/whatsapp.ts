/**
 * Utility functions for WhatsApp and Email communication
 */

/**
 * Converts Brazilian phone format "(81) 98594-2139" to WhatsApp format "5581985942139"
 */
export function formatPhoneForWhatsApp(telefone: string): string {
  if (!telefone || typeof telefone !== 'string') {
    throw new Error('Telefone inválido');
  }
  const digitsOnly = telefone.replace(/\D/g, '');
  if (digitsOnly.length !== 11) {
    throw new Error(`Formato de telefone inválido: ${telefone}`);
  }
  return `55${digitsOnly}`;
}

/**
 * Detects if the user is on desktop or mobile
 */
export function detectPlatform(): 'desktop' | 'mobile' {
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua) || /iPad|iPhone|iPod/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Returns a greeting based on the current time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Opens WhatsApp with a pre-filled message, adapting URL to platform
 */
export function openWhatsApp(phone: string, message: string): void {
  const encoded = encodeURIComponent(message);
  const platform = detectPlatform();
  const baseUrl = platform === 'desktop'
    ? 'https://web.whatsapp.com/send'
    : 'https://api.whatsapp.com/send';
  const url = `${baseUrl}?phone=${phone}&text=${encoded}`;
  window.open(url, '_blank');
}

/**
 * Opens the default email client with a pre-filled message
 */
export function openEmail(email: string, subject: string, body: string): void {
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

/**
 * Formats a number to Brazilian format without currency symbol (e.g., 1.500,00)
 */
export function formatValueBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
