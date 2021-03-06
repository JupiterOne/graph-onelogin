import {
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { OneLoginClient } from "./onelogin";

/**
 * Performs validation of the execution before the execution handler function is
 * invoked.
 *
 * At a minimum, integrations should ensure that the `context.instance.config`
 * is valid. Integrations that require additional information in
 * `context.invocationArgs` should also validate those properties. It is also
 * helpful to perform authentication with the provider to ensure that
 * credentials are valid.
 *
 * The function will be awaited to support connecting to the provider for this
 * purpose.
 *
 * @param context
 */
export default async function invocationValidator(
  context: IntegrationValidationContext,
) {
  const { instance, logger } = context;
  const { config } = instance;
  if (!config.clientId || !config.clientSecret) {
    throw new IntegrationInstanceConfigError(
      "config requires all of { clientId, clientSecret }",
    );
  }

  const provider = new OneLoginClient(
    config.clientId,
    config.clientSecret,
    logger,
  );

  logger.info("Validating OneLoginClient with provided credentials");
  try {
    await provider.authenticate();
  } catch (err) {
    throw new IntegrationInstanceAuthenticationError(err);
  }
}
