import { languageLabel } from '../languages';

// Languages the server can follow line by line. C++ and Java are compiled, so they have no step-by-step trace yet.
export const VISUALIZER_LANGUAGES = ['python', 'javascript'];

export const canVisualize = (language) => VISUALIZER_LANGUAGES.includes(language);

export const visualizerLanguageLabels = () => VISUALIZER_LANGUAGES.map((id) => ({ id, label: languageLabel(id) }));
