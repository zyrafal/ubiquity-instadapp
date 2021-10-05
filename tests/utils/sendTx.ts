import fetch from "node-fetch";
import { ethers, BigNumber } from "ethers";

type AnswerFetchJson = {
  data?: any;
  result?: any;
  error?: any;
};

async function fetchJson(_url: string, _config: Object = {}): Promise<AnswerFetchJson> {
  let json: AnswerFetchJson = {};
  if (_url) {
    try {
      const res = await fetch(_url, _config);
      // console.log(res);
      json = await res.json();
    } catch (e) {
      console.error("OpenNFTs.fetchJson ERROR", e, _url, json);
      json = { error: e };
    }
  } else {
    const e = "OpenNFTs.fetchJson URL not defined";
    console.error(e);
    json = { error: e };
  }
  // console.log("fetchJson(", _url, _config, ") =>", json);
  return json;
}

async function sendTx(url: string, tx: Object) {
  const req = { jsonrpc: "2.0", method: "eth_sendTransaction", params: [tx], id: 1 };
  const body = JSON.stringify(req);

  const config = {
    method: "POST",
    headers: {
      Accept: "application/json"
    },
    body
  };
  const json: AnswerFetchJson = await fetchJson(url, config);
  // console.log(url, "\n", json);
  return json;
}

async function sendTxEth(url: string, from: string, to: string, value: BigNumber) {
  return sendTx(url, { from, to, value: ethers.utils.hexStripZeros(ethers.utils.hexlify(value)) });
}

export { fetchJson, sendTx, sendTxEth };
export type { AnswerFetchJson };
