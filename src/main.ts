console.log("hello world");

let Libp2p = require("libp2p");
let WebSockets = require("libp2p-websockets");
import { NOISE } from "libp2p-noise";

async function main() {
  let node = await Libp2p.create({
    modules: {
      connEncryption: [NOISE],
      transport: [WebSockets]
    }
  });
}

main();
