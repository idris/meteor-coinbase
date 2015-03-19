# coinbase

An implementation of the Coinbase OAuth flow. See the [project page](https://www.meteor.com/accounts) on Meteor Accounts for more details.

## Using Coinbase sandbox
To use Coinbase sandbox accounts,
simply set the `sandbox` option in the ServiceConfiguration:
```js
ServiceConfiguration.configurations.upsert(
  { service: 'coinbase' },
  {
    $set: {
      clientId: <COINBASE_SANDBOX_CLIENT_ID>,
      secret: <COINBASE_SANDBOX_SECRET>,
      sandbox: true
    }
  }
);
CoinbaseAccounts._config({ sandbox: true });
```
