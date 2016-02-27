SearchBar = React.createClass({

  propTypes: {
    searchParams: React.PropTypes.object.isRequired,
    handleSearchParamsUpdate: React.PropTypes.func.isRequired,
    searchSuggestions: React.PropTypes.array,
    requestSuggestions: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      searchSuggestions: []
    };
  },

  getInitialState() {
    return {
      keywords: '',
      suggestionKeywordsStart: 0,
      selectedSuggestionIndex: -1,
      showSuggestions: true
    };
  },

  componentWillMount() {
    this.setSearchKeywords = _.debounce((keywords) => {
      this.requestSuggestions(keywords);
      const newSearchParams = _.extend({}, this.props.searchParams);
      newSearchParams.keywords = keywords;
      this.props.handleSearchParamsUpdate(newSearchParams);
    }, 500);
  },

  performSearch(event) {
    if (!this.state.showSuggestions) {
      this.setState({ showSuggestions: true });
    }
    const keywords = event.target.value;
    this.setSearchKeywords(keywords);
    this.setState({ keywords });
  },

  requestSuggestions(keywords) {
    if (keywords) {
      let sliceStart = this.state.suggestionKeywordsStart;
      if (keywords.length < sliceStart) {
        sliceStart = 0;
        this.setState({
          suggestionKeywordsStart: keywords.length
        });
      }
      this.props.requestSuggestions(keywords.slice(sliceStart));
    } else {
      this.setState({
        suggestionKeywordsStart: 0
      });
    }
  },

  resetSearch(event) {
    event.preventDefault();
    this.props.handleSearchParamsUpdate(null);
    this.refs.keywords.focus();
    this.setState({ keywords: '' });
  },

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
  },

  selectSuggestion(event) {

    if (event.keyCode === 40
        && (this.state.selectedSuggestionIndex
          < this.props.searchSuggestions.length - 1)) {
      // Moving down
      this.setState({
        selectedSuggestionIndex: ++this.state.selectedSuggestionIndex
      });
    } else if (event.keyCode === 38 && this.state.selectedSuggestionIndex > 0) {
      // Moving up
      this.setState({
        selectedSuggestionIndex: --this.state.selectedSuggestionIndex
      });
    } else if ((event.keyCode === 13) || (event.type === 'click')) {
      if (this.state.selectedSuggestionIndex > -1) {
        // Selected suggestion (via enter key or mouse click)
        const newSearchParams = _.extend({}, this.props.searchParams);

        let suggestionKeywords =
          this.props.searchSuggestions[this.state.selectedSuggestionIndex];
        suggestionKeywords = suggestionKeywords.replace(/<(?:.|\n)*?>/gm, '');
        suggestionKeywords = `"${suggestionKeywords}" `;
        newSearchParams.keywords =
          newSearchParams.keywords.substring(0, this.state.suggestionKeywordsStart)
          + suggestionKeywords;

        this.props.handleSearchParamsUpdate(newSearchParams);
        this.props.requestSuggestions(null);
        let keywords;
        if (newSearchParams.keywords) {
          keywords = newSearchParams.keywords;
        }
        this.setState({
          keywords,
          suggestionKeywordsStart: keywords.length
        });
      }
      this.hideSuggestions();
    } else if (event.keyCode === 27) {
      // Cancel autosuggest (esc key)
      this.hideSuggestions();
    }

  },

  highlightSuggestionByMouse(event) {
    const suggestionIndex = event.target.getAttribute('data-suggestion-index');
    this.setState({ selectedSuggestionIndex: parseInt(suggestionIndex, 10) });
  },

  hideSuggestions(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({
      showSuggestions: false,
      selectedSuggestionIndex: -1
    });
  },

  renderSearchSuggestions() {
    let suggestionList;
    if (this.state.showSuggestions && this.props.searchSuggestions
        && (this.props.searchSuggestions.length > 0)) {
      const suggestions = [];
      let suggestionIndex = 0;
      this.props.searchSuggestions.forEach((suggestion) => {
        const active = classNames({
          'active': (suggestionIndex === this.state.selectedSuggestionIndex
            ? true : false)
        });
        suggestions.push(
          <li key={suggestionIndex} className={'list-group-item ' + active}
            data-suggestion-index={suggestionIndex}
            onMouseEnter={this.highlightSuggestionByMouse}
            onClick={this.selectSuggestion}
          >
            <span dangerouslySetInnerHTML={{ __html: suggestion }} />
          </li>
        );
        suggestionIndex++;
      });
      suggestionList = (
        <div>
          <a href="#" className="close-suggestions"
            onClick={this.hideSuggestions}
          >
            <i className="fa fa-times-circle fa-2x"></i>
          </a>
          <ul className="search-suggestions list-group hidden-xs">
            {suggestions}
          </ul>
        </div>
      );
    }
    return suggestionList;
  },

  render() {
    return (
      <div className="search-bar clearfix">
        <form className="navbar-form navbar-left pull-right"
          role="search" onSubmit={this.handleSubmit}
        >
          <div className="input-group">
            <input ref="keywords" className="form-control"
              placeholder="Search keywords" autoFocus
              onChange={this.performSearch}
              onKeyDown={this.selectSuggestion}
              value={this.state.keywords}
            />
            <span className="input-group-addon">
              <i className="fa fa-search" />
            </span>
          </div>
          {this.renderSearchSuggestions()}
        </form>
        <div className="search-reset">
          <a href="#" onClick={this.resetSearch}>Reset search?</a>
        </div>
      </div>
    );
  }

});
