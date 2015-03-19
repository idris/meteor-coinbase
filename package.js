Package.describe({
  name: 'idrism:coinbase',
  version: '0.2.2',
  // Brief, one-line summary of the package.
  summary: 'Coinbase OAuth flow',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/idris/meteor-coinbase',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.2');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('Coinbase');

  api.addFiles(
    ['coinbase_configure.html', 'coinbase_configure.js'],
    'client');

  api.addFiles('coinbase_server.js', 'server');
  api.addFiles('coinbase_client.js', 'client');
});
