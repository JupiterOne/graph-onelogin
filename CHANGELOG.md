# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
