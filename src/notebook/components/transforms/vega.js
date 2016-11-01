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

export class VegaEmbed extends React.Component {
  props: EmbedProps;
  el: HTMLElement;

  static defaultProps = {
    renderedCallback: defaultCallback,
    embedMode: 'vega-lite',
  }

  componentDidMount(): void {
    const spec = this.props.data.toJS();

    const embedSpec = {
      mode: this.props.embedMode,
      spec,
    };

    if (this.props.embedMode === 'vega-lite') {
      spec.config = _.merge({
        cell: {
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
        }
      }, spec.config);
    }

    vegaEmbed(this.el, embedSpec, this.props.renderedCallback);
  }

  shouldComponentUpdate(): boolean {
    return false;
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
