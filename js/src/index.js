// Entry point for the notebook bundle containing custom model definitions.
//
// Setup notebook base URL
//
// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
__webpack_public_path__ = document.querySelector('body').getAttribute('data-base-url') + 'nbextensions/dfedit/';

require('./vendor/slickgrid-2.3.6/slick.grid.css');
require('./vendor/slickgrid-2.3.6/slick-default-theme.css');
require('./vendor/slickgrid-2.3.6/css/smoothness/jquery-ui-1.11.3.custom.css');

require('select2/dist/css/select2.min.css');

require('./dfedit.css');

// Export widget models and views, and the npm package version number.
module.exports = require('./example.js');
module.exports['version'] = require('../package.json').version;
