// import React from 'react';
// import ReactDOM from 'react-dom';
// import "antd/dist/antd.css";
// import './index.css';
// import App from './App';

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { RetryLink } from 'apollo-link-retry'
import { toast } from 'react-toastify';
import { WebSocketLink } from 'apollo-link-ws';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist'
import { DATABASE_IP, SOCKET_IP } from './config'
import App from './App';
import './index.css';

const retry = new RetryLink({ attempts: { max: Infinity } })
const httpLink = new HttpLink({
  uri: `${DATABASE_IP}/graphql`,
});

const wsLink = new WebSocketLink({
  uri: `${SOCKET_IP}/graphql`,
  options: { reconnect: false },
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (kind === 'OperationDefinition' && operation === 'subscription');
  },
  wsLink,
  httpLink,
  retry
);
const signOut = client => {
  localStorage.clear()
  sessionStorage.clear()
  client.resetStore();
};
function stripTypenames(obj, propToDelete) {
  for (const property in obj) {
    if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
      delete obj.property;
      const newData = stripTypenames(obj[property], propToDelete);
      obj[property] = newData;
    } else {
      if (property === propToDelete) {
        delete obj[property];
      }
    }
  }
  return obj;
}

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => {
    const token = localStorage.getItem('token');
    // console.log('token', token);
    if (token) {
      headers = { ...headers, 'token': token };
    }
    return { headers };
  });
  if (operation.variables) {
    operation.variables = stripTypenames(operation.variables, '__typename');
    return forward ? forward(operation) : null;
  }
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      if (message == 'Context creation failed: Your session expired. Sign in again.') {
        signOut(client)
      }
      else if (message != 'Not authenticated as user.') {
        message = message.replace(/"/g, '')
        toast.error(message)
      }
    });
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});


const link = ApolloLink.from([authLink, errorLink, terminatingLink]);

const cache = new InMemoryCache();
const storage = window.localStorage
const waitOnCache = persistCache({ cache, storage })

const client = new ApolloClient({ link, cache });
waitOnCache.then(() => {
  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('root'),
  )
});

