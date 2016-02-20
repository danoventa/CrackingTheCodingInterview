import React from 'react';

import { expect } from 'chai';

import * as commutable from 'commutable';

import {
  renderIntoDocument,
} from 'react-addons-test-utils';

import Notebook from '../../src/components/notebook';

const nb = commutable.fromJS({
  'cells': [
    {
      'cell_type': 'markdown',
      'metadata': {},
      'source': [
        '## The Notable Nteract Notebook\n',
        '\n',
        '**It\'s a notebook!**\n',
      ],
    },
    {
      'cell_type': 'code',
      'execution_count': 11,
      'metadata': {
        'collapsed': false,
      },
      'outputs': [
        {
          'data': {
            'text/html': [
              '<h1>Multiple</h1>',
            ],
            'text/plain': [
              '<IPython.core.display.HTML object>',
            ],
          },
          'metadata': {},
          'output_type': 'display_data',
        },
      ],
      'source': [
        'import IPython\n',
        '\n',
        'from IPython.display import HTML\n',
        'from IPython.display import Markdown\n',
        'from IPython.display import display\n',
        '\n',
        'display(HTML(\'<h1>Multiple</h1>\'))\n',
        'display(HTML(\'<p>Display Elements</p>\'))\n',
        'display(Markdown(\'**awesome**\'))\n',
        '\n',
        'print(\'hey\')\n',
        '42',
      ],
    },
  ],
  'metadata': {
    'kernelspec': {
      'display_name': 'Python 3',
      'language': 'python',
      'name': 'python3',
    },
    'language_info': {
      'codemirror_mode': {
        'name': 'ipython',
        'version': 3,
      },
      'file_extension': '.py',
      'mimetype': 'text/x-python',
      'name': 'python',
      'nbconvert_exporter': 'python',
      'pygments_lexer': 'ipython3',
      'version': '3.5.1',
    },
  },
  'nbformat': 4,
  'nbformat_minor': 0,
});

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    const component = renderIntoDocument(
      <Notebook notebook={nb} />
    );
    expect(component).to.not.be.null;
  });
});
