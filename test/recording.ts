import {
  setupRecording,
  Recording,
  SetupRecordingInput,
  mutations,
} from '@jupiterone/integration-sdk-testing';

export { Recording };

export function setupOneloginRecording(
  input: Omit<SetupRecordingInput, 'mutateEntry'>,
): Recording {
  return setupRecording({
    ...input,
    redactedRequestHeaders: ['Authorization'],
    redactedResponseHeaders: ['set-cookie'],
    mutateEntry: (entry) => {
      redact(entry);
    },
  });
}

function getRedactedOAuthResponse() {
  //OneLogin responses have a certain structure that the client expects
  return {
    data: [
      {
        access_token: '[REDACTED]',
        created_at: Date.now(),
        expires_in: 9999,
        refresh_token: '[REDACTED]',
        token_type: 'Bearer',
        account_id: 999999,
      },
    ],
  };
}

function redact(entry): void {
  if (entry.request.postData) {
    entry.request.postData.text = '[REDACTED]';
  }

  if (!entry.response.content.text) {
    return;
  }

  //let's unzip the entry so we can modify it
  mutations.unzipGzippedRecordingEntry(entry);

  //we can just get rid of all response content if this was an Oauth token call
  const requestUrl = entry.request.url;
  if (requestUrl.match(/api.us.onelogin.com\/auth\/oauth2\/token/)) {
    entry.response.content.text = JSON.stringify(getRedactedOAuthResponse());
    return;
  }

  //if it wasn't a token call, parse the response text, removing any carriage returns or newlines
  const responseText = entry.response.content.text;
  const parsedResponseText = JSON.parse(responseText.replace(/\r?\n|\r/g, ''));

  entry.response.content.text = JSON.stringify(parsedResponseText);
}
