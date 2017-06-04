import React from 'React';
import PropTypes from 'prop-types';

export default function ExpandableComponent(ComposedComponent) {
  class _ExpandableComponent extends React.Component {
    constructor(props) {
      super(props);
      const collapsed = (props.hidden && props.hidden === true) ? true : false;
      this.state = { collapsed };
      this.expandCollapse = this.expandCollapse.bind(this);
    }

    expandCollapse() {
      let collapsed = !this.state.collapsed;
      this.setState({ collapsed });
    }

    render() {
      return <ComposedComponent
        expandCollapse={this.expandCollapse}
        {...this.state}
        {...this.props} />;
    }

  }

  _ExpandableComponent.propTypes = {
    hidden: PropTypes.bool.isRequired
  };

  return _ExpandableComponent;
}
