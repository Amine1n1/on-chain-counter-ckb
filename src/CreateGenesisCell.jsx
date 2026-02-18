import { ccc } from "@ckb-ccc/connector-react";
import CKB from "@nervosnetwork/ckb-sdk-core";
import { hashTypeToBytes } from "@ckb-ccc/core";
import scripts from "./deployment/scripts.json";
import systemScripts from "./deployment/system-scripts.json";
import { setTxHash, getTxHash } from "./Outpoint";
import { setTxStatus , getTxStatus} from "./TxState"
import "./App.css"


export default function CreateGenesisCell() {
  const signer = ccc.useSigner();

  const data_output = '0x30';
  const status = getTxStatus();

  const createGenesis = async () => {
    if (!signer) return;

    try{
    const address = await signer.getRecommendedAddress();

    const ckb = new CKB("https://testnet.ckb.dev");

    //const ckb = new CKB("http://127.0.0.1:8114");




    const ckbJsVmScript = systemScripts.testnet["ckb_js_vm"];
    const contractScript = scripts.testnet["counter.bc"];

    const mainScript = {
      codeHash: ckbJsVmScript.script.codeHash,
      hashType: ckbJsVmScript.script.hashType,
      args: ccc.hexFrom(
        "0x0000" +
          contractScript.codeHash.slice(2) +
          ccc.hexFrom(hashTypeToBytes(contractScript.hashType)).slice(2) +
          "0000000000000000000000000000000000000000000000000000000000000000"
      ),
    };

    const lock = ckb.utils.addressToScript(address);

    const amount = 200n * 10n ** 8n;


    const tx = ccc.Transaction.from({
        outputs: [
          { lock: lock, capacity: amount, type: mainScript},
        ],
        outputsData: [
          ccc.hexFrom(data_output),
        ],
        cellDeps: [
          ...ckbJsVmScript.script.cellDeps.map(c => c.cellDep),
          ...contractScript.cellDeps.map(c => c.cellDep),
        ]
      });
    
        await tx.completeInputsByCapacity(signer);
        await tx.completeFeeBy(signer, 1000n);
    
        //const signedTx = await signer.signTransaction(tx);
        const txHash = await signer.sendTransaction(tx);
        setTxStatus("pending");

    
        console.log("Transaction sent! TX Hash:", txHash);

        setTxHash(txHash);
        await waitForCommit(txHash);
        setTxStatus("committed");
        localStorage.setItem("outpointCounter", txHash);
        localStorage.setItem("txstatus","committed");

    } catch (error){
      setTxStatus("rejected");
      localStorage.setItem("txstatus","rejected");
    } 

  };

  return <button className="GenCell" onClick={createGenesis} disabled={status !== "committed" && status !== "idle" && status !== "rejected"}>Create Genesis Counter Cell</button>;
  
}

async function waitForCommit(txHash) {
  const ckb = new CKB("https://testnet.ckb.dev");
  while (true) {
    const tx = await ckb.rpc.getTransaction(txHash);

    if (tx?.txStatus?.status === "committed") {
      return tx;
    }

    await new Promise(r => setTimeout(r, 3000)); // 3s warten
  }
}
