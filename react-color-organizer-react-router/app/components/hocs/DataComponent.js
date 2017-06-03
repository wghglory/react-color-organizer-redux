import React from 'React';

const DataComponent = (ComposedComponent, url) =>
  class _DataComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: [],
        loading: true
      };
    }

    componentWillMount() {
      this.setState({ loading: true });
      fetch(url)
        .then(response => response.json())
        .then(data => this.setState({
          loading: false,
          data
        }));
    }

    render() {
      return (
        <div className="data-component">
          {(this.state.loading) ?
            <div>Loading...</div> :
            <ComposedComponent {...this.state} {...this.props} />}
        </div>
      );
    }
  };

export default DataComponent;