import { createContext, useContext } from 'react';

// The desktop workspace shows the community panels (Solutions, Discussion, Submissions) as plain text and
// icons on the page: no pills, no grey fills. The phone keeps the tonal pill look. The desktop problem pane
// wraps its panels in this provider, so every shared building block switches look from one place.
const FlatLookContext = createContext(false);

export const FlatLookProvider = FlatLookContext.Provider;
export const useFlatLook = () => useContext(FlatLookContext);
