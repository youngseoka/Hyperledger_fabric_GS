/** Class representing Wallets
 *  It follows a Singleton pattern.
 */
import {DID} from './core/did'
import {TrustID} from './core/trustid'
import {Keystore} from './keystores/keystore'
import {FileKeystore} from './keystores/fileKeystore'

export class Wallet {
	/** Instance for the wallet */
	private static _instance: Wallet;
	// /** Keystore representing all the DIDs loaded in the wallet*/
	private keystore: Keystore;

	/** Drivers to connected blockchains */
	public networks: {[k: string]: TrustID};
	/** Constructor for the wallet */
	private constructor() {
		this.keystore = new FileKeystore();
		this.networks = {};
	}

	public static get Instance() {
		return this._instance || (this._instance = new this());
	}

	// Functions from specific keystore that will be overloaded
	// in wallet
	public async getDID(id: string): Promise<DID> {
		return this.keystore.getDID(id);
	}
	public async storeDID(did: DID): Promise<boolean> {
		return this.keystore.storeDID(did);
	}
	public async updateDID(did: DID): Promise<boolean> {
		return this.keystore.updateDID(did);
	}
	public listDID(): string[] {
		return this.keystore.listDID();
	}
	public setDefault(did: DID): boolean {
		return this.keystore.setDefault(did);
	}
	public getDefault(): boolean {
		return this.keystore.getDefault();
	}
	public storeInMemory(did: DID): boolean {
		return this.keystore.storeInMemory(did);
	}

	/** Set the Keystore to use in the wallet. */
	public setKeystore(keystore: Keystore): void {
		this.keystore = keystore;
	}

	/** generateDID generates a new DID in the wallet */
	/** generateDID generates a new DID in the wallet */
	public async generateDID(type: string, controller: string = "default", passphrase: string = ""): Promise<DID> {
		const value: DID = new DID(type, controller);
		//await value.createKey(passphrase);
		console.log("tlqkf")
		await this.keystore.storeDID(value);
		return value;
	}

	/** generateDID generates a new DID in the wallet */
	public async generateDIDwithSSS(type: string, controller: string = "default", shares: number = 3, threshold: number = 1): Promise<any> {
		const value: DID = new DID(type, controller);
		const secrets = await value.createKeySSS(shares, threshold);
		await this.keystore.storeDID(value);
		const did = {
			did: value,
			secrets: secrets
		}
		return did;
	}

		/** Recovers the keyt */
	public async recoverKeySSS(id: string, secrets: Buffer[], newPassword: string): Promise<void>{
			const did = await this.getDID(id)
			const recoveredDID = await did.recoverKey(secrets, newPassword);
			await this.keystore.updateDID(recoveredDID)
			return;
	}

	/** updateTempKeyDID updates the temp key for a DID */
	public async updateTempKeyDID(id: string, passphrase: string = "",tempPassphrase: string=""): Promise<void> {
		const did = await this.keystore.getDID(id);
		const unlockedDID = await did.unlockAccount(passphrase, tempPassphrase)
		await this.keystore.updateDID(unlockedDID)
	}

	public async updatePassword(id: string, oldPassphrase: string = "",passphrase: string=""): Promise<void> {
		const did = await this.keystore.getDID(id);
		const unlockedDID = await did.updatePassword(oldPassphrase, passphrase);
		await this.keystore.updateDID(unlockedDID)
	}

	
	/** Set the Keystore to use in the wallet. */
	public addNetwork(id: string, network: TrustID): void {
		this.networks[id] = network;
	}
}
