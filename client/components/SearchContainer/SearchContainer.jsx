SearchContainer = React.createClass({

  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      searchParams: this.defaultSearchParams(),
      searchSuggestions: []
    };
  },

  getMeteorData() {

    const searchParams = this.state.searchParams;
    if (searchParams.keywords) {
      PowerSearch.search(
        searchParams.keywords,
        {
          currentPage: searchParams.currentPage,
          fields: searchParams.fields,
          resultsPerPage: searchParams.resultsPerPage,
          sorting: App.models.searchSort.getSolrSort(searchParams.sorting),
        }
      );
    }

    const searchResults = PowerSearch.getData({
      sort: App.models.searchSort.getMongoSort(searchParams.sorting),
      transform(matchText, regExp) {
        return matchText.replace(regExp, '<strong>$&</strong>');
      }
    });
    const searchMetadata = PowerSearch.getMetadata();

    return {
      searchResults,
      searchMetadata
    };

  },

  defaultSearchParams() {
    return {
      keywords: '',
      fields: {},
      currentPage: 1,
      resultsPerPage: 10,
      lastAddedFieldName: null,
      suggestionKeywords: '',
      sorting: App.models.searchSort.lookup.relevancy.id,
    };
  },

  updateSearchParams(newSearchParams) {
    if (newSearchParams) {
      this.setState({
        searchParams: newSearchParams
      });
      App.utilities.searchLogger.logSearchToCloud(newSearchParams);
    } else {
      this.setState({
        searchParams: this.defaultSearchParams(),
        searchSuggestions: []
      });
    }
  },

  provideSuggestions(suggestionKeywords) {
    if (suggestionKeywords) {
      App.methods.autosuggest.getSuggestions.call({
        suggestionKeywords
      }, (error, suggestions) => {
        this.setState({
          searchSuggestions: suggestions
        });
      });
    } else {
      this.setState({
        searchSuggestions: []
      });
    }
  },

  renderMain() {
    let mainContent;
    if (!this.state.searchParams.keywords) {
      mainContent = (
        <main>
          <WelcomeContent />
        </main>
      );
    } else {
      if (PowerSearch.getStatus().loaded) {
        if (this.data.searchResults.length) {
          mainContent = (
            <main>
              <div className="row">
                <div className="col-md-9">
                  <ResultsCount searchMetadata={this.data.searchMetadata}
                    searchParams={this.state.searchParams}
                  />
                </div>
                <div className="col-md-3">
                  <Sorting
                    searchParams={this.state.searchParams}
                    handleSearchParamsUpdate={this.updateSearchParams}
                  />
                </div>
              </div>
              <SearchResults searchResults={this.data.searchResults}
                searchParams={this.state.searchParams}
                searchMetadata={this.data.searchMetadata}
              />
              <Pagination searchMetadata={this.data.searchMetadata}
                searchParams={this.state.searchParams}
                handleSearchParamsUpdate={this.updateSearchParams}
              />
            </main>
          );
        } else {
          mainContent = (<main>No results found.</main>);
        }
      } else if (PowerSearch.getStatus().loading) {
        mainContent = (
          <main>
            Loading ...
          </main>
        );
      } else {
        mainContent = (
          <main>
            Oh no! Looks like we're having problems completing your search!
          </main>
        );
      }
    }
    return mainContent;
  },

  renderSidebar() {
    let sidebarContent;
    if (!this.state.searchParams.keywords) {
      sidebarContent = (<WelcomSidebar />);
    } else {
      if (this.data.searchMetadata.facets) {
        sidebarContent = (
          <aside>
            <h2>Refine Your Search</h2>
            <NestedCategoriesWidget field="source" name="Categories"
              categories={this.data.searchMetadata.nestedCategories.source}
              selectedCategoryPath={this.state.searchParams.fields.source}
              showHelp
              searchParams={this.state.searchParams}
              handleSearchParamsUpdate={this.updateSearchParams}
            />
            <NestedCategoriesWidget field="date_ss" name="Date"
              categories={this.data.searchMetadata.nestedCategories.date_ss}
              selectedCategoryPath={this.state.searchParams.fields.date_ss}
              searchParams={this.state.searchParams}
              handleSearchParamsUpdate={this.updateSearchParams}
              rootNodeLimit={10} sortRootNodesDesc
            />
            <SearchFacet key="ml_entity_location" name="Location"
              field="ml_entity_location"
              values={this.data.searchMetadata.facets.ml_entity_location}
              searchParams={this.state.searchParams}
              handleSearchParamsUpdate={this.updateSearchParams}
            />
            <SearchFacet key="ml_keyword" name="Related Terms"
              field="ml_keyword"
              values={this.data.searchMetadata.facets.ml_keyword}
              searchParams={this.state.searchParams}
              handleSearchParamsUpdate={this.updateSearchParams}
            />
            <SearchFacet key="ml_entity_organization" name="Organization"
              field="ml_entity_organization"
              values={this.data.searchMetadata.facets.ml_entity_organization}
              searchParams={this.state.searchParams}
              handleSearchParamsUpdate={this.updateSearchParams}
            />
            <SearchFacet key="author" name="Author" field="author"
              values={this.data.searchMetadata.facets.author}
              searchParams={this.state.searchParams}
              handleSearchParamsUpdate={this.updateSearchParams}
            />
            <SearchFacet key="doctype" name="Document Type"
              field="doctype"
              values={this.data.searchMetadata.facets.doctype}
              searchParams={this.state.searchParams}
              handleSearchParamsUpdate={this.updateSearchParams}
            />
          </aside>
        );
      }
    }
    return sidebarContent;
  },

  render() {
    return (
      <div className="search-container">
        <header>
          <nav className="navbar navbar-default navbar-fixed-top">
            <div className="container">
              <div className="row">
                <div className="col-md-2">
                  <SearchLogo />
                </div>
                <div className="col-md-10">
                  <SearchBar searchParams={this.state.searchParams}
                    handleSearchParamsUpdate={this.updateSearchParams}
                    searchSuggestions={this.state.searchSuggestions}
                    requestSuggestions={this.provideSuggestions}
                  />
                </div>
              </div>
            </div>
          </nav>
        </header>
        <div className="search-body">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                {this.renderMain()}
              </div>
              <div className="col-md-4">
                {this.renderSidebar()}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

});
