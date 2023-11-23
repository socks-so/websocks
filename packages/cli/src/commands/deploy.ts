import { Command } from "commander";
import { deploy } from "../deploy";

export function deployCommand(program: Command) {
  program
    .command("deploy")
    .requiredOption("-t, --token <token>", "token to deploy")
    .option("-p, --path [path]", "path to deploy", "")
    .description("deploy a websocks server")
    .action(async ({ token, path }) => {
      await deploy(token, path);
    });
}
