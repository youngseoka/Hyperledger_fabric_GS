"use strict";
/*
 *SPDX-License-Identifier: Apache-2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expect_1 = require("./expect");
const FabricConfig_1 = require("../platform/fabric/FabricConfig");
const proxyquire_1 = __importDefault(require("proxyquire"));
const sinon_1 = __importDefault(require("sinon"));
const stubBlock = __importStar(require("./block.json"));
const stubConfigBlock = __importStar(require("./block_config.json"));
const stubLifecycleBlock = __importStar(require("./block_lifecycle.json"));
const ExplorerError_1 = require("../common/ExplorerError");
const FabricConst = __importStar(require("../platform/fabric/utils/FabricConst"));
const fabric_const = FabricConst.fabric.const;
// logger
const stubError = sinon_1.default.stub();
const stubInfo = sinon_1.default.stub();
const stubDebug = sinon_1.default.stub();
const VALID_GENESIS_HASH = '8A+HyzS4sqZynD06BfNW7T1Vtv2SOXAOUJQK4itulus=';
const VALID_NETWORK_ID = 'test-network-id';
const VALID_CHANNEL_NAME = 'testchannel';
const stubPlatform = {
    send: sinon_1.default.spy()
};
const spySaveTransaction = sinon_1.default.spy();
const stubGetChannelGenHash = sinon_1.default.stub();
function getSyncServicesInstance() {
    const { SyncServices } = proxyquire_1.default
        .noCallThru()
        .load('../platform/fabric/sync/SyncService', {
        'convert-hex': {
            bytesToHex: sinon_1.default.stub()
        },
        '../../../common/helper': {
            helper: {
                getLogger: function () {
                    return {
                        error: stubError,
                        info: stubInfo,
                        debug: stubDebug,
                        warn: sinon_1.default.stub()
                    };
                }
            }
        }
    });
    const config = new FabricConfig_1.FabricConfig();
    config.initialize('first-network', {
        name: 'My first network',
        profile: './connection-profile/test-network.json'
    });
    sinon_1.default.stub(config, 'getPeerTlsCACertsPem');
    const stubGetCrudService = sinon_1.default.stub();
    stubGetCrudService.returns({
        saveBlock: sinon_1.default.stub().resolves(true),
        saveTransaction: spySaveTransaction,
        getChannel: sinon_1.default.stub()
    });
    const stubGetMetricService = sinon_1.default.stub();
    stubGetMetricService.returns({
        findMissingBlockNumber: sinon_1.default
            .stub()
            .returns([{ missing_id: 1 }, { missing_id: 2 }])
    });
    const stubPersistence = {
        getCrudService: stubGetCrudService,
        getMetricService: stubGetMetricService
    };
    const sync = new SyncServices(stubPlatform, stubPersistence);
    return sync;
}
function resetAllStubs(sync) {
    // logger
    stubError.reset();
    stubInfo.reset();
    sync.blocksInProcess = [];
    stubGetChannelGenHash.reset();
    stubPlatform.send.resetHistory();
    spySaveTransaction.resetHistory();
}
function setupClient() {
    const stubGetNetworkID = sinon_1.default.stub();
    stubGetNetworkID.returns(VALID_NETWORK_ID);
    stubGetChannelGenHash.returns(VALID_GENESIS_HASH);
    const stubClient = {
        getNetworkId: stubGetNetworkID,
        getChannelGenHash: stubGetChannelGenHash,
        initializeNewChannel: sinon_1.default.stub().resolves(true),
        initializeChannelFromDiscover: sinon_1.default.stub(),
        fabricGateway: {
            fabricConfig: {
                getRWSetEncoding: sinon_1.default.stub()
            },
            queryChainInfo: sinon_1.default.stub().returns({ height: { low: 10 } }),
            queryBlock: sinon_1.default.fake((channel_name, missing_id) => {
                if (channel_name === VALID_CHANNEL_NAME) {
                    return stubBlock;
                }
                else {
                    return null;
                }
            })
        }
    };
    return stubClient;
}
describe('processBlockEvent', () => {
    let sync;
    before(() => {
        sync = getSyncServicesInstance();
    });
    beforeEach(() => {
        resetAllStubs(sync);
    });
    it('should return without error', () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        yield expect_1.expect(sync.processBlockEvent(stubClient, stubBlock, false)).eventually
            .to.be.true;
        sinon_1.default.assert.calledOnce(stubPlatform.send);
        sinon_1.default.assert.calledWith(stubPlatform.send, sinon_1.default.match({ notify_type: fabric_const.NOTITY_TYPE_BLOCK }));
        expect_1.expect(sync.blocksInProcess.length).equals(0);
    }));
    it('should throw an error if it has already been in proces', () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        sync.blocksInProcess = ['mychannel_9'];
        yield expect_1.expect(sync.processBlockEvent(stubClient, stubBlock, false))
            .to.eventually.be.rejectedWith('Block already in processing')
            .and.be.an.instanceOf(ExplorerError_1.ExplorerError);
        sinon_1.default.assert.notCalled(stubPlatform.send);
        expect_1.expect(sync.blocksInProcess.length).equals(1);
    }));
    it('should raise new channel notification if genesis has not already been stored yet', () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        stubGetChannelGenHash.onFirstCall().returns(null);
        stubGetChannelGenHash.onSecondCall().returns(VALID_GENESIS_HASH);
        stubClient.getChannelGenHash = stubGetChannelGenHash;
        const spyInsertDiscoveredCH = sinon_1.default.spy(sync, 'insertDiscoveredChannel');
        const clock = sinon_1.default.useFakeTimers();
        yield expect_1.expect(sync.processBlockEvent(stubClient, stubBlock, false))
            .to.eventually.be.rejectedWith('mychannel has not been inserted yet')
            .and.be.an.instanceOf(ExplorerError_1.ExplorerError);
        clock.tick(20000);
        sinon_1.default.assert.calledOnce(spyInsertDiscoveredCH);
        expect_1.expect(sync.blocksInProcess.length).equals(0);
        clock.restore();
    }));
    it('should raise update channel notification if config block is processed', () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        const spyUpdateDiscoveredCH = sinon_1.default.spy(sync, 'updateDiscoveredChannel');
        const clock = sinon_1.default.useFakeTimers();
        yield expect_1.expect(sync.processBlockEvent(stubClient, stubConfigBlock, false)).to
            .eventually.to.be.true;
        clock.tick(20000);
        sinon_1.default.assert.calledWith(spySaveTransaction, VALID_NETWORK_ID, sinon_1.default.match(obj => {
            return 'txhash' in obj && obj['txhash'] !== undefined;
        }, 'txhash undefined'));
        sinon_1.default.assert.calledOnce(spyUpdateDiscoveredCH);
        expect_1.expect(sync.blocksInProcess.length).equals(0);
        sinon_1.default.assert.calledOnce(stubPlatform.send);
        sinon_1.default.assert.calledWith(stubPlatform.send, sinon_1.default.match({ notify_type: fabric_const.NOTITY_TYPE_BLOCK }));
        clock.restore();
    }));
    it("should be done without any errors when config block doesn't have any payload in last updated data", () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        stubConfigBlock.data.data[0].payload.data.last_update.payload = null;
        yield expect_1.expect(sync.processBlockEvent(stubClient, stubConfigBlock, false)).to
            .eventually.to.be.true;
    }));
    it('should be done without any errors when _lifecycle block is processed', () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        yield expect_1.expect(sync.processBlockEvent(stubClient, stubLifecycleBlock, false)).to
            .eventually.to.be.true;
    }));
});
describe('syncBlocks', () => {
    let sync;
    before(() => {
        sync = getSyncServicesInstance();
    });
    beforeEach(() => {
        resetAllStubs(sync);
    });
    it('should return without error', () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        const stubProcessBlockEvent = sinon_1.default.stub(sync, 'processBlockEvent');
        yield sync.syncBlocks(stubClient, VALID_CHANNEL_NAME, false);
        expect_1.expect(stubProcessBlockEvent.calledTwice).to.be.true;
        stubProcessBlockEvent.restore();
    }));
    it('should return without error when processBlockEvent throws exception', () => __awaiter(void 0, void 0, void 0, function* () {
        const stubClient = setupClient();
        const stubProcessBlockEvent = sinon_1.default.stub(sync, 'processBlockEvent');
        stubProcessBlockEvent.onFirstCall().throws('Block already in processing');
        stubError.reset();
        yield sync.syncBlocks(stubClient, VALID_CHANNEL_NAME, false);
        expect_1.expect(stubProcessBlockEvent.calledTwice).to.be.true;
        expect_1.expect(stubError.calledWith('Failed to process Block # 1')).to.be.true;
        expect_1.expect(stubError.calledWith('Failed to process Block # 2')).to.be.false;
        stubProcessBlockEvent.restore();
    }));
});
//# sourceMappingURL=SyncService.test.js.map