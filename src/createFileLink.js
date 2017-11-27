import { ApolloLink, Observable } from 'apollo-link';
import { print } from 'graphql/language/printer';
import has from 'lodash/has';

const throwServerError = (response, result, message) => {
  const error = new Error(message);

  error.response = response;
  error.statusCode = response.status;
  error.result = result;

  throw error;
};

const parseAndCheckResponse = request => response =>
  response
    .json()
    .catch((e) => {
      const parseError = e;
      parseError.response = response;
      parseError.statusCode = response.status;

      throw parseError;
    })
    .then((result) => {
      if (response.status >= 300) {
        // Network error
        throwServerError(
          response,
          result,
          `Response not successful: Received status code ${response.status}`,
        );
      }
      if (!result.hasOwnProperty('data') && !result.hasOwnProperty('errors')) {
        // Data error
        throwServerError(
          response,
          result,
          `Server response was missing for query '${request.operationName}'.`,
        );
      }
      return result;
    });

const defaultHttpOptions = {
  includeQuery: true,
  includeExtensions: false,
};

export default ({ uri, includeExtensions, ...requestOptions } = {}) => {
  const fetcher = fetch;

  return new ApolloLink(operation =>
    new Observable((observer) => {
      const {
        headers,
        credentials,
        fetchOptions = {},
        uri: contextURI,
        http: httpOptions = {},
      } = operation.getContext();
      const {
        operationName, extensions, variables, query,
      } = operation;
      const http = { ...defaultHttpOptions, ...httpOptions };
      const body = { operationName, variables };

      if (includeExtensions || http.includeExtensions) body.extensions = extensions;

      // not sending the query (i.e persisted queries)
      if (http.includeQuery) body.query = print(query);

      let serializedBody;
      try {
        serializedBody = JSON.stringify(body);
      } catch (e) {
        const parseError = new Error(`Network request failed. Payload is not serializable: ${e.message}`);
        parseError.parseError = e;
        throw parseError;
      }

      const myHeaders = {
        accept: '*/*',
      };

      if (has(variables, 'file')) {
        serializedBody = new FormData();
        serializedBody.append('operations', JSON.stringify(body));
        serializedBody.append('file', variables.file);
      } else {
        myHeaders['content-type'] = 'application/json';
      }

      let options = fetchOptions;
      if (requestOptions.fetchOptions) options = { ...requestOptions.fetchOptions, ...options };
      const fetcherOptions = {
        method: 'POST',
        ...options,
        headers: myHeaders,
        body: serializedBody,
      };

      if (requestOptions.credentials) fetcherOptions.credentials = requestOptions.credentials;
      if (credentials) fetcherOptions.credentials = credentials;

      if (requestOptions.headers) {
        fetcherOptions.headers = {
          ...fetcherOptions.headers,
          ...requestOptions.headers,
        };
      }
      if (headers) fetcherOptions.headers = { ...fetcherOptions.headers, ...headers };

      fetcher(contextURI || uri, fetcherOptions)
      // attach the raw response to the context for usage
        .then((response) => {
          operation.setContext({ response });
          return response;
        })
        .then(parseAndCheckResponse(operation))
        .then((result) => {
          // we have data and can send it to back up the link chain
          observer.next(result);
          observer.complete();
          return result;
        })
        .catch((err) => {
          // fetch was cancelled so its already been cleaned up in the unsubscribe
          if (err.name === 'AbortError') return;
          observer.error(err);
        });

      return () => {};
    }));
};
