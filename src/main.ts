let Libp2p = require("libp2p");
let WebSockets = require("libp2p-websockets");
let { NOISE } = require("libp2p-noise");
let MPLEX = require("libp2p-mplex");

let Bootstrap = require("libp2p-bootstrap");

// Known peer addresses
let bootstrapMultiaddrs = [
  "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt"
];

async function main() {
  let node = await Libp2p.create({
    modules: {
      transport: [WebSockets],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
      peerDiscovery: [Bootstrap]
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        [Bootstrap.tag]: {
          enabled: true,
          list: bootstrapMultiaddrs
        }
      }
    }
  });

  node.on("peer:discovery", (peerId: any) => {
    console.log("Discovered %s", peerId.toB58String()); // Log discovered peer
  });

  node.connectionManager.on("peer:connect", (connection: any) => {
    console.log("XXX");
    console.log("Connected to %s", connection.remotePeer.toB58String()); // Log connected peer
  });

  // start libp2p
  await node.start();
}

main();
