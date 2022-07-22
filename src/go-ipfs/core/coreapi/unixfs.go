package coreapi

import (
	"context"
	"fmt"
	"sync"
	//fabric insert youngseok

	"io/ioutil"
	"os"
	"path/filepath"
	"github.com/hyperledger/fabric-sdk-go/pkg/core/config"
	"github.com/hyperledger/fabric-sdk-go/pkg/gateway"

	"strconv"
	"crypto/sha1"
	"encoding/hex"

	cryptoRand "crypto/rand"
	"math"
	"math/big"
	"math/rand"

	//
	"github.com/ipfs/go-ipfs/core"

	"github.com/ipfs/go-ipfs/core/coreunix"

	blockservice "github.com/ipfs/go-blockservice"
	cid "github.com/ipfs/go-cid"
	cidutil "github.com/ipfs/go-cidutil"
	filestore "github.com/ipfs/go-filestore"
	bstore "github.com/ipfs/go-ipfs-blockstore"
	files "github.com/ipfs/go-ipfs-files"
	ipld "github.com/ipfs/go-ipld-format"
	dag "github.com/ipfs/go-merkledag"
	merkledag "github.com/ipfs/go-merkledag"
	dagtest "github.com/ipfs/go-merkledag/test"
	mfs "github.com/ipfs/go-mfs"
	ft "github.com/ipfs/go-unixfs"
	unixfile "github.com/ipfs/go-unixfs/file"
	uio "github.com/ipfs/go-unixfs/io"
	coreiface "github.com/ipfs/interface-go-ipfs-core"
	options "github.com/ipfs/interface-go-ipfs-core/options"
	path "github.com/ipfs/interface-go-ipfs-core/path"
	"log"
)

type UnixfsAPI CoreAPI

var nilNode *core.IpfsNode
var once sync.Once



//fabric_youngseok_add
func populateWallet(wallet *gateway.Wallet) error {
	log.Println("============ Populating wallet ============")
	credPath := filepath.Join(
		"/home/fabric/Hyperledger_Fabric_NFT_TEST/setup/vm1/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp",
	)
	log.Println("youngseok_count_1")
	certPath := filepath.Join(credPath, "signcerts", "cert.pem")
	// read the certificate pem
	log.Println("youngseok_count_2")
	cert, err := ioutil.ReadFile(filepath.Clean(certPath))
	log.Println("youngseok_count_3")
	if err != nil {
		return err
	}
	log.Println("youngseok_count_4")
	keyDir := filepath.Join(credPath, "keystore")
	log.Println("youngseok_count_5")
	// there's a single file in this dir containing the private key
	files, err := ioutil.ReadDir(keyDir)
	log.Println("youngseok_count_6")
	if err != nil {
		return err
	}
	if len(files) != 1 {
		return fmt.Errorf("keystore folder should have contain one file")
	}
	keyPath := filepath.Join(keyDir, files[0].Name())
	key, err := ioutil.ReadFile(filepath.Clean(keyPath))
	if err != nil {
		return err
	}

	identity := gateway.NewX509Identity("Org1MSP", string(cert), string(key))

	return wallet.Put("appUser", identity)
}
func getOrCreateNilNode() (*core.IpfsNode, error) {
	once.Do(func() {
		if nilNode != nil {
			return
		}
		node, err := core.NewNode(context.Background(), &core.BuildCfg{
			//TODO: need this to be true or all files
			// hashed will be stored in memory!
			NilRepo: true,
		})
		if err != nil {
			panic(err)
		}
		nilNode = node
	})

	return nilNode, nil
}

