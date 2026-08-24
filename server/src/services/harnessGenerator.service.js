// ============================================================================
// Harness generator — auto-produces driverCode + starterCode for all three
// languages from a tiny per-problem spec: { functionName, params, returnType }.
//
// This exists because hand-writing a driver per problem × 3 languages does
// not scale to 300 questions. Instead, an author declares the function
// SIGNATURE once (e.g. twoSum(nums: int[], target: int) -> int[]) and this
// module generates working, compilable driver programs for JS/Python/C++
// that parse a single JSON array of arguments from stdin, call the
// learner's function, and print the result in a consistent format.
//
// Supported types cover the large majority of array/string/number problems:
//   int, float, string, bool, int[], float[], string[], bool[], int[][]
//
// Problems needing custom structures (linked lists, trees, graphs) fall
// back to a hand-written `driverCode` override — see problem.controller.js:
// if driverCode is supplied explicitly, this generator is skipped entirely.
// ============================================================================

const SUPPORTED_TYPES = ['int', 'float', 'string', 'bool', 'int[]', 'float[]', 'string[]', 'bool[]', 'int[][]'];

export function isSupportedType(type) {
  return SUPPORTED_TYPES.includes(type);
}

// --- Starter code (function/class shell shown in the editor) ---

export function generateStarterCode(spec) {
  const { functionName, params } = spec;
  const jsParams = params.map((p) => p.name).join(', ');
  const pyParams = params.map((p) => p.name).join(', ');

  return {
    javascript: `function ${functionName}(${jsParams}) {\n  \n}`,
    python: `def ${functionName}(${pyParams}):\n    `,
    cpp: generateCppStarter(spec),
  };
}

function generateCppStarter(spec) {
  const { functionName, params, returnType } = spec;
  const cppParams = params.map((p) => `${cppType(p.type)} ${p.name}`).join(', ');
  return `class Solution {\npublic:\n    ${cppType(returnType)} ${functionName}(${cppParams}) {\n        \n    }\n};`;
}

function cppType(type) {
  switch (type) {
    case 'int': return 'int';
    case 'float': return 'double';
    case 'string': return 'string';
    case 'bool': return 'bool';
    case 'int[]': return 'vector<int>';
    case 'float[]': return 'vector<double>';
    case 'string[]': return 'vector<string>';
    case 'bool[]': return 'vector<bool>';
    case 'int[][]': return 'vector<vector<int>>';
    default: throw new Error(`Unsupported type for C++: ${type}`);
  }
}

// --- Driver code (full compilable harness with /*__USER_CODE__*/ slot) ---

export function generateDriverCode(spec) {
  return {
    javascript: generateJsDriver(spec),
    python: generatePythonDriver(spec),
    cpp: generateCppDriver(spec),
  };
}

function generateJsDriver({ functionName }) {
  // Reads the ENTIRE stdin as one JSON array of arguments, e.g. "[[2,7,11,15],9]",
  // spreads it into the call, prints the result with no whitespace so the
  // same expectedOutput string works across all three languages.
  return `const __data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));

/*__USER_CODE__*/

const __result = ${functionName}(...__data);
console.log(JSON.stringify(__result));`;
}

function generatePythonDriver({ functionName }) {
  // json.dumps(28.0) -> "28.0" in Python, but JSON.stringify(28.0) -> "28" in
  // JS, and our C++ formatter also prints "28". __normalize below makes
  // Python match that convention (strip .0 for whole-number floats,
  // recursively through nested lists) so one expectedOutput string is
  // valid across all three languages regardless of which one produced it.
  return `import sys, json

def __normalize(v):
    if isinstance(v, float):
        if v == int(v) and abs(v) < 1e15:
            return int(v)
        return v
    if isinstance(v, list):
        return [__normalize(x) for x in v]
    return v

/*__USER_CODE__*/

def __main():
    __data = json.loads(sys.stdin.read())
    __result = ${functionName}(*__data)
    print(json.dumps(__normalize(__result), separators=(',', ':')))

__main()`;
}

