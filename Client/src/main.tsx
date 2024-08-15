import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import persistStore from 'redux-persist/es/persistStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './redux/store.ts'
import './index.css'
import App from './App.tsx'

// Create a client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
        <Provider store={store}>
        <PersistGate loading={null} persistor={persistStore(store)}>
        <QueryClientProvider client={queryClient}>
        <App/>
        </QueryClientProvider>
        <Toaster/>
        </PersistGate>
      </Provider> 
  </React.StrictMode>,
)