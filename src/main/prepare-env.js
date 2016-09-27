import { exec } from 'child_process';
import Rx from 'rxjs/Rx';

const observeExec = Rx.Observable.bindNodeCallback(exec);
const env$ = observeExec('env', {
  cwd: process.cwd(),
  env: process.env
});

let i = 0;
function parseEnv(stdout) {
  const env = stdout
    .reduce((acc, str) => {
      str
        .split('\n')
        .filter(Boolean)
        .forEach(line => {
          const envVar = line.split('=');

          if (envVar.length === 2) {
            acc[envVar[0]] = envVar[1];
          }
        });

      return acc;
    }, {});

  Object.assign(process.env, env);
  console.log(process.env.PATH);

  return env;
}

const prepareEnv = env$
  .first()
  .map(parseEnv)
  .publishReplay(1);

prepareEnv.connect();

export default prepareEnv;