// The C++ generator is the meaningful piece of work: it emits a small,
// hand-rolled JSON-subset parser (numbers/strings/bools/arrays only — no
// objects needed), typed extraction calls matching each param's declared
// type in order, and a matching formatter for the return type.
function generateCppDriver({ functionName, params, returnType }) {
  const parseCalls = params.map((p, i) => {
    const varName = `__arg${i}`;
    return `    ${cppType(p.type)} ${varName} = ${parserFnName(p.type)}();\n    __skipComma();`;
  }).join('\n');

  const argNames = params.map((_, i) => `__arg${i}`).join(', ');

  return `#include <bits/stdc++.h>
using namespace std;

${CPP_JSON_HELPERS}

/*__USER_CODE__*/

int main() {
    std::ostringstream __ss;
    __ss << cin.rdbuf();
    __in = __ss.str();
    __pos = 0;
    __expect('[');
${parseCalls}
    __expect(']');

    Solution __sol;
    auto __result = __sol.${functionName}(${argNames});
    cout << ${formatterCall(returnType, '__result')} << endl;
    return 0;
}`;
}

function parserFnName(type) {
  switch (type) {
    case 'int': return '__parseInt';
    case 'float': return '__parseFloat';
    case 'string': return '__parseString';
    case 'bool': return '__parseBool';
    case 'int[]': return '__parseIntArray';
    case 'float[]': return '__parseFloatArray';
    case 'string[]': return '__parseStringArray';
    case 'bool[]': return '__parseBoolArray';
    case 'int[][]': return '__parseIntArray2D';
    default: throw new Error(`Unsupported type for C++: ${type}`);
  }
}

function formatterCall(type, varName) {
  switch (type) {
    case 'int': return `__formatInt(${varName})`;
    case 'float': return `__formatFloat(${varName})`;
    case 'string': return `__formatString(${varName})`;
    case 'bool': return `__formatBool(${varName})`;
    case 'int[]': return `__formatIntArray(${varName})`;
    case 'float[]': return `__formatFloatArray(${varName})`;
    case 'string[]': return `__formatStringArray(${varName})`;
    case 'bool[]': return `__formatBoolArray(${varName})`;
    case 'int[][]': return `__formatIntArray2D(${varName})`;
    default: throw new Error(`Unsupported type for C++: ${type}`);
  }
}

