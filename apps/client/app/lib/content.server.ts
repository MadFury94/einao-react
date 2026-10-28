import { createContentStore } from "@einao/content";
// The only persistence boundary used by loaders. A future API adapter is injected here.
export const getContentStore = () => createContentStore();
