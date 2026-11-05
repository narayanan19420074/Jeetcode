// How null and booleans are written in each traced language, so values look like the code the learner wrote.
export const JS_LITERALS = { nothing: 'null', yes: 'true', no: 'false' };
export const PYTHON_LITERALS = { nothing: 'None', yes: 'True', no: 'False' };

export const literalsFor = (language) => (language === 'python' ? PYTHON_LITERALS : JS_LITERALS);
