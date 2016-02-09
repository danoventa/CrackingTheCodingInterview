/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

function msgSpecToNotebookFormat(msg) {
  // This could all be done with an Object.assign too. For the moment I'm being
  // explicit here.

  const output = {
    output_type: msg.header.msg_type,
  };

  switch(msg.header.msg_type) {
  // execute result and display data share most of their format, except for
  // the execution count
  case 'execute_result':
    output.execution_count = msg.content.execution_count;
  case 'display_data':
    output.data = msg.content.data;
    output.metatdata = msg.content.metadata;
    return output;
  case 'stream':
    output.name = msg.content.name;
    output.text = msg.content.text;
    return output;
  case 'error':
    output.ename = msg.content.ename;
    output.evalue = msg.content.evalue;
    output.traceback = msg.content.traceback;
    return output;
  default:
    throw new Error(`msg_type ${msg.header.msg_type} not supported for conversion to nbformat`);
  }
}

export function scanOutputs(observable, originalOutputs) {
  return observable
    .ofMessageType(['execute_result', 'display_data', 'stream', 'error'])
    .map(msgSpecToNotebookFormat)
    .scan((outputs, output) => {
      return outputs.push(output);
    }, originalOutputs);
}