// Add builds a merkledag node from a reader, adds it to the blockstore,
// and returns the key representing that node.
func (api *UnixfsAPI) Add(ctx context.Context, files files.Node, opts ...options.UnixfsAddOption) (path.Resolved, error) {


	options.UnixfsAddOptions_test_youngseok("k")

	log.Println(ctx)

	settings, prefix, err := options.UnixfsAddOptions(opts...)
	if err != nil {
		return nil, err
	}

	cfg, err := api.repo.Config()
	if err != nil {
		return nil, err
	}

	log.Println(settings)

	fmt.Println(settings.Test_youngseok)
	fmt.Println(settings.Digitalzone_nft_minter)
	fmt.Println(settings.Digitalzone_nft_timestamp)
	fmt.Println(settings.Digitalzone_nft_uri)

	fmt.Println(settings.Digitalzone_nft_category)
	fmt.Println(settings.Digitalzone_nft_title)
	fmt.Println(settings.Digitalzone_nft_num)
	fmt.Println(settings.Digitalzone_nft_fcn)

	fmt.Println(settings.Digitalzone_setting)

	// check if repo will exceed storage limit if added
	// TODO: this doesn't handle the case if the hashed file is already in blocks (deduplicated)
	// TODO: conditional GC is disabled due to it is somehow not possible to pass the size to the daemon
	//if err := corerepo.ConditionalGC(req.Context(), n, uint64(size)); err != nil {
	//	res.SetError(err, cmds.ErrNormal)
	//	return
	//}

	if settings.NoCopy && !(cfg.Experimental.FilestoreEnabled || cfg.Experimental.UrlstoreEnabled) {
		return nil, fmt.Errorf("either the filestore or the urlstore must be enabled to use nocopy, see: https://git.io/vNItf")
	}

	addblockstore := api.blockstore
	if !(settings.FsCache || settings.NoCopy) {
		addblockstore = bstore.NewGCBlockstore(api.baseBlocks, api.blockstore)
	}
	exch := api.exchange
	pinning := api.pinning

	if settings.OnlyHash {
		node, err := getOrCreateNilNode()
		if err != nil {
			return nil, err
		}
		addblockstore = node.Blockstore
		exch = node.Exchange
		pinning = node.Pinning
	}

	bserv := blockservice.New(addblockstore, exch) // hash security 001
	dserv := dag.NewDAGService(bserv)

	// add a sync call to the DagService
	// this ensures that data written to the DagService is persisted to the underlying datastore
	// TODO: propagate the Sync function from the datastore through the blockstore, blockservice and dagservice
	var syncDserv *syncDagService
	if settings.OnlyHash {
		syncDserv = &syncDagService{
			DAGService: dserv,
			syncFn:     func() error { return nil },
		}
	} else {
		syncDserv = &syncDagService{
			DAGService: dserv,
			syncFn: func() error {
				ds := api.repo.Datastore()
				if err := ds.Sync(ctx, bstore.BlockPrefix); err != nil {
					return err
				}
				return ds.Sync(ctx, filestore.FilestorePrefix)
			},
		}
	}

	fileAdder, err := coreunix.NewAdder(ctx, pinning, addblockstore, syncDserv)
	if err != nil {
		return nil, err
	}

	fileAdder.Digitalzone_nft_minter = settings.Digitalzone_nft_minter
	fileAdder.Digitalzone_nft_timestamp = settings.Digitalzone_nft_timestamp
	fileAdder.Digitalzone_nft_uri = settings.Digitalzone_nft_uri
	fileAdder.Digitalzone_nft_category = settings.Digitalzone_nft_category
	fileAdder.Digitalzone_nft_title = settings.Digitalzone_nft_title
	fileAdder.Digitalzone_nft_num = settings.Digitalzone_nft_num
	fileAdder.Digitalzone_nft_fcn = settings.Digitalzone_nft_fcn
        fileAdder.Digitalzone_setting = settings.Digitalzone_setting


	fileAdder.Chunker = settings.Chunker
	if settings.Events != nil {
		fileAdder.Out = settings.Events
		fileAdder.Progress = settings.Progress
	}
	fileAdder.Pin = settings.Pin && !settings.OnlyHash
	fileAdder.Silent = settings.Silent
	fileAdder.RawLeaves = settings.RawLeaves
	fileAdder.NoCopy = settings.NoCopy
	fileAdder.CidBuilder = prefix

	switch settings.Layout {
	case options.BalancedLayout:
		// Default
	case options.TrickleLayout:
		fileAdder.Trickle = true
	default:
		return nil, fmt.Errorf("unknown layout: %d", settings.Layout)
	}

	if settings.Inline {
		fileAdder.CidBuilder = cidutil.InlineBuilder{
			Builder: fileAdder.CidBuilder,
			Limit:   settings.InlineLimit,
		}
	}

	if settings.OnlyHash {
		md := dagtest.Mock()
		emptyDirNode := ft.EmptyDirNode()
		// Use the same prefix for the "empty" MFS root as for the file adder.
		emptyDirNode.SetCidBuilder(fileAdder.CidBuilder)
		mr, err := mfs.NewRoot(ctx, md, emptyDirNode, nil)
		if err != nil {
			return nil, err
		}

		fileAdder.SetMfsRoot(mr)
	}

	nd, err := fileAdder.AddAllAndPin(ctx, files)

	log.Println("nd : ", nd)


	if err != nil {
		return nil, err
	}

	if !settings.OnlyHash {
		if err := api.provider.Provide(nd.Cid()); err != nil {
			return nil, err
		}
	}

	if (settings.Digitalzone_setting =="2"){
		//fabric_add_youngseok
		err = os.Setenv("DISCOVERY_AS_LOCALHOST", "false")
		if err != nil {
			log.Fatalf("Error setting DISCOVERY_AS_LOCALHOST environemnt variable: %v", err)
		}
		wallet, err := gateway.NewFileSystemWallet("wallet")
		if err != nil {
			log.Fatalf("Failed to create wallet: %v", err)
		}
		if !wallet.Exists("appUser") {
			err = populateWallet(wallet)
			if err != nil {
				log.Fatalf("Failed to populate wallet contents: %v", err)
			}
		}
		log.Println("youngseok_count_7")

		ccpPath := filepath.Join(
			"/home/fabric/go/src/fabric-application/connection-org1.json",
		)
		log.Println("youngseok_count_8")

		gw, err := gateway.Connect(
			gateway.WithConfig(config.FromFile(filepath.Clean(ccpPath))),
			gateway.WithIdentity(wallet, "appUser"),
		)
		log.Println("youngseok_count_9")
		if err != nil {
			log.Fatalf("Failed to connect to gateway: %v", err)
		}
		log.Println("youngseok_count_10")
		defer gw.Close()
		log.Println("youngseok_count_11")

		network, err := gw.GetNetwork("digitalzonenipanft")
		log.Println("youngseok_count_12")
		if err != nil {
			log.Fatalf("Failed to get network: %v", err)
		}
		log.Println("youngseok_count_13")

		contract_NFT := network.GetContract("token_erc721")
		log.Println("youngseok_count_14")
		log.Println(contract_NFT)
		log.Println(nd.Cid().String())

		seed, _ := cryptoRand.Int(cryptoRand.Reader, big.NewInt(math.MaxInt64))
		rand.Seed(seed.Int64())
		rand_nansu := strconv.FormatInt(rand.Int63(),10)

		token_id := rand_nansu[:10]

		log.Println(token_id)
		result, err := contract_NFT.SubmitTransaction("MintWithTokenURI",token_id, settings.Digitalzone_nft_uri,nd.Cid().String())
		if err != nil {
			log.Fatalf("Failed to Submit transaction: %v", err)
		}
		log.Println(string(result))

		/*
			눈물...
		result_owner, err := contract_NFT.EvaluateTransaction("OwnerOf", token_id)
		//result_owner, err := contract_NFT.SubmitTransaction("OwnerOf", token_id)
		if err != nil {
			//log.Println("continue")
			//return path.IpfsPath(nd.Cid()), nil
			log.Fatalf("Failed to evaluate transaction: %v\n", err)
		}
                log.Println("test")
 		log.Println(string(result_owner))
		*/

		contract_save := network.GetContract("save_ipfs_hash")
		log.Println(contract_save)

		maketoken_id_to_NFT_id := token_id+settings.Digitalzone_nft_minter+settings.Digitalzone_nft_timestamp+settings.Digitalzone_nft_uri

		hash := sha1.New()
		hash.Write([]byte(maketoken_id_to_NFT_id))
		byteString:=hash.Sum(nil)

		settings.Digitalzone_nft_fcn = "NFT_CREATE"


		var digi_owner = "x509::/C=KOR/ST=Seoul/O=Digitalzone/OU=blockchain/CN=user::/C=KOR/ST=Seoul/O=Hyperledger/OU=Fabric/CN=fabric-ca-server"

		result_save, err_save := contract_save.SubmitTransaction("Register_NFT",hex.EncodeToString(byteString),digi_owner,settings.Digitalzone_nft_timestamp, settings.Digitalzone_nft_uri,token_id,settings.Digitalzone_nft_minter,settings.Digitalzone_nft_owner,settings.Digitalzone_nft_fcn,settings.Digitalzone_nft_title,settings.Digitalzone_nft_category,settings.Digitalzone_nft_num,"NFT_CREATE")
		if err_save != nil {
			log.Fatalf("Failed to Submit transaction: %v", err)
		}

		log.Println(string(result_save))
	}





	return path.IpfsPath(nd.Cid()), nil
}

