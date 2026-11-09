
// Same JSON subset + output conventions as the C++ helpers (no spaces,
// whole-number floats print without ".0") so one expectedOutput works everywhere.
export const JAVA_JSON_HELPERS = String.raw`    static String __in;
    static int __pos;

    static void __ws() { while (__pos < __in.length() && Character.isWhitespace(__in.charAt(__pos))) __pos++; }
    static void __expect(char c) { __ws(); __pos++; }
    static void __comma() { __ws(); if (__pos < __in.length() && __in.charAt(__pos) == ',') __pos++; }
    static boolean __more() { __ws(); if (__in.charAt(__pos) == ',') { __pos++; return true; } return false; }
    static boolean __emptyArray() { __expect('['); __ws(); if (__in.charAt(__pos) == ']') { __pos++; return true; } return false; }

    static String __numTok() {
        __ws();
        int s = __pos;
        while (__pos < __in.length()) {
            char c = __in.charAt(__pos);
            if (Character.isDigit(c) || c == '-' || c == '+' || c == '.' || c == 'e' || c == 'E') __pos++; else break;
        }
        return __in.substring(s, __pos);
    }
    static int __parseInt() { return (int) Long.parseLong(__numTok()); }
    static double __parseFloat() { return Double.parseDouble(__numTok()); }
    static boolean __parseBool() {
        __ws();
        if (__in.startsWith("true", __pos)) { __pos += 4; return true; }
        __pos += 5;
        return false;
    }
    static String __parseString() {
        __ws();
        __pos++;
        StringBuilder sb = new StringBuilder();
        while (__in.charAt(__pos) != '"') {
            char c = __in.charAt(__pos);
            if (c == '\\' && __pos + 1 < __in.length()) {
                __pos++;
                char n = __in.charAt(__pos);
                if (n == 'n') sb.append('\n');
                else if (n == 't') sb.append('\t');
                else if (n == 'r') sb.append('\r');
                else if (n == 'u') { sb.append((char) Integer.parseInt(__in.substring(__pos + 1, __pos + 5), 16)); __pos += 4; }
                else sb.append(n);
                __pos++;
            } else { sb.append(c); __pos++; }
        }
        __pos++;
        return sb.toString();
    }

    static int[] __parseIntArray() {
        if (__emptyArray()) return new int[0];
        ArrayList<Integer> l = new ArrayList<>();
        do { l.add(__parseInt()); } while (__more());
        __expect(']');
        int[] r = new int[l.size()];
        for (int i = 0; i < r.length; i++) r[i] = l.get(i);
        return r;
    }
    static double[] __parseFloatArray() {
        if (__emptyArray()) return new double[0];
        ArrayList<Double> l = new ArrayList<>();
        do { l.add(__parseFloat()); } while (__more());
        __expect(']');
        double[] r = new double[l.size()];
        for (int i = 0; i < r.length; i++) r[i] = l.get(i);
        return r;
    }
    static String[] __parseStringArray() {
        if (__emptyArray()) return new String[0];
        ArrayList<String> l = new ArrayList<>();
        do { l.add(__parseString()); } while (__more());
        __expect(']');
        return l.toArray(new String[0]);
    }
    static boolean[] __parseBoolArray() {
        if (__emptyArray()) return new boolean[0];
        ArrayList<Boolean> l = new ArrayList<>();
        do { l.add(__parseBool()); } while (__more());
        __expect(']');
        boolean[] r = new boolean[l.size()];
        for (int i = 0; i < r.length; i++) r[i] = l.get(i);
        return r;
    }
    static int[][] __parseIntArray2D() {
        if (__emptyArray()) return new int[0][];
        ArrayList<int[]> l = new ArrayList<>();
        do { l.add(__parseIntArray()); } while (__more());
        __expect(']');
        return l.toArray(new int[0][]);
    }

    static String __fmtInt(int v) { return Integer.toString(v); }
    static String __fmtFloat(double v) {
        if (v == Math.rint(v) && Math.abs(v) < 1e15) return Long.toString((long) v);
        double a = Math.abs(v);
        if (a >= 1e-6 && a < 1e21) return new java.math.BigDecimal(Double.toString(v)).stripTrailingZeros().toPlainString();
        return Double.toString(v);
    }
    static String __fmtString(String v) {
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < v.length(); i++) {
            char c = v.charAt(i);
            if (c == '"') sb.append("\\\"");
            else if (c == '\\') sb.append("\\\\");
            else if (c == '\n') sb.append("\\n");
            else if (c == '\r') sb.append("\\r");
            else if (c == '\t') sb.append("\\t");
            else sb.append(c);
        }
        return sb.append('"').toString();
    }
    static String __fmtBool(boolean v) { return v ? "true" : "false"; }
    static String __fmtIntArray(int[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) { if (i > 0) sb.append(','); sb.append(v[i]); }
        return sb.append(']').toString();
    }
    static String __fmtFloatArray(double[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) { if (i > 0) sb.append(','); sb.append(__fmtFloat(v[i])); }
        return sb.append(']').toString();
    }
    static String __fmtStringArray(String[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) { if (i > 0) sb.append(','); sb.append(__fmtString(v[i])); }
        return sb.append(']').toString();
    }
    static String __fmtBoolArray(boolean[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) { if (i > 0) sb.append(','); sb.append(v[i] ? "true" : "false"); }
        return sb.append(']').toString();
    }
    static String __fmtIntArray2D(int[][] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) { if (i > 0) sb.append(','); sb.append(__fmtIntArray(v[i])); }
        return sb.append(']').toString();
    }`;
