import { Component } from 'react';
import PropTypes from 'prop-types';
import createFormsContext from './createFormsContext';

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
    this.forms = (context.forms || createFormsContext());
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
