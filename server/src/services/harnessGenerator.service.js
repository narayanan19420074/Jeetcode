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

import { CPP_JSON_HELPERS } from './harness/cppJsonHelpers.js';
import { JAVA_JSON_HELPERS } from './harness/javaJsonHelpers.js';

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
    java: generateJavaStarter(spec),
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
    java: generateJavaDriver(spec),
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


// --- Java ---------------------------------------------------------------
// Judge0 and the local judge both compile one file as Main.java, so the
// harness is `public class Main` and the learner's `class Solution` sits in
// the placeholder slot above it (non-public, so imports they add still work).

function javaType(type) {
  switch (type) {
    case 'int': return 'int';
    case 'float': return 'double';
    case 'string': return 'String';
    case 'bool': return 'boolean';
    case 'int[]': return 'int[]';
    case 'float[]': return 'double[]';
    case 'string[]': return 'String[]';
    case 'bool[]': return 'boolean[]';
    case 'int[][]': return 'int[][]';
    default: throw new Error(`Unsupported type for Java: ${type}`);
  }
}

function generateJavaStarter(spec) {
  const { functionName, params, returnType } = spec;
  const javaParams = params.map((p) => `${javaType(p.type)} ${p.name}`).join(', ');
  return `class Solution {\n    public ${javaType(returnType)} ${functionName}(${javaParams}) {\n        \n    }\n}`;
}

const JAVA_PARSE = { int: '__parseInt', float: '__parseFloat', string: '__parseString', bool: '__parseBool', 'int[]': '__parseIntArray', 'float[]': '__parseFloatArray', 'string[]': '__parseStringArray', 'bool[]': '__parseBoolArray', 'int[][]': '__parseIntArray2D' };
const JAVA_FORMAT = { int: '__fmtInt', float: '__fmtFloat', string: '__fmtString', bool: '__fmtBool', 'int[]': '__fmtIntArray', 'float[]': '__fmtFloatArray', 'string[]': '__fmtStringArray', 'bool[]': '__fmtBoolArray', 'int[][]': '__fmtIntArray2D' };

function generateJavaDriver({ functionName, params, returnType }) {
  const parseCalls = params
    .map((p, i) => `        ${javaType(p.type)} __arg${i} = ${JAVA_PARSE[p.type]}();\n        __comma();`)
    .join('\n');
  const argNames = params.map((_, i) => `__arg${i}`).join(', ');

  return `import java.util.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

/*__USER_CODE__*/

public class Main {
${JAVA_JSON_HELPERS}

    public static void main(String[] args) throws Exception {
        ByteArrayOutputStream __buf = new ByteArrayOutputStream();
        byte[] __chunk = new byte[8192];
        int __n;
        while ((__n = System.in.read(__chunk)) > 0) __buf.write(__chunk, 0, __n);
        __in = new String(__buf.toByteArray(), StandardCharsets.UTF_8);
        __pos = 0;
        __expect('[');
${parseCalls}
        __expect(']');

        Solution __sol = new Solution();
        ${javaType(returnType)} __result = __sol.${functionName}(${argNames});
        System.out.println(${JAVA_FORMAT[returnType]}(__result));
    }
}`;
}

// Problems saved before Java existed have no java code stored. When they were
// authored from a spec (functionName/params/returnType) we can build it on the
// fly; hand-written-driver problems (linked lists, trees…) stay without Java.
function specOf(problem) {
  if (!problem?.functionName || !problem.params?.length || !problem.returnType) return null;
  const types = [...problem.params.map((p) => p.type), problem.returnType];
  return types.every(isSupportedType) ? { functionName: problem.functionName, params: problem.params, returnType: problem.returnType } : null;
}

export function javaStarterFor(problem) {
  if (problem?.starterCode?.java) return problem.starterCode.java;
  const spec = specOf(problem);
  return spec ? generateJavaStarter(spec) : null;
}

export function javaDriverFor(problem) {
  if (problem?.driverCode?.java) return problem.driverCode.java;
  const spec = specOf(problem);
  return spec ? generateJavaDriver(spec) : null;
}

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
