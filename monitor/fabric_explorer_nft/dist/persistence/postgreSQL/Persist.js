"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Persist = void 0;
/**
 * SPDX-License-Identifier: Apache-2.0
 */
const PgService_1 = require("./PgService");
/**
 *
 *
 * @class Persist
 */
class Persist {
    constructor(pgconfig) {
        this.pgservice = new PgService_1.PgService(pgconfig);
        this.metricservice = null;
        this.crudService = null;
        this.userdataservice = null;
    }
    /**
     *
     *
     * @param {*} metricservice
     * @memberof Persist
     */
    setMetricService(metricservice) {
        this.metricservice = metricservice;
    }
    /**
     *
     *
     * @param {*} crudService
     * @memberof Persist
     */
    setCrudService(crudService) {
        this.crudService = crudService;
    }
    /**
     *
     *
     * @param {*} userdataservice
     * @memberof Persist
     */
    setUserDataService(userdataservice) {
        this.userdataservice = userdataservice;
    }
    /**
     *
     * @returns
     * @memberof Persist
     */
    getMetricService() {
        return this.metricservice;
    }
    /**
     *
     *
     * @returns
     * @memberof Persist
     */
    getCrudService() {
        return this.crudService;
    }
    /**
     *
     * @returns
     * @memberof Persist
     */
    getUserDataService() {
        return this.userdataservice;
    }
    /**
     *
     *
     * @returns
     * @memberof Persist
     */
    getPGService() {
        return this.pgservice;
    }
    /**
     *
     *
     * @memberof Persist
     */
    closeconnection() {
        this.pgservice.closeconnection();
    }
}
exports.Persist = Persist;
//# sourceMappingURL=Persist.js.map