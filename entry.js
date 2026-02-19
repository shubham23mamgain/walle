// Custom entry to avoid "linking in multiple places" with expo-dev-client.
// In development we disable expo-router's linking so only the dev client handles links.
import '@expo/metro-runtime';

import React from 'react';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { ExpoRoot } from 'expo-router/build/ExpoRoot';
import { Head } from 'expo-router/build/head';
// Must use exact string 'expo-router/_ctx' for Metro resolver (see qualified-entry)
const { ctx } = require('expo-router/_ctx');

require('expo-router/build/fast-refresh');

function App() {
  return (
    <Head.Provider>
      <ExpoRoot
        context={ctx}
        linking={
          typeof __DEV__ !== 'undefined' && __DEV__
            ? { enabled: false }
            : undefined
        }
      />
    </Head.Provider>
  );
}

renderRootComponent(App);
