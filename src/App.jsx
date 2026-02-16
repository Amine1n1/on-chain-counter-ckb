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
    <div style={{ padding: 20 }}>
      <h2>Onchain Counter</h2>

      {!wallet && (
        <button onClick={open}>Wallet verbinden</button>
      )}

      {wallet && (
        <>
          <p><b>Address:</b> {address}</p>
          <CreateGenesisCell />
        </>
      )}
      <p>Receiver CKB Address</p>
      <input type="text" id="toAddress" defaultValue="ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2prryvze6fhufxkgjx35psh7w70k3hz7c3mtl4d" style={{ width: "500px" }}/>
      <p>Amount of CKBs</p>
      <input type="number" id="amount" defaultValue={300}/>
      <p><SendCKB /></p>
      <p>Transaction Status: {status}</p>
      <p><ShowCounter/></p>
      <label id="onchainCounter"></label>
    </div>
  );
}

export default App;

