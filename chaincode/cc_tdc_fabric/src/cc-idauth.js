"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CcIdauth = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
let CcIdauth = class CcIdauth {
};
CcIdauth.assetType = 'CcIdauth';
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "id", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "firstName", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "lastName", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "birthDate", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "enrollmentId", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "enrollmentSecret", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "roles", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "hlfRole", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth.prototype, "login", void 0);
__decorate([
    (0, fabric_contract_api_1.Property)()
], CcIdauth, "assetType", void 0);
CcIdauth = __decorate([
    (0, fabric_contract_api_1.Object)()
], CcIdauth);
exports.CcIdauth = CcIdauth;
