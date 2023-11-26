import { Command } from "commander";
import { deploy } from "../deploy";

export function deployCommand(program: Command) {
  program
    .command("deploy")
    .argument("[path]", "path to deploy")
    .requiredOption("-t, --token <token>", "token to deploy")
    .description("deploy a websocks server")
    .action(async (path, options) => {
      console.log(options);
      console.log(path);
      await deploy(path, options.token);
    });
}
