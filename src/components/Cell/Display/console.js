import Convert from 'ansi-to-html';

const convert = new Convert({
  escapeXML: true,
  newLine: true,
});

export default function console(text) {
  return convert.toHtml(text);
}
