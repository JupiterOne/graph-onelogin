# Development

Onelogin is a single sign-on provider.

## Prerequisites

The integration uses `fetch` for communicating with the REST API.

## Provider account setup

You can get a free account for 30 days:
[here](https://www.onelogin.com/free-trial). You have to provide a business
email (ie. not gmail).

See ./jupiterone.md for details on provisioning the API connection.

## Authentication

Onelogin uses Oauth2 for authentication. That means a Client ID and Client
Secret are passed to https://api.us.onelogin.com/auth/oauth2/token and then you
get a token. You present that token in an Authorization header on future API
requests (`Authorization: 'Bearer {TOKEN}'`).

Unlike some REST APIs, the specific account you are accessing is not encoded in
the URL of the endpoint. You hit the endpoint (for example,
https://api.us.onelogin.com/api/1/users?after_cursor=) and the results you get
are determined by the access token you presented.

Because the domain of your Onelogin account is irrelevant to the REST API, the
`orgUrl` config variable is only used to generate the `webLink` properties for
your JupiterOne graph entities. The optional `accountName` variable is similar.

Note that `orgUrl` is not optional. Do not include `https://` in `orgUrl`. It
should be in the format `{YOURDOMAIN}.onelogin.com`.
