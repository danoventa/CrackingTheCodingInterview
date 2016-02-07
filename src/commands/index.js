const commands = [];

/**
 * Register a command
 * @param  {object}   command
 * @param  {string}   command.name           name of the command, must be unique
 * @param  {function} command.callback       function to execute
 * @param  {string}   [command.help]         help string for the command
 * @param  {string}   [command.accelerator]  name of the command plus an
 *                                           accelerator which allows the
 *                                           command to be accessed quickly via
 *                                           the keyboard when it's in a menu.
 *                                           The accelerator is specified using
 *                                           a '&' character.  i.e. '&File'
 */
export function registerCommand(command) {
  if (!command) throw new Error('Command not specified');
  if (!command.name) throw new Error('A command must have a name');
  if (!command.callback) throw new Error('A command must have a callback');

  // Don't allow callers to accidentally overwrite commands.  They will need to
  // be explicit and call unregister command first.
  if (get(command.name)) {
    throw new Error(command.name + ` is already registered.  If you need to
      overwrite it, call unregisterCommand to remove the existing one first.`);
  }

  commands.push(command);
}

/**
 * Unregisters a command by name
 * @param  {string} name name of the command to unregister
 * @return {object}      command object registered using registerCommand
 */
export function unregisterCommand(name) {
  if (!name) throw new Error('Command name not specified');
  let index = _find(name);
  if (index !== -1) {
    return commands.splice(index, 1)[0];
  }
}

/**
 * Find a command's index by name
 * @param  {string} name command name
 * @return {number}      index of the command in the internal command array
 */
function _find(name) {
  for (let i = 0; i < commands.length; i++) {
    if (commands[i].name === name) {
      return i;
    }
  }
  return -1;
}

/**
 * Gets a command by name
 * @param  {string} name
 * @return {object}       command object registered using registerCommand
 */
export function get(name) {
  let index = _find(name);
  if (index !== -1) {
    return commands[index];
  }
}

/**
 * Convenience function for invoking a command by name
 * @param  {string} name command name
 * @return {any}         return value from the command callback
 */
export function invoke(name) {
  let command = get(name);
  if (command) {
    return command.callback();
  }
}
