#!/usr/bin/env node
/**
 * IN (India) lawyer-directory importer (scaffolding).
 * TOS_STATUS: see ./status-map.mjs (IN → unknown).
 */
import { IMPORTER_STATUS } from "./status-map.mjs";
import { parseImporterArgs, printDisabled, logImporterFlags } from "./_lib.mjs";

const ISO2 = "IN";
const TOS_STATUS = IMPORTER_STATUS[ISO2];

console.log(`[${ISO2}] BasicLaw lawyer importer | TOS_STATUS=${TOS_STATUS}`);

const args = parseImporterArgs(process.argv);
logImporterFlags(ISO2, args);

printDisabled(ISO2);
process.exit(0);
