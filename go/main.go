package main

import (
	"context"
	"fmt"
	"sync"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/peer"

	dht "github.com/libp2p/go-libp2p-kad-dht"
)

func main() {
	// create a background context (i.e. one that never cancels)
	ctx := context.Background()

	// start a libp2p node listening on port 2000
	host, err := libp2p.New(ctx, libp2p.ListenAddrStrings("/ip4/127.0.0.1/tcp/2000"))
	if err != nil {
		panic(err)
	}

	fmt.Println("not really using:", dht.DefaultBootstrapPeers)

	// print the node's listening addresses
	fmt.Println("Listening on addresses:", host.Addrs())

	// Start a DHT
	kad, err := dht.New(ctx, host)
	if err != nil {
		panic(err)
	}

	// Bootstrap it
	if err = kad.Bootstrap(ctx); err != nil {
		panic(err)
	}

	// Let's connect to the bootstrap nodes first. They will tell us about the
	// other nodes in the network.
	var wg sync.WaitGroup
	for _, peerAddr := range dht.DefaultBootstrapPeers {
		peerinfo, _ := peer.AddrInfoFromP2pAddr(peerAddr)
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := host.Connect(ctx, *peerinfo); err != nil {
				fmt.Println(err)
			} else {
				fmt.Println("Connection established with bootstrap node:", *peerinfo)
			}
		}()
	}
	wg.Wait()

	// shut the node down
	if err := host.Close(); err != nil {
		panic(err)
	}
}
