import CKB from "@nervosnetwork/ckb-sdk-core";
import { setTxHash, getTxHash } from "./Outpoint";
import { setTxStatus , getTxStatus} from "./TxState"

export default function ShowCounter() {

  const ckb = new CKB("https://testnet.ckb.dev");
  const status = getTxStatus();

  //const txHashPrev = getTxHash();

  const txHashPrev = localStorage.getItem("outpointCounter");

  //console.log(txHashPrev);
  const show = async () => {
  const counterCell = await ckb.rpc.getLiveCell(
      {
        txHash: txHashPrev,
        index: "0x0",
      },
    true
    );

    const dataCounterHex = counterCell.cell.data.content;

    const dataCounter = hexToInt(dataCounterHex);

    document.getElementById("onchainCounter").innerHTML= dataCounter;
  };
    return <button className="GenCell" disabled={status !== "committed" && status !== "rejected"} onClick={show}>show transactions on-chain-counter</button>;
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