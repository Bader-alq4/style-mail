import { useState } from "react";
import { saveApiKey, getApiKey, clearApiKey } from "../lib/storage";

export default function Settings({ onSave, firstTime }) {
  const [key, setKey] = useState(getApiKey());
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-")) {
      setError("That doesn't look like a valid OpenAI API key. It should start with sk-");
      return;
    }
    saveApiKey(trimmed);
    setError("");
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSave();
    }, 800);
  }

  function handleClear() {
    clearApiKey();
    setKey("");
  }

  return (
    <div className="settings-page">
      <div className="settings-box">
        {firstTime ? (
          <>
            <h1>Welcome to StyleMail</h1>
            <p className="muted">Enter your OpenAI API key to get started. It is saved only on this device and never sent anywhere else.</p>
          </>
        ) : (
          <>
            <h1>Settings</h1>
            <p className="muted">Manage your OpenAI API key.</p>
          </>
        )}

        <div className="field">
          <label>OpenAI API Key</label>
          <input
            type="password"
            placeholder="sk-..."
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
        </div>

        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSave}>
            {saved ? "Saved" : firstTime ? "Get Started" : "Save Key"}
          </button>
          {!firstTime && (
            <button className="btn-ghost" onClick={handleClear}>
              Clear Key
            </button>
          )}
        </div>

        <p className="muted small">
          Your key is stored in your browser's local storage. It never leaves your device except to make requests directly to OpenAI.
        </p>
      </div>
    </div>
  );
}
