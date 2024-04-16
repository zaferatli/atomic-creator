#!/usr/bin/env node
import fs from "fs";
import Configstore from "configstore";
import Action from "./lib/action.js";
import Handlebars from "handlebars";
import ModuleDir from "./utils/getModuleDir.js";
import removeOptionsFromArgs from "./utils/getParameters.js";
import path from "path";
import { fileURLToPath } from "url";

const ROOT_DIR = process.cwd();
const [, , ...args] = process.argv;
const cliParameters = removeOptionsFromArgs.parse(args);
const atomicFileTypes = ["atom", "molecule", "organism", "page"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileBaseUrl = __dirname + "/template/";

const isCreateAction =
  cliParameters.filter((item) => item.KEY == "create").length > 0
    ? true
    : false;

let atomicType = "";
let fileName = "";
if (isCreateAction) {
  atomicType = args
    .filter((item) => item.includes("--"))[0]
    .replaceAll("--", "")
    .toLowerCase();

  fileName = args.findIndex((item) => item.includes("--"));
  fileName = fileName === -1 ? undefined : args[fileName + 1];
}

const createFile = async (fileType) => {
  const folderPath = "./src/components/" + fileType + "s" + "/" + fileName;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  fs.readdir(fileBaseUrl, (err, files) => {
    files.forEach((file) => {
      const templateFile = fs.readFileSync(`${fileBaseUrl}${file}`, {
        encoding: "utf8",
      });
      const template = Handlebars.compile(templateFile.toString());
      const fileContent = template({
        nameUpperCase: capitalizeFirstLetter(fileName),
        nameLowerCase: fileName.toLowerCase(),
      });
      if (file === "test.tsx.hbs") {
        if (!fs.existsSync(folderPath + "/__test__")) {
          fs.mkdirSync(folderPath + "/__test__");
        }
        createFileFromTemplate(
          folderPath +
            "/__test__" +
            "/" +
            fileName +
            "." +
            file.replace(".hbs", ""),
          fileContent,
          file
        );
      } else {
        createFileFromTemplate(
          folderPath + "/" + file.replace(".hbs", ""),
          fileContent,
          file
        );
      }
    });
  });
};

createFile(atomicType);

const createFileFromTemplate = async (name, content, showName) => {
  fs.writeFile(name, content, { flag: "a+" }, (err) => {
    if (err) console.log(err);
    else {
      console.log(
        capitalizeFirstLetter(showName.split(".")[0]) + " başarıyla eklendi"
      );
    }
  });
};

function capitalizeFirstLetter(str) {
  str = str.charAt(0).toUpperCase() + str.slice(1);
  return str;
}
