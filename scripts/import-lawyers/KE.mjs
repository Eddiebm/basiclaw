#!/usr/bin/env node
/**
 * KE (Kenya) lawyer-directory importer — Law Society of Kenya focus (scaffolding).
 * TOS_STATUS: see ./status-map.mjs (KE → unknown).
 */
import { IMPORTER_STATUS } from "./status-map.mjs";
import { parseImporterArgs, printDisabled, logImporterFlags } from "./_lib.mjs";

const ISO2 = "KE";
const TOS_STATUS = IMPORTER_STATUS[ISO2];

console.log(`[${ISO2}] BasicLaw lawyer importer | TOS_STATUS=${TOS_STATUS}`);

const args = parseImporterArgs(process.argv);
logImporterFlags(ISO2, args);

printDisabled(ISO2);
process.exit(0);
