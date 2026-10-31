# Passwise — Password Strength Analyzer

A small, responsive password strength analyzer and password generator that runs entirely in your browser.

## Features

- Estimates strength using password length, character variety, and a rough entropy calculation.
- Flags common passwords, repeated characters, and simple keyboard or number sequences.
- Gives actionable suggestions as you type.
- Generates strong random passwords with the browser's Web Crypto API (`crypto.getRandomValues`).
- Lets you choose password length and whether to include symbols.
- Provides show/hide and copy controls.
- Does not save or transmit the password you analyze. No account, backend, or dependencies required.

## Run it

Open `index.html` in a modern browser. For clipboard access and the Web Crypto API, a local development server is recommended:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## How the estimate works

This is an educational heuristic, not a formal password audit. The score estimates entropy from length and the character pools represented, then adjusts it for short length, low variety, predictable sequences, repeated patterns, and a small built-in list of common passwords. The entropy estimate assumes characters are independently chosen, which is often false for human-created passwords. It does not check leaked-password databases. Never enter a password that you currently use for a sensitive account into a tool you do not trust.

Generated passwords use unbiased index selection from Web Crypto random values. Save generated passwords in a reputable password manager and use a different password for each account.

## Project files

- `index.html` — app markup
- `styles.css` — layout and responsive styling
- `app.js` — local analyzer and secure generator

## License

MIT. See [LICENSE](LICENSE).
