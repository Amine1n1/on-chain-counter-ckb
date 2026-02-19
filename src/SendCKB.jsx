import { ccc } from "@ckb-ccc/connector-react";
import CKB from "@nervosnetwork/ckb-sdk-core";
import { hashTypeToBytes } from "@ckb-ccc/core";
import scripts from "./deployment/scripts.json";
import systemScripts from "./deployment/system-scripts.json";
import { setTxHash, getTxHash } from "./Outpoint";
import { setTxStatus , getTxStatus} from "./TxState"
import "./App.css"


export default function SendCKB() {
  const signer = ccc.useSigner();

  //const txHashPrev = getTxHash();

  const status = getTxStatus();

  //console.log(txHashPrev);


  /*const toAddress = "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2prryvze6fhufxkgjx35psh7w70k3hz7c3mtl4d";*/


  //const amount = 200n * 10n ** 8n;
  //const amount = 200;

  const send = async () => {
    if (!signer) return;

  try{
    setTxStatus("sending");

    const address = await signer.getRecommendedAddress();

    const ckb = new CKB("https://testnet.ckb.dev");

    //const ckb = new CKB("http://127.0.0.1:8114");

    const storageAvailable = isStorageAvailable();
    let txHashPrev = "";

    if (storageAvailable){
      txHashPrev = localStorage.getItem("outpointCounter");
    } else {
      txHashPrev = window.__memoryStore["outpointCounter"];
    }


    const counterCell = await ckb.rpc.getLiveCell(
      {
        txHash: txHashPrev,
        index: "0x0",
      },
    true
    );

    const toAddress = document.getElementById("toAddress").value;

    const amount = document.getElementById("amount").value;

    const capacityHex = counterCell.cell.output.capacity;
    const shannons = BigInt(capacityHex);

    //console.log(shannons / 10n**8n);
    const amountCounter = shannons / 10n**8n;

    const dataCounterHex = counterCell.cell.data.content;

    //console.log(dataCounterHex);

    let dataCounter = hexToInt(dataCounterHex);

    //console.log(dataCounter);

    dataCounter = dataCounter + 1;
    
    const dataCounterView = dataCounter;

    //console.log(dataCounter);

    dataCounter = intToHexAscii(dataCounter);


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
    const lockReceiver = ckb.utils.addressToScript(toAddress);

    const inputs = [
      {
        previousOutput: {
          txHash: txHashPrev,
          index: "0x0",
        },
        since: 0x0,
      },
    ];


    const tx = ccc.Transaction.from({
      inputs,
        outputs: [
          { lock: lock , capacity: shannons, type: mainScript},
          { lock: lockReceiver, capacity: ccc.fixedPointFrom(amount)},
        ],
        outputsData: [
          ccc.hexFrom(dataCounter),
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
        
        //console.log(getTxStatus());
    
        console.log("Transaction sent! TX Hash:", txHash);
        const stateTx = await waitForCommit(txHash);

        setTxHash(txHash);
        alert("TX Hash: " + txHash);
        setTxStatus("committed");


        if (storageAvailable) {
          localStorage.setItem("outpointCounter", txHash);
          localStorage.setItem("txstatus","committed");
        } else {
          window.__memoryStore = window.__memoryStore || {};
          window.__memoryStore["outpointCounter"] = txHash;
          window.__memoryStore["txstatus"] = "committed";
        }
      
  } catch (error) {
    const storageAvailable = isStorageAvailable();
    setTxStatus("rejected");
    if (storageAvailable) {
        localStorage.setItem("txstatus","rejected");
      } else {
        window.__memoryStore = window.__memoryStore || {};
          window.__memoryStore["txstatus"] = "rejected";
      }
  }
        //console.log(getTxStatus());
  };

  return <button className="GenCell" disabled={status !== "committed" && status !== "rejected"} onClick={send}>Send CKB</button>;
}

function hexToInt(hex) {
  // Falls 0x30 → String '0'
  if (hex.startsWith("0x")) hex = hex.slice(2);

  // Hex → Bytes
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));

  // Bytes → String
  const str = new TextDecoder().decode(bytes);

  // String → Number
  return parseInt(str, 10);
}

function intToHexAscii(n) {
  // Zahl → String → charCode → Hex
  const str = n.toString();
  const hex = Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
  return '0x' + hex;
}

async function waitForCommit(txHash) {
  const ckb = new CKB("https://testnet.ckb.dev");
  while (true) {
    const tx = await ckb.rpc.getTransaction(txHash);

    if (tx?.txStatus?.status === "committed") {
      return tx;
    }

    await new Promise(r => setTimeout(r, 3000)); // Wait 3s
  }
}

function isStorageAvailable() {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
