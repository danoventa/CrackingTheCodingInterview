/* @flow */
import React from 'react';

type Props = {
  data: string,
  mimetype: string,
  metadata: any,
};

export default class ImageDisplay extends React.Component {
  props: Props;

  shouldComponentUpdate(): boolean {
    return false;
  }

  render(): ?React.Element<any> {
    let size = {};

    if (this.props.metadata) {
      const { width, height } = this.props.metadata;
      size = { width, height };
    }

    return (
      <img role="presentation" src={`data:${this.props.mimetype};base64,${this.props.data}`} {...size} />
    );
  }
}

export function PNGDisplay(props: Props): ?React.Element<any> {
  return (
    <ImageDisplay mimetype="image/png" {...props} />
  );
}

export function JPEGDisplay(props: Props): ?React.Element<any> {
  return (
    <ImageDisplay mimetype="image/jpeg" {...props} />
  );
}

export function GIFDisplay(props: Props): ?React.Element<any> {
  return (
    <ImageDisplay mimetype="image/gif" {...props} />
  );
}
