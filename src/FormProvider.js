import { Component } from 'react';
import PropTypes from 'prop-types';

export default class FormProvider extends Component {
  static contextTypes = {
    forms: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    form: PropTypes.func,
  };

  static propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  getChildContext() {
    return {
      form: this.context.forms.get(this.props.id),
    };
  }

  componentWillMount() {
    this.unsubscribe = this.context.forms.subscribe(
      () => this.forceUpdate(),
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return this.context.forms.has(this.props.id) && this.props.children;
  }
}
