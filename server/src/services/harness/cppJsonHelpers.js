
// A minimal recursive JSON-subset parser/formatter. Included in full in
// every generated driver — a little compiled-code duplication per
// submission is a non-issue on Judge0, and keeping this self-contained
// (no external JSON lib dependency) keeps the sandboxed compile simple.
export const CPP_JSON_HELPERS = `string __in;
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
