import { useState, useEffect } from "react";
import { hasApiKey } from "./lib/storage";
import Settings from "./components/Settings";
import Contacts from "./components/Contacts";
import ContactDetail from "./components/ContactDetail";
import Generate from "./components/Generate";

export default function App() {
  const [ready, setReady] = useState(hasApiKey());
  const [view, setView] = useState("contacts"); // contacts | contact | generate | settings
  const [selectedContact, setSelectedContact] = useState(null);

  function openContact(contact) {
    setSelectedContact(contact);
    setView("contact");
  }

  function openGenerate(contact) {
    setSelectedContact(contact);
    setView("generate");
  }

  function goBack() {
    setView("contacts");
    setSelectedContact(null);
  }

  if (!ready) {
    return <Settings onSave={() => setReady(true)} firstTime />;
  }

  return (
    <div className="app">
      <header>
        <div className="header-inner">
          <span className="logo" onClick={goBack} style={{ cursor: "pointer" }}>
            StyleMail
          </span>
          <nav>
            <button
              className={view === "contacts" || view === "contact" ? "nav-active" : ""}
              onClick={goBack}
            >
              Contacts
            </button>
            <button
              className={view === "settings" ? "nav-active" : ""}
              onClick={() => setView("settings")}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      <main>
        {view === "contacts" && (
          <Contacts onOpen={openContact} onGenerate={openGenerate} />
        )}
        {view === "contact" && (
          <ContactDetail
            contact={selectedContact}
            onBack={goBack}
            onGenerate={openGenerate}
            onUpdate={(c) => setSelectedContact(c)}
          />
        )}
        {view === "generate" && (
          <Generate contact={selectedContact} onBack={() => setView("contact")} />
        )}
        {view === "settings" && (
          <Settings onSave={() => setView("contacts")} />
        )}
      </main>
    </div>
  );
}
