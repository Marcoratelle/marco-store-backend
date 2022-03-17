# Application file structure
## /
* `package.json`
The application `npm` configuration file
* `Dockerfile`
The docker configuration file
* `.npmignore`
Lists files and directory to exclude when publishing an npm module
* `.node-version`
The node version to be used to run the application.  Useful when using [NVM](https://github.com/creationix/nvm) with [AVN](https://github.com/wbyoung/avn)
* `.gitignore`
Lists file to exclude from the Git repository
* `.eslint`
Code linting rules (based on AirBnb's) using the ESlint linter. Available for [Sublime](https://github.com/roadhump/SublimeLinter-eslint),  [Atom](https://atom.io/packages/eslint) and [VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* `.eslintignore`
Lists files and folders to exclude when linting
* `.env`
* `.editorconfig`
The universal editor configuration file ([EditorConfig](http://editorconfig.org/)).  Plugin available for [Sublime](https://github.com/sindresorhus/editorconfig-sublime), [Atom](https://github.com/sindresorhus/atom-editorconfig) and [VSCode](https://github.com/editorconfig/editorconfig-vscode)
* `.cfignore`
## /config - application configuration files
Note that configurations that are contextual to a runtime environment don't belong in this file but should be exposed as environment variables instead.
* `/swagger/api.yaml`
The api swagger file definition.  When creating a resource `yo express:resource <resource name>`, each end point generated will be added to the `api.yaml` definition.
## /coverage - created when tests are ran
Istanbul coverage report files
* `index.html`
Entry point for the html coverage report
## /docs
markdown documents to complement the `/README.md` file
## /public
UI static files, currently only used by Swagger UI
## /server
* `/api/resources/<resource name>/*-controller.js`
The generated resource controller class that exposes default CRUD methods as express middlewares:
  * `GET /<plural resource name>` -> `list()`
  * `GET /<plural resource name>/:id` -> `show()`
  * `POST /<plural resource name>` -> `create()`
  * `DELETE /<plural resource name>/:id` -> `delete()`
  * `PUT /<plural resource name>/:id` -> `update()`
Those middleware should only concerned with input parameters transformations and response transformations.  No business logic should be part of a controller.  Business logic should be defined in services.
* `/api/resources/<resource name>/*-router.js`
Router that maps REST end points of a resource to their corresponding controller methods.
This file shouldn't have to be modified unless some end points should be removed.
* `/api/services`
Services in which the business logic should be defined.  By default when generating a resource, a corresponding service will also be generated.  Most likely, coss cutting concerns services will need to be defained eg: DebitService that would operate on account and user resources.  This is why services are not generated under /server/api/resources/<resource name>/ path.
* `/common`
Common and utility modules should be placed here
  * `env.js` binds configurations stored in `/.env` to environment variables
  * `http-status-error.js` custom error used when returning a non `2xx` http status code (see generated controllers)
  * `server.js` the express server configuration and setup
  * `swagger.js` the swagger middleware configuration and setup
* `/index.js` chains the instantiation of the express server, binding of the swagger middleware and the binding of routes
* `/routes.js` registers routes defined in `/server/api/resources/<resource name>/*-router.js
## /test
* `/unit`
Unit tests should be defined here.  Unit tests should not access external services like a database or web service.  Those should be mocked or stubbed when necessary
* `/unit/api/<resource name>`
API unit tests should be defined here.  Useful for http requests / responses validation tests
* `/unit/data`
Any mocks or data-faker definition files should be saved here.  Avoid having mock data within test suites.
* `/utils`
Test utility modules should be defined here
* `/utils/test-bootstrap.js`
Utility module that provides setup and teardown reusable logic
