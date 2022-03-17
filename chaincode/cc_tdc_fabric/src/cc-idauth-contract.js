"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CcIdauthContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
let CcIdauthContract = class CcIdauthContract extends fabric_contract_api_1.Contract {
    constructor() {
        // Namespaceconsole.log('br.com.cconsensus.regcon');
        super('br.com.cconsensus.regcon');
    }
    /**
     *  Override unknownTransaction
     * @param ctx
     * @returns {Promise<void>}
     */
    unknownTransaction(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`==> unknownTransaction called by: ${ctx.clientIdentity.getMSPID()}`);
            console.error(`==> unknownTransaction Transaction ID: ${ctx.stub.getTxID()}`);
            console.error(`==> unknownTransaction Transaction ID: ${ctx.clientIdentity.getIDBytes().toString()}`);
            throw new Error(`An unknownTransaction was called here: ${ctx.clientIdentity.getMSPID()}`);
        });
    }
    /**
     * Override beforeTransaction
     * @param ctx
     * @returns {Promise<void>}
     */
    beforeTransaction(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`==> beforeTransaction called by: ${ctx.clientIdentity.getMSPID()}`);
            console.info(`==> beforeTransaction Transaction ID: ${ctx.stub.getTxID()}`);
            console.info(`==> beforeTransaction Transaction ID: ${ctx.clientIdentity.getIDBytes().toString()}`);
        });
    }
    /**
     * Override afterTransaction
     * @param ctx
     * @returns {Promise<void>}
     */
    afterTransaction(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`==> afterTransaction called by: ${ctx.clientIdentity.getMSPID()}`);
            console.info(`==> afterTransaction Transaction ID: ${ctx.stub.getTxID()}`);
            console.info(`==> afterTransaction Transaction ID: ${ctx.clientIdentity.getIDBytes().toString()}`);
        });
    }
};
CcIdauthContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'cc-idauth', description: 'Chaincode to deal with identity and authentication using hyperledger fabric' })
], CcIdauthContract);
exports.CcIdauthContract = CcIdauthContract;
