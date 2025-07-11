import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import ZENDESK_URLS from '../../../../../helpers/constants/zendesk-url';
import { Text, Box } from '../../../../component-library';
import {
  Display,
  FlexDirection,
  TextAlign,
  TextColor,
  AlignItems,
} from '../../../../../helpers/constants/design-system';

export default class TokenListPlaceholder extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    return <></>;
  }
}
