import { Command } from "commander";
import { z } from "zod";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { deploy } from "./deploy";

const program = new Command();

program
  .name("socks")
  .version("0.0.1")
  .description("CLI to deploy a websocks server");

program
  .command("deploy")
  .requiredOption("-t, --token <token>", "token to deploy")
  .option("-p, --path [path]", "path to deploy", "./")
  .description("deploy a websocks server")
  .action(async ({ token, path }) => {
    await deploy(token, path);
  });

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
