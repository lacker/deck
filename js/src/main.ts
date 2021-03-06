let CID = require("cids");
let Libp2p = require("libp2p");
let Bootstrap = require("libp2p-bootstrap");
let GossipSub = require("libp2p-gossipsub");
let KadDHT = require("libp2p-kad-dht");
let { NOISE } = require("libp2p-noise");
let MulticastDNS = require("libp2p-mdns");
let Mplex = require("libp2p-mplex");
let TCP = require("libp2p-tcp");
let WebSockets = require("libp2p-websockets");
let multihashing = require("multihashing-async");
let bytesFromString = require("uint8arrays/from-string");
let stringFromBytes = require("uint8arrays/to-string");

async function makeCID(str: string) {
  let bytes = new TextEncoder().encode("deck:" + str);
  let hash = await multihashing(bytes, "sha2-256");
  let cid = new CID(1, "dag-pb", hash);
  CID.validateCID(cid);
  return cid;
}

// Known peer addresses
let BOOTSTRAP_ADDRS = [
  "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt"
];

async function main() {
  let useMDNS = true;
  let peerDiscovery = [Bootstrap];
  if (useMDNS) {
    peerDiscovery.push(MulticastDNS);
  }

  let node = await Libp2p.create({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"]
    },
    modules: {
      transport: [TCP, WebSockets],
      connEncryption: [NOISE],
      streamMuxer: [Mplex],
      peerDiscovery,
      dht: KadDHT,
      pubsub: GossipSub
    },
    config: {
      peerDiscovery: {
        autoDial: false,
        [Bootstrap.tag]: {
          enabled: true,
          list: BOOTSTRAP_ADDRS
        },
        mdns: {
          interval: 20e3,
          enabled: true
        }
      },
      dht: {
        enabled: true
      }
    }
  });

  node.on("peer:discovery", (peerId: any) => {
    console.log("Discovered %s", peerId.toB58String());
  });

  node.connectionManager.on("peer:connect", (connection: any) => {
    console.log("Connected to %s", connection.remotePeer.toB58String());
  });

  // start libp2p
  await node.start();

  let topic = "pingnet";
  node.pubsub.on(topic, (message: any) => {
    let text = stringFromBytes(message.data);
    console.log(`received: ${text}`);
  });
  await node.pubsub.subscribe(topic);
  setInterval(() => {
    let text = `node ${node.peerId} says hello at ${new Date()}`;
    console.log(`sending to pingnet: ${text}`);
    node.pubsub.publish(topic, bytesFromString(text));
  }, 3000);
}

main();
