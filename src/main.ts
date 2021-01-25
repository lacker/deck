let Libp2p = require("libp2p");
let TCP = require("libp2p-tcp");
import { NOISE } from "libp2p-noise";
let MPLEX = require("libp2p-mplex");
let multiaddr = require("multiaddr");

async function main() {
  let node = await Libp2p.create({
    addresses: {
      listen: ["/ip4/127.0.0.1/tcp/0"]
    },
    modules: {
      connEncryption: [NOISE],
      transport: [TCP]
    }
  });

  await node.start();
  console.log("libp2p started");

  console.log("listening");
  node.multiaddrs.forEach((addr: any) => {
    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`);
  });

  await node.stop();
  console.log("stopped");
}

console.log("running main");
main();
console.log("eof");
