const requireAll = require('require-all');
const _ = require('lodash');
const path = require('path');

module.exports = (app) => {
  const routeModules = requireAll({
    dirname: path.resolve(process.cwd(), 'server/api/resources'),
    filter: /.*-router\.js$/,
    excludeDirs: /^\.(git|svn)$/,
    recursive: true,
  });

  _.forEach(routeModules, (routeModuleMeta) => {
    _.forEach(_.values(routeModuleMeta), (routeModule) => {
      if (routeModule.prefix != null) {
        app.use(`/api/v1/${routeModule.prefix}`, routeModule.router);
      }
    });
  });
};
