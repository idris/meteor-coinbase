Coinbase = {
  _server: 'https://www.coinbase.com',
  _sandboxServer: 'https://sandbox.coinbase.com',
  _apiServer: 'https://api.coinbase.com',
  _sandboxApiServer: 'https://api.sandbox.coinbase.com'
};

OAuth.registerService('coinbase', 2, null, function(query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'coinbase'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response = getTokens(config, query);
  var accessToken = response.accessToken;
  var identity = getIdentity(config, accessToken);

  var serviceData = {
    id: identity.id,
    accessToken: OAuth.sealSecret(accessToken),
    expiresAt: (+new Date) + (1000 * response.expiresIn),
    email: identity.email,
    name: identity.name
  };

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken)
    serviceData.refreshToken = OAuth.sealSecret(response.refreshToken);

  return {
    serviceData: serviceData,
    options: { profile: { name: identity.name } }
  };
});

var userAgent = "Meteor";
if (Meteor.release)
  userAgent += "/" + Meteor.release;

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if we got a refresh token from the server
var getTokens = function (config, query) {
  var server = config.sandbox ? Coinbase._sandboxServer : Coinbase._server;

  var response;
  try {
    response = HTTP.post(
      server + '/oauth/token', {
        headers: {
          Accept: 'application/json',
          'User-Agent': userAgent
        },
        params: {
          grant_type: 'authorization_code',
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
          redirect_uri: OAuth._redirectUri('coinbase', config),
          state: query.state
        }
      }
    );
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Coinbase. " + err.message),
                   {response: err.response});
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Coinbase. " + response.data.error);
  } else {
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  }
};

var getIdentity = function (config, accessToken) {
  var server = config.sandbox ? Coinbase._sandboxApiServer : Coinbase._apiServer;

  try {
    return HTTP.get(
      server + '/v1/users/self', {
        headers: {"User-Agent": userAgent},
        params: {access_token: accessToken}
      }).data.user;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Coinbase. " + err.message),
                   {response: err.response});
  }
};


Coinbase.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
