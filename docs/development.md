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

## Mapping Onelogin users to AWS Roles

In Onelogin, an application may have parameters defined to support Single
Sign-On. AWS applications often have a parameter Roles, which maps to an AWS
Role when the user logs on to AWS through Onelogin.

In the Onelogin administration page, the application can be configured to draw
the AWS Role from any user attribute. If this is defined, this integration can
use that user attribute to attempt to map an existing user to an AWS Role
already defined in the JupiterOne graph.

For the most part, this is accomplished by taking a property from the AWS
application in OneLogin as the property name on the user, and considering that
value to be the AWS role name. For example, the AWS application might have
`parameters: { 'https://aws.amazon.com/SAML/Attributes/Role': { user_attribute_mappings: custom_attribute_AWS_Role }}`,
in which case, you can get a user's AWS Role from the property
`custom_attribute_AWS_Role` on that user.

However, there is a little special handling if OneLogin is configured to pass
OneLogin's roles as AWS Roles, because OneLogin stores an array called `role_id`
(wish that was `role_ids`, but it's not) on their user entity, which then have
to be cross-referenced to OneLogin roles to get the actual role names to pass to
AWS. Specifically, if the AWS application is configured with
`parameters: { 'https://aws.amazon.com/SAML/Attributes/Role': { user_attribute_mappings: roles }}`,
you have to get the user's `role_id` array and look up each role by id number to
get the role name that will be passed to AWS.

To facilitate that, the application pre-processes role id's for each user and
assigns a `roles` property on the user entity in the J1 graph that is a
semicolon delimited string of OneLogin role names.
