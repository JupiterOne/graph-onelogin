# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Do not fail UserApps step when user has no apps assigned

## 2.2.12 - 2021-09-14

### Fixed

- Always create `onelogin_user` **ASSIGNED** `mfa_device` relationship even if
  we've already seen the same `mfa_device`

## 2.2.11 - 2021-09-13

### Fixed

- Prevent duplicate `mfa_device` entity `_key`

## [2.2.10] 2021-09-08

### Fixed

- Changed source entity key for `onelogin_user` to `aws_iam_role` mapped
  relationship to use generate key function. This was causing mapped
  relationship creation to fail.

## [2.2.9] 2021-09-03

### Added

- Added logs for mapped relationships that are being created to AWS roles.

## [2.2.8] 2021-09-03

### Added

- Application Rules now respect conditions based on OneLogin Role, Group, or
  MemberOf (Active Directory security group) properties

## [2.2.7] 2021-09-01

### Added

- Application Rules are now Configuration entities in the graph

### Changed

- AWS IAM Role ARNs are now expected via Application Rules instead of user
  attributes

## [2.2.6] 2021-08-27

### Added

- Added raw data to entities to enhance troubleshooting

## [2.2.5] 2021-08-27

### Changed

- Changed logs to note any ARNs found, not just successful relationships
  created.
- Updated regex to look for ARN case insensitive

## [2.2.4] 2021-08-26

### Changed

- Changed AWS IAM role scannning to look for ARNs in any user property.
- Removed logs intended to investigate AWS role binding

## [2.2.3] 2021-08-25

### Changed

- Changed Role binding logs to be more targeted to AWS application.

## [2.2.2] 2021-08-24

### Changed

- Changed Role binding logs from trace to info so they can be viewed

## [2.2.1] 2021-08-23

### Added

- Added log traces for Role binding

## [2.2.0] 2021-08-23

### Added

- Mapping Onelogin users to AWS roles, if an AWS application in OneLogin has the
  Role parameter defined to point to a user attribute and the AWS Role already
  exists in the J1 graph.

## [2.1.1] 2021-08-05

### Fixed

- Passed hostname through `APIClient` to `OneLoginClient`.

## [2.1.0] 2021-08-05

### Added

- Added the ability to pass a different API hostname (e.g.
  `https://api.eu.onelogin.com`) to fetch data from different OneLogin
  environments.

### Fixed

- Fixed an issue introduced in 2.0.2 that inadvertantly stopped referencing the
  `authToken` returned from the `/oauth2/token` call.

## 2.0.2 - 2021-08-03

### Added

- Added tests for `validateInvocation()` function.

### Fixed

- Previously, validation errors passed through the client had their `status` and
  `statusText` values obscured, thus showing `undefined undefined` in user job
  logs. Fixed errors to show proper `status` and `statusText`, such as
  `401 Unauthorized`.

## 2.0.1 - 2021-07-28

### Fixed

- Fixed `UPLOAD_ERROR` with error `NOT_ALLOWED` caused by `_icon` property on
  app and personal app entities. Removed the `_icon` property as it is not
  allowed to be an underscore property.

## 2.0.0 - 2021-07-27

### Changed

- Rewrite of the integration in the new SDK. This forced some small changes to
  entity properties because underscores are no longer supported. The affected
  properties were `login_id` in personal app entities, `connector_id` in
  application entities, and the prefix `custom_attribute` for custom user
  properties. These were changed to `loginId`, `connectorId` and
  `customAttribute` respectively.

## 1.1.0 - 2021-05-12

### Added

- Added `onelogin_user.custom_attributes.*` to ingest any/all defined custom
  attributes for onelogin users.

## 1.0.11 - 2021-04-28

### Fixed

- Fixed client pagination on `/groups`, `/roles`, and `/apps` endpoints.

## 1.0.10 - 2021-04-26

### Added

- Added logger.info statements throughout the project.
