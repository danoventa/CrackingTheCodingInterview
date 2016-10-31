/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

const vegaEmbed = require('vega-embed');

const MIMETYPE_VEGA = 'application/vnd.vega+json';
const MIMETYPE_VEGALITE = 'application/vnd.vegalite+json';

type EmbedProps = {
  data: Object,
  embedMode: string,
};

export class VegaEmbed extends React.Component {
  props: EmbedProps;
  el: HTMLElement;

  componentDidMount(): void {
    const spec = this.props.data.toJS();

    const embedSpec = {
      mode: this.props.embedMode,
      spec,
    };

    vegaEmbed(this.el, embedSpec, (error: any, result: any): any => {
    });
  }

  shouldComponentUpdate(): boolean {
    return false;
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(el) => { this.el = el; }} />
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
