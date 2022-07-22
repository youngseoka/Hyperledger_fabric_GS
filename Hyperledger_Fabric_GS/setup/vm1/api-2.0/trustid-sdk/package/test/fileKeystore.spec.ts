/*

Copyright 2020 Telefónica Digital España. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0

*/
import {expect} from "chai";
import {Wallet} from "../src/wallet";
import {FileKeystore} from "../src/keystore/fileKeystore";

import "mocha";

const wal = Wallet.Instance;
// const ksfile = './keystore/keystore'+Date.now()
const ksfile = "./keystore";
const ks = new FileKeystore("file", ksfile);
wal.setKeystore(ks);

describe("Keystore tests", async () => {
	const did = await wal.generateDID("RSA", "default", "secret");

	let hfChaincodeServiceStub, jwtHelperStubC;

	it("Creates FileKeystore", () => {
		expect(ks).to.not.equal({});
	});

    // TODO: Fixed this test
	// it("Get DID", () => {
	// 	expect(ks.getDID(did.id)).to.eql(did);
	// });

	it("Store and load keystore", () => {
		let ksfile2 = "./keystore";
		const did2 = wal.generateDID("RSA");
		ks.saveKeystore();
		const ks2 = new FileKeystore("file", ksfile);
		ks2.loadKeystore("file", ksfile);
		// expect(ks.getDID(did2.id)).to.eql(did2)
	});
});
