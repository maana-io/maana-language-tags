const languageTags = require('./languageTags.json').translation

export const resolver = {
  Query: {
    allLanguageTags: async () =>
      Object.entries(languageTags).map(([key, value]) => ({
        id: key,
        ...value,
      })),
    languageTag: async (_, { id }) => ({ id, ...languageTags[id] }),
  },
}
