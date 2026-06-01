import { useState, useEffect } from "react";
import { getContacts, saveContact, generateId } from "../lib/storage";

export default function Contacts({ onOpen, onGenerate }) {
  const [contacts, setContacts] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  function handleCreate() {
    const name = newName.trim();
    if (!name) { setError("Enter a name"); return; }
    if (contacts.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError("A contact with that name already exists");
      return;
    }
    const contact = {
      id: generateId(),
      name,
      emails: [],
      styleProfile: null,
      verbatimPhrases: [],
      doNotUse: [],
      createdAt: new Date().toISOString(),
    };
    saveContact(contact);
    const updated = getContacts();
    setContacts(updated);
    setCreating(false);
    setNewName("");
    setError("");
    onOpen(contact);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    deleteContact(id);
    setContacts(getContacts());
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Contacts</h1>
        <button className="btn-primary" onClick={() => { setCreating(true); setNewName(""); setError(""); }}>
          New Contact
        </button>
      </div>

      {creating && (
        <div className="create-box">
          <div className="field">
            <label>Contact Name</label>
            <input
              type="text"
              placeholder="e.g. Jayson"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              autoFocus
            />
            {error && <span className="field-error">{error}</span>}
          </div>
          <div className="row-actions">
            <button className="btn-primary" onClick={handleCreate}>Create</button>
            <button className="btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </div>
      )}

      {contacts.length === 0 && !creating && (
        <div className="empty-state">
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--black)", marginBottom: "8px" }}>
            Add a contact to get started
          </p>
          <p>Upload their emails and the AI will learn exactly how they write.</p>
        </div>
      )}

      <div className="contact-list">
        {contacts.map((c) => (
          <div key={c.id} className="contact-row" onClick={() => onOpen(c)}>
            <div className="contact-row-left">
              <span className="contact-avatar">{c.name[0].toUpperCase()}</span>
              <div>
                <span className="contact-name">{c.name}</span>
                <span className="contact-meta">
                  {c.emails.length} email{c.emails.length !== 1 ? "s" : ""}
                  {c.styleProfile ? " · Profile ready" : c.emails.length > 0 ? " · Profile not analyzed" : ""}
                </span>
              </div>
            </div>
            <div className="contact-row-right">
              {c.styleProfile && (
                <button
                  className="btn-secondary"
                  onClick={(e) => { e.stopPropagation(); onGenerate(c); }}
                >
                  Generate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
