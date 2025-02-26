const next = require('next');
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

exports.handler = async (event, context) => {
  await app.prepare();
  const { path } = event;
  return new Promise((resolve, reject) => {
    handle(event, context, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
