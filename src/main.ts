let Libp2p = require("libp2p");
let Bootstrap = require("libp2p-bootstrap");
let Mplex = require("libp2p-mplex");
let { NOISE } = require("libp2p-noise");
let TCP = require("libp2p-tcp");

let BOOTSTRAP_ADDRS = [
  "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt"
];

function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  let node = await Libp2p.create({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"]
    },
    modules: {
      connEncryption: [NOISE],
      transport: [TCP],
      streamMuxer: [Mplex],
      peerDiscovery: [Bootstrap]
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        bootstrap: {
          interval: 60e3,
          enabled: true,
          list: BOOTSTRAP_ADDRS
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

  await sleep(600);
  await node.stop();
  console.log("stopped");
  process.exit();
}

console.log("running main");
main();
