// Auto-format helpers for the workspace editor.
//
//   JavaScript -> Prettier (loaded lazily, so it stays out of the main bundle)
//   Python     -> indentation fixer (Prettier has no Python support). Only the
//                 leading whitespace of code lines is touched.
//   C++        -> leading tabs become spaces (indentation never affects a C++ verdict)
//
// formatCode never throws: if anything fails (e.g. JS with a syntax error while
// the user is still typing) the original code is returned unchanged.

const clampUnit = (n) => (Number.isInteger(n) && n >= 2 && n <= 8 ? n : 4);

let prettierPromise = null;
const loadPrettier = () => {
  prettierPromise ??= Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/estree'),
  ]);
  return prettierPromise;
};

export const preloadFormatter = () => {
  loadPrettier().catch(() => {});
};

async function formatJavaScript(code, cursorOffset, unit) {
  const [prettier, babel, estree] = await loadPrettier();
  const res = await prettier.formatWithCursor(code, {
    parser: 'babel',
    plugins: [babel, estree],
    cursorOffset,
    tabWidth: unit,
    useTabs: false,
    printWidth: 100,
    singleQuote: true,
    endOfLine: 'auto',
  });
  return { code: res.formatted, cursorOffset: res.cursorOffset };
}

/* ---------- Python ---------- */

// Walks one physical line, updating the carried state (open string / brackets /
// backslash continuation). Returns the last significant character outside of
// comments (or null) so we know whether a statement ends with ':'.
function scanPythonLine(line, st) {
  let n = line.length;
  if (line.endsWith('\r')) n -= 1;
  let last = null;
  let continues = false;
  st.cont = false;
  let i = 0;
  while (i < n) {
    const c = line[i];
    if (st.quote) {
      if (c === '\\') {
        if (i === n - 1) continues = true;
        i += 2;
        continue;
      }
      if (st.quote.length === 3) {
        if (line.startsWith(st.quote, i)) {
          st.quote = null;
          last = '"';
          i += 3;
          continue;
        }
      } else if (c === st.quote) {
        st.quote = null;
        last = c;
      }
      i += 1;
      continue;
    }
    if (c === '#') break;
    if (c === '"' || c === "'") {
      const triple = c.repeat(3);
      if (line.startsWith(triple, i)) {
        st.quote = triple;
        i += 3;
      } else {
        st.quote = c;
        i += 1;
      }
      last = c;
      continue;
    }
    if (c === '(' || c === '[' || c === '{') st.depth += 1;
    else if (c === ')' || c === ']' || c === '}') st.depth = Math.max(0, st.depth - 1);
    if (c === '\\' && i === n - 1) {
      st.cont = true;
      i += 1;
      continue;
    }
    if (c !== ' ' && c !== '\t') last = c;
    i += 1;
  }
  // A normal ' or " string cannot span lines unless the line ends with a backslash.
  if (st.quote && st.quote.length === 1 && !continues) st.quote = null;
  return last;
}

// Re-indents every statement to level * unit spaces. Levels come from the
// widths already used in the file, so a mix of tabs / 2 / 3 / 4 spaces becomes
// one consistent style. Lines inside strings, brackets or after a trailing
// backslash are never touched.
function fixPythonIndent(src, unit) {
  const lines = src.split('\n');
  const out = lines.slice();
  const stack = [0];
  const st = { quote: null, depth: 0, cont: false };
  let prevColon = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const atStart = st.quote === null && st.depth === 0 && !st.cont;
    const lead = /^[ \t]*/.exec(line)[0];
    const body = line.slice(lead.length);
    const isCode = atStart && body.trim() !== '' && body[0] !== '#';

    if (isCode) {
      let w = 0;
      for (const ch of lead) w += ch === '\t' ? unit : 1;
      let level;
      if (prevColon && w > stack[stack.length - 1]) {
        stack.push(w);
        level = stack.length - 1;
      } else {
        // nearest known level; on a tie the deeper one wins
        let best = 0;
        let bestDist = Infinity;
        for (let k = 0; k < stack.length; k += 1) {
          const d = Math.abs(stack[k] - w);
          if (d <= bestDist) {
            best = k;
            bestDist = d;
          }
        }
        stack.length = best + 1;
        level = best;
      }
      out[i] = ' '.repeat(level * unit) + body;
    }

    const last = scanPythonLine(line, st);
    const logicalDone = st.quote === null && st.depth === 0 && !st.cont;
    if (logicalDone && last !== null) prevColon = last === ':';
  }
  return out.join('\n');
}

/* ---------- C++ ---------- */

function fixCppTabs(src, unit) {
  return src
    .split('\n')
    .map((line) => {
      const lead = /^[ \t]*/.exec(line)[0];
      if (!lead.includes('\t')) return line;
      return lead.replace(/\t/g, ' '.repeat(unit)) + line.slice(lead.length);
    })
    .join('\n');
}

/* ---------- public ---------- */

// Keeps the caret on the same line / column when only leading whitespace moved.
function mapCursor(before, after, offset) {
  const a = before.split('\n');
  const b = after.split('\n');
  if (a.length !== b.length) return Math.min(offset, after.length);
  let pos = 0;
  for (let i = 0; i < a.length; i += 1) {
    const end = pos + a[i].length;
    if (offset <= end) {
      const col = offset - pos;
      const oldLead = /^[ \t]*/.exec(a[i])[0].length;
      const newLead = /^[ \t]*/.exec(b[i])[0].length;
      let newCol;
      if (col < oldLead) newCol = Math.min(col, newLead);
      else newCol = col + (newLead - oldLead);
      let newPos = 0;
      for (let k = 0; k < i; k += 1) newPos += b[k].length + 1;
      return newPos + Math.max(0, newCol);
    }
    pos = end + 1;
  }
  return after.length;
}

export async function formatCode(language, code, cursorOffset = 0, { tabSize } = {}) {
  const unit = clampUnit(tabSize);
  try {
    if (language === 'javascript') return await formatJavaScript(code, cursorOffset, unit);
    if (language === 'python') {
      const next = fixPythonIndent(code, unit);
      return { code: next, cursorOffset: mapCursor(code, next, cursorOffset) };
    }
    if (language === 'cpp' || language === 'java') {
      const next = fixCppTabs(code, unit);
      return { code: next, cursorOffset: mapCursor(code, next, cursorOffset) };
    }
  } catch {
    // unparsable code mid-typing — leave it alone
  }
  return { code, cursorOffset };
}

// Replaces only the span of text that changed, so the caret, scroll position and
// (in pair rooms) the shared document see the smallest possible edit.
export function replaceChangedSpan(editor, src, res) {
  const model = editor.getModel();
  if (!model) return;
  let start = 0;
  const maxStart = Math.min(src.length, res.code.length);
  while (start < maxStart && src[start] === res.code[start]) start += 1;
  let endOld = src.length;
  let endNew = res.code.length;
  while (endOld > start && endNew > start && src[endOld - 1] === res.code[endNew - 1]) {
    endOld -= 1;
    endNew -= 1;
  }
  const a = model.getPositionAt(start);
  const b = model.getPositionAt(endOld);
  editor.pushUndoStop();
  editor.executeEdits('auto-format', [
    { range: { startLineNumber: a.lineNumber, startColumn: a.column, endLineNumber: b.lineNumber, endColumn: b.column }, text: res.code.slice(start, endNew) },
  ]);
  editor.pushUndoStop();
  editor.setPosition(model.getPositionAt(res.cursorOffset));
}

// Exposed for quick tests.
export const __test = { fixPythonIndent, fixCppTabs, mapCursor };
