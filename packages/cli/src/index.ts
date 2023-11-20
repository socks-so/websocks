#!/usr/bin/env node

import { Command } from "commander";
import { deployCommand } from "./commands/deploy";

const program = new Command();

program.name("socks").description("CLI to deploy a websocks server");
deployCommand(program);

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
