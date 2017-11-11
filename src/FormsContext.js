import { Component } from 'react';
import PropTypes from 'prop-types';

export default class FormsContext extends Component {
  static contextTypes = {
    forms: PropTypes.object,
  };

  static childContextTypes = {
    forms: PropTypes.object,
  };

  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  constructor(props, context) {
    super(props, context);
    this.forms = (context.forms || new Map());
  }

  getChildContext() {
    return {
      forms: this.forms,
    };
  }

  render() {
    return this.props.children;
  }
}
