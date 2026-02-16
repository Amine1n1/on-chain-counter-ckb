import { Buffer } from 'buffer'

window.Buffer = Buffer

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ccc } from "@ckb-ccc/connector-react";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ccc.Provider
      defaultClient={new ccc.ClientPublicTestnet()}
      clientOptions={[
        {
          name: "CKB Testnet",
          client: new ccc.ClientPublicTestnet(),
        },
      ]}
    >
      <App />
    </ccc.Provider>
    </StrictMode>
)

