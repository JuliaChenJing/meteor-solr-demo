SearchFacet = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    values: React.PropTypes.array.isRequired
  },

  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      selectedFacet: ''
    };
  },

  getMeteorData() {
    return {
      searchParams: Session.get('searchParams')
    };
  },

  facetName() {
    return SearchConfig.facetFields[this.props.name];
  },

  refineByFacet(event) {
    event.preventDefault();
    const selectedFacet = event.target.innerHTML;
    this.setState({ selectedFacet });
    this.data.searchParams.fields[this.props.name] = selectedFacet;
    Session.set('searchParams', this.data.searchParams);
  },

  unrefineFacet() {
    event.preventDefault();
    this.setState({
      selectedFacet: null
    });
  },

  renderFacetLink(name) {
    let facetLink;
    if (this.state.selectedFacet) {
      facetLink = (
        <span>
          [<a href="#" onClick={this.unrefineFacet}>reset</a>]
          Showing: <strong>{name}</strong>
        </span>
      );
    } else {
      facetLink = (
        <a href="#" onClick={this.refineByFacet}>{name}</a>
      );
    }
    return facetLink;
  },

  renderFacetValues() {
    const facetValues = [];
    this.props.values.forEach((value) => {
      facetValues.push(
        <li key={value.name}>
          {this.renderFacetLink(value.name)}
          &nbsp;({value.count})
        </li>
      );
    });
    return facetValues;
  },

  render() {
    return (
      <div className="search-facet">
        <h3>{this.facetName()}</h3>
        <ul>
          {this.renderFacetValues()}
        </ul>
      </div>
    );
  }

});
