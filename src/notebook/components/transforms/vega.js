/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

const vegaEmbed = require('vega-embed');

const _ = require('lodash');

const MIMETYPE_VEGA = 'application/vnd.vega+json';
const MIMETYPE_VEGALITE = 'application/vnd.vegalite+json';

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = DEFAULT_WIDTH / 1.5;

type EmbedProps = {
  data: Object,
  embedMode: string,
  renderedCallback: (err: any, result: any) => any,
};

const defaultCallback = (err: any, result: any): any => {};

function embed(el: HTMLElement, spec: Object, mode: string, cb: (err: any, result: any) => any) {
  const embedSpec = {
    mode,
    spec,
  };

  if (mode === 'vega-lite') {
    embedSpec.spec.config = _.merge({
      cell: {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      }
    }, embedSpec.spec.config);
  }

  vegaEmbed(el, embedSpec, cb);
}

export class VegaEmbed extends React.Component {
  props: EmbedProps;
  el: HTMLElement;

  static defaultProps = {
    renderedCallback: defaultCallback,
    embedMode: 'vega-lite',
  }

  componentDidMount(): void {
    embed(this.el, this.props.data.toJS(), this.props.embedMode, this.props.renderedCallback);
  }

  shouldComponentUpdate(nextProps: EmbedProps): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate(): void {
    embed(this.el, this.props.data.toJS(), this.props.embedMode, this.props.renderedCallback);
  }

  render(): ?React.Element<any> {
    // Note: We hide vega-actions since they won't work in our environment
    return (
      <div>
        <style>{'.vega-actions{ display: none; }'}</style>
        <div ref={(el) => { this.el = el; }} />
      </div>
    );
  }
}

type Props = {
  data: Object,
}

export function VegaLite(props: Props) {
  return (
    <VegaEmbed data={props.data} embedMode="vega-lite" />
  );
}

VegaLite.MIMETYPE = MIMETYPE_VEGALITE;

export function Vega(props: Props) {
  return (
    <VegaEmbed data={props.data} embedMode="vega" />
  );
}

Vega.MIMETYPE = MIMETYPE_VEGA;