func (api *UnixfsAPI) Get(ctx context.Context, p path.Path) (files.Node, error) {
	ses := api.core().getSession(ctx)

	nd, err := ses.ResolveNode(ctx, p)
	if err != nil {
		return nil, err
	}

	return unixfile.NewUnixfsFile(ctx, ses.dag, nd)
}

// Ls returns the contents of an IPFS or IPNS object(s) at path p, with the format:
// `<link base58 hash> <link size in bytes> <link name>`
func (api *UnixfsAPI) Ls(ctx context.Context, p path.Path, opts ...options.UnixfsLsOption) (<-chan coreiface.DirEntry, error) {
	settings, err := options.UnixfsLsOptions(opts...)
	if err != nil {
		return nil, err
	}

	ses := api.core().getSession(ctx)
	uses := (*UnixfsAPI)(ses)

	dagnode, err := ses.ResolveNode(ctx, p)
	if err != nil {
		return nil, err
	}

	dir, err := uio.NewDirectoryFromNode(ses.dag, dagnode)
	if err == uio.ErrNotADir {
		return uses.lsFromLinks(ctx, dagnode.Links(), settings)
	}
	if err != nil {
		return nil, err
	}

	return uses.lsFromLinksAsync(ctx, dir, settings)
}

func (api *UnixfsAPI) processLink(ctx context.Context, linkres ft.LinkResult, settings *options.UnixfsLsSettings) coreiface.DirEntry {
	if linkres.Err != nil {
		return coreiface.DirEntry{Err: linkres.Err}
	}

	lnk := coreiface.DirEntry{
		Name: linkres.Link.Name,
		Cid:  linkres.Link.Cid,
	}

	switch lnk.Cid.Type() {
	case cid.Raw:
		// No need to check with raw leaves
		lnk.Type = coreiface.TFile
		lnk.Size = linkres.Link.Size
	case cid.DagProtobuf:
		if !settings.ResolveChildren {
			break
		}

		linkNode, err := linkres.Link.GetNode(ctx, api.dag)
		if err != nil {
			lnk.Err = err
			break
		}

		if pn, ok := linkNode.(*merkledag.ProtoNode); ok {
			d, err := ft.FSNodeFromBytes(pn.Data())
			if err != nil {
				lnk.Err = err
				break
			}
			switch d.Type() {
			case ft.TFile, ft.TRaw:
				lnk.Type = coreiface.TFile
			case ft.THAMTShard, ft.TDirectory, ft.TMetadata:
				lnk.Type = coreiface.TDirectory
			case ft.TSymlink:
				lnk.Type = coreiface.TSymlink
				lnk.Target = string(d.Data())
			}
			lnk.Size = d.FileSize()
		}
	}

	return lnk
}

