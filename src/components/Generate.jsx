import { useState, useRef } from "react";
import { generateEmail } from "../lib/ai";
import { clearApiKey } from "../lib/storage";

export default function Generate({ contact, onBack }) {
  const [mode, setMode] = useState("compose");
  const [receivedEmail, setReceivedEmail] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);

  async function handleGenerate() {
    if (!input.trim()) { setError("Enter a message first."); return; }
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const result = await generateEmail(contact, receivedEmail, input, mode);
      setOutput(result);
      setTimeout(() => outputRef.current?.focus(), 100);
    } catch (err) {
      if (err.message === "INVALID_KEY") {
        clearApiKey();
        setError("Invalid API key. Please update it in Settings.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    setLoading(true);
    setError("");
    try {
      const result = await generateEmail(contact, receivedEmail, input, mode);
      setOutput(result);
    } catch (err) {
      if (err.message === "INVALID_KEY") {
        setError("Invalid API key. Please update it in Settings.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="page generate-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={onBack}>← Back</button>
          <h1>Generate as {contact.name}</h1>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={mode === "compose" ? "mode-btn active" : "mode-btn"}
          onClick={() => { setMode("compose"); setInput(""); setOutput(""); setError(""); }}
        >
          Compose
        </button>
        <button
          className={mode === "convert" ? "mode-btn active" : "mode-btn"}
          onClick={() => { setMode("convert"); setInput(""); setOutput(""); setError(""); }}
        >
          Convert
        </button>
      </div>

      <p className="muted mode-desc">
        {mode === "compose"
          ? "Type what you want to say in plain words. The AI will rewrite it in " + contact.name + "'s style."
          : "Paste a fully written email. The AI will convert it to " + contact.name + "'s style while keeping the meaning identical."}
      </p>

      <div className="generate-layout">
        <div className="generate-left">
          {/* Received email context */}
          <div className="field">
            <label>
              Received Email <span className="optional">(optional — for context)</span>
            </label>
            <textarea
              placeholder="Paste the email you received here..."
              value={receivedEmail}
              onChange={(e) => setReceivedEmail(e.target.value)}
              rows={5}
            />
          </div>

          {/* Input */}
          <div className="field">
            <label>
              {mode === "compose" ? "What you want to say" : "Email to convert"}
            </label>
            <textarea
              placeholder={
                mode === "compose"
                  ? "e.g. Tell him we're still waiting on the numbers from finance. Once we have them we'll finish the proposal. Friday is possible but I don't want to promise anything yet."
                  : "Paste the email to convert..."
              }
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              rows={8}
            />
            {error && <span className="field-error">{error}</span>}
          </div>

          <button
            className="btn-primary full-width"
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Output */}
        <div className="generate-right">
          <div className="output-header">
            <label>Output</label>
            {output && (
              <div className="row-actions">
                <button className="btn-ghost small" onClick={handleRegenerate} disabled={loading}>
                  {loading ? "..." : "Regenerate"}
                </button>
                <button className="btn-secondary small" onClick={handleCopy}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <textarea
            ref={outputRef}
            className="output-area"
            placeholder={loading ? "Generating..." : "Output will appear here..."}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={18}
            readOnly={loading}
          />
          {output && (
            <p className="muted small">You can edit the output directly before copying.</p>
          )}
        </div>
      </div>
    </div>
  );
}
