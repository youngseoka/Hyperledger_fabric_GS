"use strict";
/*
 *SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = void 0;
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
chai_1.default.use(chai_as_promised_1.default);
chai_1.default.use(sinon_chai_1.default);
exports.expect = chai_1.default.expect;
//# sourceMappingURL=expect.js.map