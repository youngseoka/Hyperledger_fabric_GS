"use strict";
/*
 *SPDX-License-Identifier: Apache-2.0
 */
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
// DiscoveryService (this.ds)
const stubSend = sinon_1.default.stub();
const stubSign = sinon_1.default.stub();
const stubGetDiscoveryResults = sinon_1.default.stub();
const stubClose = sinon_1.default.stub();
// Discoverer
const stubConnect = sinon_1.default.stub();
// logger
const stubError = sinon_1.default.stub();
const stubWarn = sinon_1.default.stub();
const stubInfo = sinon_1.default.stub();
// Client
const stubSetTlsClientCertAndKey = sinon_1.default.stub();
const stubNewEndpoint = sinon_1.default.stub();
function getFabricGatewayInstance() {
    const { FabricGateway } = proxyquire_1.default
        .noCallThru()
        .load('../platform/fabric/gateway/FabricGateway', {
        'fabric-common': {
            DiscoveryService: function () {
                return {
                    build: sinon_1.default.stub(),
                    sign: stubSign,
                    send: stubSend,
                    getDiscoveryResults: stubGetDiscoveryResults,
                    close: stubClose
                };
            },
            Client: function () {
                return {
                    setTlsClientCertAndKey: stubSetTlsClientCertAndKey,
                    newEndpoint: stubNewEndpoint
                };
            },
            Discoverer: function () {
                return {
                    connect: stubConnect
                };
            }
        },
        '../../../common/helper': {
            helper: {
                getLogger: function () {
                    return {
                        error: stubError,
                        warn: stubWarn,
                        info: stubInfo
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
    const gw = new FabricGateway(config);
    gw.clientTlsIdentity = {
        credentials: {
            certificate: 'abc',
            privateKey: 'def'
        },
        mspId: 'org1',
        type: 'X.509'
    };
    const stubGetNetwork = sinon_1.default.stub(gw.gateway, 'getNetwork');
    const stubGetChannel = sinon_1.default.stub();
    stubGetChannel.returns({});
    stubGetNetwork.returns(Promise.resolve({ getChannel: stubGetChannel }));
    return gw;
}
function resetAllStubs() {
    // DiscoveryService (this.ds)
    stubSend.reset();
    stubSign.reset();
    stubGetDiscoveryResults.reset();
    stubClose.reset();
    // Discoverer
    stubConnect.reset();
    // logger
    stubError.reset();
    stubInfo.reset();
    // Client
    stubSetTlsClientCertAndKey.reset();
    stubNewEndpoint.reset();
}
describe('setupDiscoveryRequest', () => {
    let gw;
    before(() => {
        gw = getFabricGatewayInstance();
    });
    beforeEach(() => {
        resetAllStubs();
    });
    it('should return without error', () => __awaiter(void 0, void 0, void 0, function* () {
        yield gw.setupDiscoveryRequest('testChannel');
        expect_1.expect(stubSign.calledOnce).to.be.equal(true);
    }));
    it('should throw error if fail to sign', () => __awaiter(void 0, void 0, void 0, function* () {
        stubSign.throws();
        yield gw.setupDiscoveryRequest('testChannel');
        expect_1.expect(stubError.calledOnce).to.be.equal(true);
    }));
});
describe('getDiscoveryServiceTarget', () => {
    let gw;
    before(() => {
        gw = getFabricGatewayInstance();
    });
    beforeEach(() => {
        resetAllStubs();
    });
    it('should return without error', () => __awaiter(void 0, void 0, void 0, function* () {
        const targetArray = yield gw.getDiscoveryServiceTarget();
        expect_1.expect(stubSetTlsClientCertAndKey.calledOnceWith('abc', 'def')).to.be.equal(true);
        expect_1.expect(stubNewEndpoint.calledOnce).to.be.equal(true);
        expect_1.expect(stubConnect.calledOnce).to.be.equal(true);
        expect_1.expect(targetArray.length).to.be.equal(1);
    }));
    it('should return without error when not assigned client TLS config', () => __awaiter(void 0, void 0, void 0, function* () {
        gw.clientTlsIdentity = undefined;
        const targetArray = yield gw.getDiscoveryServiceTarget();
        expect_1.expect(stubSetTlsClientCertAndKey.calledOnceWith()).to.be.equal(true);
        expect_1.expect(stubNewEndpoint.calledOnce).to.be.equal(true);
        expect_1.expect(stubConnect.calledOnce).to.be.equal(true);
        expect_1.expect(targetArray.length).to.be.equal(1);
    }));
});
describe('sendDiscoveryRequest', () => {
    let gw;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        gw = getFabricGatewayInstance();
        yield gw.setupDiscoveryRequest('testChannel');
    }));
    beforeEach(() => {
        resetAllStubs();
    });
    it('should throw error when discoveryService.sends() throw error', () => __awaiter(void 0, void 0, void 0, function* () {
        stubSend.rejects(Promise.reject(new Error('REQUEST TIMEOUT')));
        yield gw.sendDiscoveryRequest();
        expect_1.expect(stubWarn.called).be.equal(true);
        expect_1.expect(stubClose.calledOnce).be.equal(true);
    }));
    it('should throw error when failed to call getDiscoveryResults()', () => __awaiter(void 0, void 0, void 0, function* () {
        stubGetDiscoveryResults.throws();
        yield gw.sendDiscoveryRequest();
        expect_1.expect(stubWarn.called).be.equal(true);
        expect_1.expect(stubClose.calledOnce).be.equal(true);
    }));
    it('should return without error', () => __awaiter(void 0, void 0, void 0, function* () {
        stubGetDiscoveryResults.returns(Promise.resolve());
        yield gw.sendDiscoveryRequest();
        expect_1.expect(stubError.called).be.equal(false);
    }));
});
describe('getDiscoveryResult', () => {
    let gw;
    let stubSetupDiscoveryRequest;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        gw = getFabricGatewayInstance();
        yield gw.setupDiscoveryRequest('testChannel');
        stubSetupDiscoveryRequest = sinon_1.default.stub(gw, 'setupDiscoveryRequest');
    }));
    beforeEach(() => {
        resetAllStubs();
        stubSetupDiscoveryRequest.reset();
    });
    it('should return without error', () => __awaiter(void 0, void 0, void 0, function* () {
        yield gw.getDiscoveryResult('testChannel');
        expect_1.expect(stubSetupDiscoveryRequest.calledOnce).be.equal(false);
    }));
    it('should return without error if discover service has not been allocated yet', () => __awaiter(void 0, void 0, void 0, function* () {
        gw.ds = null;
        yield gw.getDiscoveryResult('testChannel');
        expect_1.expect(stubSetupDiscoveryRequest.calledOnce).be.equal(true);
    }));
});
//# sourceMappingURL=FabricGateway.test.js.map