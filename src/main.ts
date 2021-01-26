let Libp2p = require("libp2p");
let TCP = require("libp2p-tcp");
import { NOISE } from "libp2p-noise";
let MPLEX = require("libp2p-mplex");
let multiaddr = require("multiaddr");
let Bootstrap = require("libp2p-bootstrap");

let BOOTSTRAP_MULTIADDRS = [
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN"
];

function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  let node = await Libp2p.create({
    addresses: {
      listen: ["/ip4/127.0.0.1/tcp/0"]
    },
    modules: {
      connEncryption: [NOISE],
      transport: [TCP],
      streamMuxer: [MPLEX],
      peerDiscovery: [Bootstrap]
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        [Bootstrap.tag]: {
          enabled: true,
          list: BOOTSTRAP_MULTIADDRS
        }
      }
    }
  });

  node.on("peer:discovery", (peer: any) => {
    console.log("Discovered", peer.id.toB58String());
  });

  node.connectionManager.on("peer:connect", (connection: any) => {
    console.log("Connected to", connection.remotePeer.toB58String());
  });

  await node.start();
  console.log("libp2p started");

  node.multiaddrs.forEach((addr: any) => {
    console.log(
      `listening on ${addr.toString()}/p2p/${node.peerId.toB58String()}`
    );
  });

  await sleep(10);
  await node.stop();
  console.log("stopped");
  process.exit();
}

console.log("running main");
main();
