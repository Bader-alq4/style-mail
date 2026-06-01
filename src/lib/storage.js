const APP_KEY = "stylemail_data";
const API_KEY = "stylemail_apikey";

export function hasApiKey() {
  return !!localStorage.getItem(API_KEY);
}

export function getApiKey() {
  return localStorage.getItem(API_KEY) || "";
}

export function saveApiKey(key) {
  localStorage.setItem(API_KEY, key);
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY);
}

function loadData() {
  try {
    const raw = localStorage.getItem(APP_KEY);
    return raw ? JSON.parse(raw) : { contacts: [] };
  } catch {
    return { contacts: [] };
  }
}

function saveData(data) {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

export function getContacts() {
  return loadData().contacts;
}

export function getContact(id) {
  return loadData().contacts.find((c) => c.id === id) || null;
}

export function saveContact(contact) {
  const data = loadData();
  const idx = data.contacts.findIndex((c) => c.id === contact.id);
  if (idx >= 0) {
    data.contacts[idx] = contact;
  } else {
    data.contacts.push(contact);
  }
  saveData(data);
}

export function deleteContact(id) {
  const data = loadData();
  data.contacts = data.contacts.filter((c) => c.id !== id);
  saveData(data);
}

export function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
