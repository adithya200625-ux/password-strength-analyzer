const passwordInput = document.querySelector('#password');
const toggleButton = document.querySelector('#toggle-visibility');
const clearButton = document.querySelector('#clear-password');
const meterFill = document.querySelector('#meter-fill');
const strengthLabel = document.querySelector('#strength-label');
const scoreValue = document.querySelector('#score-value');
const scoreFill = document.querySelector('#score-fill');
const scoreCaption = document.querySelector('#score-caption');
const feedback = document.querySelector('#feedback');
const checksList = document.querySelector('#checks-list');
const lengthRange = document.querySelector('#length-range');
const lengthValue = document.querySelector('#length-value');
const symbolCheckbox = document.querySelector('#include-symbols');
const suggestionWrap = document.querySelector('#suggestion-wrap');
const suggestion = document.querySelector('#suggestion');
const copyButton = document.querySelector('#copy-button');
const copyStatus = document.querySelector('#copy-status');

const commonPasswords = new Set([
  'password', 'password1', '123456', '123456789', '12345678', 'qwerty', 'qwerty123',
  'abc123', '111111', 'iloveyou', 'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  'football', 'baseball', 'sunshine', 'passw0rd', 'p@ssw0rd', 'admin123'
]);
const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function analyze(password) {
  const length = password.length;
  if (!length) return { score: 0, level: '—', checks: {}, tips: [], entropy: 0 };
  const classes = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const pool = (classes[0] ? 26 : 0) + (classes[1] ? 26 : 0) + (classes[2] ? 10 : 0) + (classes[3] ? 33 : 0);
  const entropy = length * Math.log2(Math.max(pool, 1));
  const normalized = password.toLowerCase();
  const repeated = /(.)\1{2,}/i.test(password) || /(.{2,})\1{1,}/i.test(password);
  const sequence = sequences.some(seq => {
    const s = seq + seq.split('').reverse().join('');
    for (let i = 0; i <= s.length - 4; i++) if (normalized.includes(s.slice(i, i + 4))) return true;
    return false;
  });
  const common = commonPasswords.has(normalized.trim());
  const unique = !repeated && !sequence;
  const variety = classes.filter(Boolean).length >= 3 || (length >= 16 && classes.filter(Boolean).length >= 2);
  const longEnough = length >= 12;
  let score = Math.min(100, Math.round(entropy * 1.25));
  if (length < 8) score = Math.min(score, 25);
  else if (length < 12) score = Math.min(score, 49);
  if (!variety) score -= 12;
  if (!unique) score -= 24;
  if (common) score = Math.min(score, 8);
  score = Math.max(0, score);
  let level = score < 25 ? 'WEAK' : score < 50 ? 'FAIR' : score < 75 ? 'GOOD' : 'STRONG';
  const tips = [];
  if (!longEnough) tips.push('Use at least 12 characters; length is one of the biggest improvements you can make.');
  if (!variety) tips.push('Add another character type, or use a longer passphrase made from unrelated words.');
  if (!unique) tips.push('Avoid repeated characters and easy keyboard or number sequences.');
  if (common) tips.push('This matches a commonly used password. Choose something less predictable.');
  if (longEnough && variety && unique && !common) tips.push('Nice work. Keep it unique to this account and store it in a password manager.');
  return { score, level, checks: { length: longEnough, variety, unique, common: !common }, tips, entropy: Math.round(entropy) };
}

function render() {
  const result = analyze(passwordInput.value);
  const colors = { WEAK: '#c75f53', FAIR: '#c79543', GOOD: '#5e9b66', STRONG: '#28745b', '—': '#9daaa3' };
  const color = colors[result.level];
  meterFill.style.width = passwordInput.value ? `${Math.max(5, result.score)}%` : '0%';
  meterFill.style.background = color;
  strengthLabel.textContent = result.level;
  strengthLabel.style.color = color;
  scoreValue.textContent = passwordInput.value ? result.score : '—';
  scoreFill.style.width = `${result.score}%`;
  scoreFill.style.background = color;
  scoreCaption.textContent = passwordInput.value ? `Estimated entropy: ${result.entropy} bits` : 'Start typing to see your score.';
  for (const [key, passed] of Object.entries(result.checks)) {
    const item = checksList.querySelector(`[data-check="${key}"]`);
    item.classList.toggle('passed', passed);
    item.classList.toggle('failed', Boolean(passwordInput.value) && !passed);
    item.querySelector('.check-icon').textContent = passed ? '✓' : (passwordInput.value ? '×' : '○');
  }
  feedback.hidden = !passwordInput.value;
  feedback.textContent = result.tips.join(' ');
  clearButton.classList.toggle('visible', Boolean(passwordInput.value));
}

passwordInput.addEventListener('input', render);
toggleButton.addEventListener('click', () => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';
  toggleButton.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  toggleButton.title = show ? 'Hide password' : 'Show password';
});
clearButton.addEventListener('click', () => { passwordInput.value = ''; render(); passwordInput.focus(); });
lengthRange.addEventListener('input', () => { lengthValue.value = lengthRange.value; lengthValue.textContent = lengthRange.value; });

function secureIndex(max) {
  const values = new Uint32Array(1);
  const ceiling = Math.floor(0x100000000 / max) * max;
  do { crypto.getRandomValues(values); } while (values[0] >= ceiling);
  return values[0] % max;
}
function secureChoice(chars) { return chars[secureIndex(chars.length)]; }
function shuffleSecure(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function makePassword(length, symbols) {
  const groups = ['abcdefghijkmnopqrstuvwxyz', 'ABCDEFGHJKLMNPQRSTUVWXYZ', '23456789'];
  if (symbols) groups.push('!@#$%^&*()-_=+[]{}?');
  const alphabet = groups.join('');
  const chars = groups.map(secureChoice);
  while (chars.length < length) chars.push(secureChoice(alphabet));
  return shuffleSecure(chars).join('');
}

document.querySelector('#generate-button').addEventListener('click', () => {
  const generated = makePassword(Number(lengthRange.value), symbolCheckbox.checked);
  suggestion.textContent = generated;
  suggestionWrap.hidden = false;
  copyStatus.textContent = '';
  passwordInput.value = generated;
  render();
});
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(suggestion.textContent);
    copyStatus.textContent = 'Copied to clipboard.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(suggestion);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Select and copy the highlighted password.';
  }
});

render();


