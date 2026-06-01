import { useState } from "react";
import { saveContact, getContact } from "../lib/storage";
import { extractStyle } from "../lib/ai";

export default function ContactDetail({ contact: initialContact, onBack, onGenerate, onUpdate }) {
  const [contact, setContact] = useState(initialContact);
  const [emailText, setEmailText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(contact.name);
  const [nameError, setNameError] = useState("");

  function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError("Name cannot be empty"); return; }
    const updated = { ...contact, name: trimmed };
    saveContact(updated);
    setContact(updated);
    onUpdate(updated);
    setEditingName(false);
    setNameError("");
  }

  function handleAddEmail() {
    const text = emailText.trim();
    if (!text) return;
    const updated = {
      ...contact,
      emails: [...contact.emails, { id: Math.random().toString(36).slice(2), text }],
    };
    saveContact(updated);
    setContact(updated);
    onUpdate(updated);
    setEmailText("");
    setAddingEmail(false);
  }

  function handleDeleteEmail(id) {
    const updated = {
      ...contact,
      emails: contact.emails.filter((e) => e.id !== id),
    };
    saveContact(updated);
    setContact(updated);
    onUpdate(updated);
  }

  async function handleAnalyze() {
    if (contact.emails.length < 3) {
      setAnalyzeError("Add at least 3 emails before analyzing.");
      return;
    }
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const { styleProfile, verbatimPhrases, doNotUse } = await extractStyle(
        contact.name,
        contact.emails
      );
      const updated = { ...contact, styleProfile, verbatimPhrases, doNotUse };
      saveContact(updated);
      setContact(updated);
      onUpdate(updated);
    } catch (err) {
      if (err.message === "INVALID_KEY") {
        setAnalyzeError("Invalid API key. Go to Settings to update it.");
      } else {
        setAnalyzeError("Something went wrong. Please try again.");
      }
    } finally {
      setAnalyzing(false);
    }
  }

  const previewText = (text) => {
    const lines = text.split("\n").filter((l) => l.trim()).slice(0, 2);
    const preview = lines.join(" ").slice(0, 80);
    return preview.length < text.trim().length ? preview + "..." : preview;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={onBack}>← Back</button>
          {editingName ? (
            <div className="row-actions">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setNameError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") { setEditingName(false); setNameInput(contact.name); } }}
                autoFocus
                style={{ fontSize: "18px", fontWeight: 600, width: "200px" }}
              />
              <button className="btn-primary" onClick={handleSaveName}>Save</button>
              <button className="btn-ghost" onClick={() => { setEditingName(false); setNameInput(contact.name); }}>Cancel</button>
              {nameError && <span className="field-error">{nameError}</span>}
            </div>
          ) : (
            <div className="row-actions">
              <h1>{contact.name}</h1>
              <button className="btn-ghost" onClick={() => { setEditingName(true); setNameInput(contact.name); }}>
                Rename
              </button>
            </div>
          )}
        </div>
        {contact.styleProfile && !editingName && (
          <button className="btn-primary" onClick={() => onGenerate(contact)}>
            Generate Email
          </button>
        )}
      </div>

      {/* Emails section */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2>Emails</h2>
            <p className="muted">{contact.emails.length} email{contact.emails.length !== 1 ? "s" : ""} uploaded</p>
          </div>
          <button className="btn-secondary" onClick={() => setAddingEmail(!addingEmail)}>
            {addingEmail ? "Cancel" : "Add Email"}
          </button>
        </div>

        {addingEmail && (
          <div className="add-email-box">
            <label>Paste email text</label>
            <p className="muted small">Paste the full email body. The app will use this to learn {contact.name}'s writing style.</p>
            <textarea
              placeholder="Paste email here..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={10}
              autoFocus
            />
            <div className="row-actions">
              <button className="btn-primary" onClick={handleAddEmail} disabled={!emailText.trim()}>
                Add Email
              </button>
              <button className="btn-ghost" onClick={() => { setAddingEmail(false); setEmailText(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {contact.emails.length === 0 && !addingEmail && (
          <div className="empty-state">
            <p>No emails added yet. Add emails written by {contact.name} to analyze their writing style.</p>
          </div>
        )}

        <div className="email-list">
          {contact.emails.map((e, i) => (
            <div key={e.id} className="email-item">
              <div className="email-item-left">
                <span className="email-number">{i + 1}</span>
                <span className="email-preview">{previewText(e.text)}</span>
              </div>
              <button
                className="btn-danger-ghost small"
                onClick={() => handleDeleteEmail(e.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Style Profile section */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2>Style Profile</h2>
            <p className="muted">
              {contact.styleProfile
                ? "Profile analyzed and ready"
                : contact.emails.length >= 3
                ? "Ready to analyze"
                : "Add at least 3 emails to analyze"}
            </p>
          </div>
          <div className="row-actions">
            {contact.styleProfile && (
              <button className="btn-ghost" onClick={() => setShowProfile(!showProfile)}>
                {showProfile ? "Hide Profile" : "View Profile"}
              </button>
            )}
            <button
              className="btn-secondary"
              onClick={handleAnalyze}
              disabled={analyzing || contact.emails.length < 3}
            >
              {analyzing ? "Analyzing..." : contact.styleProfile ? "Re-analyze" : "Analyze Style"}
            </button>
          </div>
        </div>

        {analyzeError && <p className="field-error">{analyzeError}</p>}

        {analyzing && (
          <div className="analyzing-state">
            <p>Analyzing {contact.name}'s writing style across {contact.emails.length} emails...</p>
            <p className="muted small">This takes 15–30 seconds.</p>
          </div>
        )}

        {showProfile && contact.styleProfile && (
          <div className="profile-box">
            <pre>{contact.styleProfile}</pre>

            {contact.verbatimPhrases?.length > 0 && (
              <>
                <h3>Phrases {contact.name} Uses</h3>
                <div className="phrase-list">
                  {contact.verbatimPhrases.map((p, i) => (
                    <span key={i} className="phrase-tag">"{p}"</span>
                  ))}
                </div>
              </>
            )}

            {contact.doNotUse?.length > 0 && (
              <>
                <h3>Phrases to Avoid</h3>
                <div className="phrase-list">
                  {contact.doNotUse.map((p, i) => (
                    <span key={i} className="phrase-tag avoid">"{p}"</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}