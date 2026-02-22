import { ccc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";
import CreateGenesisCell from "./CreateGenesisCell";
import SendCKB from "./SendCKB";
import ShowCounter from "./OnchainCounter";
import { subscribeTxStatus, getTxStatus } from "./TxState"


function App() {
  const { open, wallet } = ccc.useCcc();
  const signer = ccc.useSigner();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState(getTxStatus());

  useEffect(() => {
    if (!signer) return;
    signer.getRecommendedAddress().then(setAddress);
  }, [signer]);

  useEffect(() => {
    return subscribeTxStatus(setStatus);
  }, []);

  return (
    <div style={{ padding: 20}}>
      <h2 className="Header">On-Chain Counter</h2>

      {!wallet && (
        <button onClick={open}>Connect Wallet</button>
      )}

      {wallet && (
        <>
          <p className="Par"><b>Address:</b> {address}</p>
          <CreateGenesisCell />
        </>
      )}
      <p className="Par"><b>Receiver CKB Address</b></p>
      <input type="text" id="toAddress"  style={{ width: "500px" }} placeholder="type the recipient's address"/>
      <p className="Par"><b>Amount of CKBs</b></p>
      <input type="number" id="amount" placeholder="type the amount of ckb"/>
      <p><SendCKB /></p>
      <p className="Par"><b>Transaction Status: </b>{status}</p>
      <p><ShowCounter/></p>
      <label className="Par" id="onchainCounter"></label>
    </div>
  );
}

export default App;

