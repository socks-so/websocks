import { Command } from "commander";
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
  .action(({ token, path }) => {
    deploy(token, path);
  });

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function deploy(token: string, path: string) {
  console.log("Looking for websocks export in " + path);
}
