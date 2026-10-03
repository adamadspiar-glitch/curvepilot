"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair, PublicKey } from "@solana/web3.js";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";

export default function DbcLaunchButton({ name, symbol, uri }: { name: string; symbol: string; uri: string }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [status, setStatus] = useState("");

  async function launch() {
    if (!wallet.publicKey || !wallet.sendTransaction) return setStatus("Connect a Solana wallet first.");
    const configAddress = process.env.NEXT_PUBLIC_DBC_CONFIG_PUBKEY;
    if (!configAddress) return setStatus("DBC config is not configured. Add NEXT_PUBLIC_DBC_CONFIG_PUBKEY.");
    try {
      setStatus("Building Meteora DBC pool transaction...");
      const client = new DynamicBondingCurveClient(connection, "confirmed");
      const baseMint = Keypair.generate();
      const tx = await client.creator.createPool({
        name, symbol, uri, payer: wallet.publicKey, poolCreator: wallet.publicKey,
        config: new PublicKey(configAddress), baseMint
      });
      const signature = await wallet.sendTransaction(tx, connection, { signers: [baseMint] });
      await connection.confirmTransaction(signature, "confirmed");
      setStatus(`DBC pool created: ${signature}`);
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "DBC launch failed.");
    }
  }

  return <div style={{display:"grid",gap:10}}>
    <WalletMultiButton />
    <button onClick={launch} disabled={!wallet.publicKey} style={{padding:"13px 16px",borderRadius:11,border:0,background:wallet.publicKey?"#111":"#aaa",color:"#fff",cursor:wallet.publicKey?"pointer":"not-allowed"}}>Launch via Meteora DBC</button>
    {status && <div style={{fontSize:12,wordBreak:"break-word",opacity:.7}}>{status}</div>}
  </div>;
}
