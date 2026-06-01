export function buildExtractionPrompt(name, emails) {
  const emailBlock = emails
    .map((e, i) => `EMAIL ${i + 1}:\n${e.text}`)
    .join("\n\n---\n\n");

  return `You are analyzing the writing style of a person named ${name} based on their emails.

Study every email carefully. Your goal is to extract a precise, specific writing style profile that could be used to replicate how this person writes.

Extract the following. Be extremely specific. Quote directly from the emails. Do not generalize vaguely.

1. GREETINGS — exact words used, frequency of each. Does he skip greetings?
2. SIGN-OFFS — exact words and formatting. New line before name? Comma? No comma?
3. EMAIL LENGTH — typical sentence count and word count range
4. SENTENCE STRUCTURE — short? long? fragments? mixed? give examples
5. PARAGRAPH STRUCTURE — one block? line breaks between short sentences? bullet points?
6. PUNCTUATION HABITS — comma usage, ellipses, dashes, exclamation points. Quote examples.
7. CAPITALIZATION — any unusual habits, informal lowercase, emphasis patterns
8. CONTRACTIONS — I'll or I will, don't or do not, can't or cannot etc
9. VOCABULARY — simple everyday words or complex language? Give examples.
10. TONE — warm, cold, blunt, friendly, formal, casual. Quote examples from the text.
11. DIRECTNESS — does he get straight to the point or build up to it?
12. COMMON PHRASES — copy at least 15 phrases verbatim exactly as written
13. THINGS HE NEVER DOES — formal openers he avoids, words that never appear, structures he doesn't use
14. GRAMMAR HABITS — any informal grammar, run-ons, missing punctuation. Be specific.
15. UNIQUE QUIRKS — anything distinctive. Quote examples.

Return a detailed structured profile. Every observation must be specific and grounded in the actual emails. This profile will be used to replicate this person's writing style precisely.

EMAILS FROM ${name.toUpperCase()}:

${emailBlock}`;
}

export function buildPhrasesPrompt(name, emails) {
  const emailBlock = emails.map((e) => e.text).join("\n\n---\n\n");

  return `From these emails written by ${name}, extract phrases this person commonly uses.

Copy them exactly as written — do not paraphrase or clean them up.
Include filler phrases, openers, closers, transitions, and any recurring expressions.
Minimum 15 phrases.

Return only a JSON array of strings. No explanation. No markdown. No backticks. Just the raw JSON array.

Example format: ["sounds good", "let me know", "will do"]

EMAILS:

${emailBlock}`;
}

export function buildDoNotUsePrompt(name, emails) {
  const emailBlock = emails.map((e) => e.text).join("\n\n---\n\n");

  return `Based on these emails written by ${name}, list phrases and expressions this person clearly never uses.

Think about:
- Formal corporate openers they avoid
- Overly polished phrases that don't match their vocabulary
- Words or expressions that would sound out of character
- Anything that would make someone say "that doesn't sound like them"

Return only a JSON array of strings. No explanation. No markdown. No backticks. Just the raw JSON array.

Example format: ["I hope this email finds you well", "please advise", "per my last email"]

EMAILS:

${emailBlock}`;
}

export function buildGenerationPrompt(contact, receivedEmail, input, mode) {
  const emails = contact.emails.slice(-50)  // add this line
  const emailBlock = emails  // change contact.emails to emails
    .map((e, i) => `EMAIL ${i + 1}:\n${e.text}`)
    .join("\n\n---\n\n");

  const phrasesBlock =
    contact.verbatimPhrases && contact.verbatimPhrases.length > 0
      ? contact.verbatimPhrases.join("\n")
      : "None extracted yet";

  const doNotUseBlock =
    contact.doNotUse && contact.doNotUse.length > 0
      ? contact.doNotUse.join("\n")
      : "None extracted yet";

  const inputBlock =
    mode === "compose"
      ? `MESSAGE TO REWRITE IN ${contact.name.toUpperCase()}'S STYLE:\n${input}`
      : `EXISTING EMAIL TO CONVERT TO ${contact.name.toUpperCase()}'S STYLE:\n${input}`;

  return `You are a writing style translator. Your only job is to rewrite text in the exact writing style of ${contact.name}.

CRITICAL RULES — follow every single one:
- Preserve the meaning exactly. Every piece of information must remain in the output.
- Do NOT add any information that is not in the input.
- Do NOT remove any information from the input.
- Do NOT make the writing more professional, polished, or grammatically correct than ${contact.name}'s examples show.
- Do NOT fix grammar or punctuation if ${contact.name}'s natural style includes informal grammar.
- Do NOT add formal openers like "I hope this finds you well" unless they appear in the examples.
- Do NOT make any decisions about what should be said.
- Do NOT add bullet points unless the examples clearly show this person uses them.
- Copy quirks, fragments, and informal language exactly as shown in the examples.
- Match the typical email length shown in the examples.
- You are a translator. The style changes. The meaning never changes.

SIGN-OFF RULE — CRITICAL:
The examples contain ${contact.name}'s name and signature at the bottom of their emails. Do NOT copy their name, job title, or company into the output. The person sending this email is different from ${contact.name}. Only copy the sign-off style (e.g. "thanks", "best", "cheers") — then on the next line write exactly: [Your Name]

GREETING RULE — CRITICAL:
If the email starts with a greeting, write it in ${contact.name}'s natural greeting style but replace the recipient's name with exactly: [Contact's Name]
For example: "Hi [Contact's Name]," or "Hey [Contact's Name]," depending on how ${contact.name} naturally greets people in the examples.

CONTENT BLEED RULE — CRITICAL:
The example emails contain references to ${contact.name}'s own clients, colleagues, projects, and business context. Do NOT carry any of this content into the output. Only the writing style transfers — sentence structure, tone, vocabulary, punctuation habits. The actual people, companies, projects, and situations mentioned in the examples are irrelevant and must never appear in the output unless they were explicitly in the input message.

${contact.name.toUpperCase()}'S STYLE PROFILE:
${contact.styleProfile || "No profile extracted yet."}

PHRASES ${contact.name.toUpperCase()} ACTUALLY USES — use these when natural:
${phrasesBlock}

PHRASES TO NEVER USE:
${doNotUseBlock}

REAL EXAMPLES OF ${contact.name.toUpperCase()}'S WRITING — study STYLE only, not content:

${emailBlock}

${
  receivedEmail
    ? `RECEIVED EMAIL (context only — do not change the meaning of the reply based on this, only use it to understand the situation):
${receivedEmail}

`
    : ""
}${inputBlock}

Before writing your output, silently check:
- Does the length match ${contact.name}'s typical email length from the examples?
- Does it use his exact greeting and sign-off style (but NOT his name/title/company)?
- Does it contain ONLY information from the input above?
- Does it include any people, companies, or situations from the example emails that were NOT in the input? If yes, remove them.
- Does it avoid sounding more polished than his real examples?
- Did you avoid every phrase in the DO NOT USE list?
- Did you use his natural phrases where they fit?

If any check fails, rewrite before outputting.

Output only the final email. No explanation. No commentary. No subject line unless his examples always include one.`;
}