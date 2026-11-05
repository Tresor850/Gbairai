const DEVICE_STORAGE_KEY = 'gbairai_device_id';

/**
 * Generates an RFC4122 version 4 compliant UUID.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback if crypto.randomUUID is not supported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves or initializes the persistent anonymous device ID.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '00000000-0000-0000-0000-000000000000';
  }

  let deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);

  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Explicitly reset device ID (e.g., if user wants to reset their local identity).
 */
export function resetDeviceId(): string {
  if (typeof window === 'undefined') return '';
  const newId = generateUUID();
  localStorage.setItem(DEVICE_STORAGE_KEY, newId);
  return newId;
}

