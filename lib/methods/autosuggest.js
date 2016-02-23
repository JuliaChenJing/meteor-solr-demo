App.methods.autosuggest = {

  getSuggestions: new ValidatedMethod({
    name: 'App.methods.autosuggest.getSuggestions',
    validate: new SimpleSchema({
      keywords: {
        type: String
      }
    }).validator(),
    run({ keywords }) {
      if (!this.isSimulation) {
        const response = HTTP.get(SearchConfig.getSuggesterUrl(), {
          query: `wt=json&suggest.q=${keywords}`
        });
        if (response) {
          const searchResponse = JSON.parse(response.content);
          const suggest = searchResponse.suggest;
          const suggester = suggest[Object.keys(suggest)[0]];
          const termSuggester = suggester[Object.keys(suggester)[0]];
          const suggestions = new Set();
          termSuggester.suggestions.forEach((suggestion) => {
            suggestions.add(suggestion.term);
          });
          return Array.from(suggestions);
        }
      }
    }
  })

};