// A minimal recursive JSON-subset parser/formatter. Included in full in
// every generated driver — a little compiled-code duplication per
// submission is a non-issue on Judge0, and keeping this self-contained
// (no external JSON lib dependency) keeps the sandboxed compile simple.
const CPP_JSON_HELPERS = `string __in;
size_t __pos = 0;

void __skipWs() { while (__pos < __in.size() && isspace((unsigned char)__in[__pos])) __pos++; }
void __expect(char c) { __skipWs(); __pos++; }
void __skipComma() { __skipWs(); if (__pos < __in.size() && __in[__pos] == ',') __pos++; }

long long __parseIntTok() {
    __skipWs();
    size_t start = __pos;
    if (__in[__pos] == '-') __pos++;
    while (__pos < __in.size() && isdigit((unsigned char)__in[__pos])) __pos++;
    return stoll(__in.substr(start, __pos - start));
}
double __parseFloatTok() {
    __skipWs();
    size_t start = __pos;
    if (__in[__pos] == '-') __pos++;
    while (__pos < __in.size() && (isdigit((unsigned char)__in[__pos]) || __in[__pos]=='.' || __in[__pos]=='e' || __in[__pos]=='E' || __in[__pos]=='+')) __pos++;
    return stod(__in.substr(start, __pos - start));
}
string __parseStringTok() {
    __skipWs();
    __pos++; // opening quote
    string res;
    while (__in[__pos] != '"') {
        if (__in[__pos] == '\\\\' && __pos + 1 < __in.size()) { __pos++; res += __in[__pos]; __pos++; }
        else { res += __in[__pos]; __pos++; }
    }
    __pos++; // closing quote
    return res;
}
bool __parseBoolTok() {
    __skipWs();
    if (__in.compare(__pos, 4, "true") == 0) { __pos += 4; return true; }
    __pos += 5;
    return false;
}

int __parseInt() { return (int)__parseIntTok(); }
double __parseFloat() { return __parseFloatTok(); }
string __parseString() { return __parseStringTok(); }
bool __parseBool() { return __parseBoolTok(); }

vector<int> __parseIntArray() {
    vector<int> v;
    __expect('[');
    __skipWs();
    if (__pos < __in.size() && __in[__pos] == ']') { __pos++; return v; }
    while (true) {
        v.push_back(__parseInt());
        __skipWs();
        if (__pos < __in.size() && __in[__pos] == ',') { __pos++; continue; }
        break;
    }
    __expect(']');
    return v;
}
vector<double> __parseFloatArray() {
    vector<double> v;
    __expect('[');
    __skipWs();
    if (__pos < __in.size() && __in[__pos] == ']') { __pos++; return v; }
    while (true) {
        v.push_back(__parseFloat());
        __skipWs();
        if (__pos < __in.size() && __in[__pos] == ',') { __pos++; continue; }
        break;
    }
    __expect(']');
    return v;
}
vector<string> __parseStringArray() {
    vector<string> v;
    __expect('[');
    __skipWs();
    if (__pos < __in.size() && __in[__pos] == ']') { __pos++; return v; }
    while (true) {
        v.push_back(__parseString());
        __skipWs();
        if (__pos < __in.size() && __in[__pos] == ',') { __pos++; continue; }
        break;
    }
    __expect(']');
    return v;
}
vector<bool> __parseBoolArray() {
    vector<bool> v;
    __expect('[');
    __skipWs();
    if (__pos < __in.size() && __in[__pos] == ']') { __pos++; return v; }
    while (true) {
        v.push_back(__parseBool());
        __skipWs();
        if (__pos < __in.size() && __in[__pos] == ',') { __pos++; continue; }
        break;
    }
    __expect(']');
    return v;
}
vector<vector<int>> __parseIntArray2D() {
    vector<vector<int>> v;
    __expect('[');
    __skipWs();
    if (__pos < __in.size() && __in[__pos] == ']') { __pos++; return v; }
    while (true) {
        v.push_back(__parseIntArray());
        __skipWs();
        if (__pos < __in.size() && __in[__pos] == ',') { __pos++; continue; }
        break;
    }
    __expect(']');
    return v;
}

string __formatInt(int v) { return to_string(v); }
string __formatFloat(double v) {
    ostringstream o; o << v; return o.str();
}
string __formatString(const string& v) { return "\\"" + v + "\\""; }
string __formatBool(bool v) { return v ? "true" : "false"; }
string __formatIntArray(const vector<int>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { s += to_string(v[i]); if (i + 1 < v.size()) s += ","; }
    return s + "]";
}
string __formatFloatArray(const vector<double>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { s += __formatFloat(v[i]); if (i + 1 < v.size()) s += ","; }
    return s + "]";
}
string __formatStringArray(const vector<string>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { s += __formatString(v[i]); if (i + 1 < v.size()) s += ","; }
    return s + "]";
}
string __formatBoolArray(const vector<bool>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { s += (v[i] ? "true" : "false"); if (i + 1 < v.size()) s += ","; }
    return s + "]";
}
string __formatIntArray2D(const vector<vector<int>>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { s += __formatIntArray(v[i]); if (i + 1 < v.size()) s += ","; }
    return s + "]";
}`;

// --- Shared helper: fills starterCode/driverCode from the spec when the
// author didn't hand-write them. Used by both the admin API controller
// and the bulk import script so there's one code path, not two.
export function applyHarnessGeneration(payload) {
  const hasSpec = payload.functionName && payload.params?.length && payload.returnType;
  if (!hasSpec) return payload; // manual driverCode/starterCode path — leave as-is

  const spec = { functionName: payload.functionName, params: payload.params, returnType: payload.returnType };
  const result = { ...payload };
  if (!result.driverCode) result.driverCode = generateDriverCode(spec);
  if (!result.starterCode) result.starterCode = generateStarterCode(spec);
  return result;
}

// --- testCases authoring helper: converts native JS values into the
// stdin/expectedOutput strings Judge0 actually needs, using the SAME
// formatting the generated drivers produce (no spaces, JSON-array style).
export function argsToStdin(args) {
  return JSON.stringify(args);
}

export function valueToExpectedOutput(value) {
  // JSON.stringify never adds a trailing ".0" to whole-number floats
  // (28.0 -> "28"), which is exactly the convention the JS/C++ drivers
  // use and the Python driver normalizes to — so this needs no extra
  // per-type handling.
  return JSON.stringify(value);
}
