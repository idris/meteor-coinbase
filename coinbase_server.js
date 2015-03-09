Coinbase = {};

OAuth.registerService('coinbase', 2, null, function(query) {

  var accessToken = getAccessToken(query);
  var identity = getIdentity(accessToken);

  return {
    serviceData: {
      id: identity.id,
      accessToken: OAuth.sealSecret(accessToken),
      email: identity.email
    },
    options: {profile: {name: identity.name}}
  };
});

var userAgent = "Meteor";
if (Meteor.release)
  userAgent += "/" + Meteor.release;

var getAccessToken = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'coinbase'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://coinbase.com/oauth/token", {
        headers: {
          Accept: 'application/json',
          "User-Agent": userAgent
        },
        params: {
          grant_type: 'authorization_code',
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
          redirect_uri: OAuth._redirectUri('coinbase', config),
          state: query.state
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Coinbase. " + err.message),
                   {response: err.response});
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Coinbase. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken) {
  try {
    return HTTP.get(
      "https://api.coinbase.com/v1/users/self", {
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