func (api *UnixfsAPI) lsFromLinksAsync(ctx context.Context, dir uio.Directory, settings *options.UnixfsLsSettings) (<-chan coreiface.DirEntry, error) {
	out := make(chan coreiface.DirEntry)

	go func() {
		defer close(out)
		for l := range dir.EnumLinksAsync(ctx) {
			select {
			case out <- api.processLink(ctx, l, settings): //TODO: perf: processing can be done in background and in parallel
			case <-ctx.Done():
				return
			}
		}
	}()

	return out, nil
}

func (api *UnixfsAPI) lsFromLinks(ctx context.Context, ndlinks []*ipld.Link, settings *options.UnixfsLsSettings) (<-chan coreiface.DirEntry, error) {
	links := make(chan coreiface.DirEntry, len(ndlinks))
	for _, l := range ndlinks {
		lr := ft.LinkResult{Link: &ipld.Link{Name: l.Name, Size: l.Size, Cid: l.Cid}}

		links <- api.processLink(ctx, lr, settings) //TODO: can be parallel if settings.Async
	}
	close(links)
	return links, nil
}

func (api *UnixfsAPI) core() *CoreAPI {
	return (*CoreAPI)(api)
}

// syncDagService is used by the Adder to ensure blocks get persisted to the underlying datastore
type syncDagService struct {
	ipld.DAGService
	syncFn func() error
}

func (s *syncDagService) Sync() error {
	return s.syncFn()
}
