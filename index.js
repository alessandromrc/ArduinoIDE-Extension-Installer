const inquirer = require('inquirer');
const fs = require('fs-extra')
const fsp = fs.promises;
const path = require('path');
const extract = require('extract-zip')

const extensions_folder = "./extensions/"
const extracted_extension_folder = "./extensions/extracted/"

async function readFiles(dirname) {
  return await fsp.readdir(dirname);
}

async function getDirectories(path) {
  let filesAndDirectories = await fs.readdir(path);

  let directories = [];
  await Promise.all(
    filesAndDirectories.map(name => {
      return fs.stat(path + name)
        .then(stat => {
          if (stat.isDirectory()) directories.push(name)
        })
    })
  );
  return directories;
}


async function Main() {

  console.log("Make sure to run this program as sudo/administrator!")

  const getPath = await inquirer.prompt({
    type: 'input',
    name: 'ide_path',
    message: "What's the IDE path?",
    default: "C:/Program Files/Arduino IDE/"
  })

  // check if extracted folder exists, if it does delete it!
  if (fs.existsSync(path.resolve(extracted_extension_folder))) {
    fs.rmSync(path.resolve(extracted_extension_folder), { recursive: true });
  }

  const dir_files = await readFiles(extensions_folder);

  for (let i = 0; i < dir_files.length; i++) {
    const file = dir_files[i];
    await extract(extensions_folder + file, { dir: path.resolve(extracted_extension_folder + file.replace(".vsix", "")) })
  }

  const extracted_vsix = await getDirectories(extracted_extension_folder);

  for (let i = 0; i < extracted_vsix.length; i++) {

    if (!fs.existsSync(path.resolve(getPath.ide_path + "/resources/app/plugins/" + extracted_vsix[i]))) {
      console.log("Installing extension: " + extracted_vsix[i] + "...")
      fs.move(path.resolve(extracted_extension_folder + extracted_vsix[i]), path.resolve(getPath.ide_path + "/resources/app/plugins/" + extracted_vsix[i]))
      console.log("Extension installed " + extracted_vsix[i])
    }
    else
    {
      console.log("Extension " + extracted_vsix[i] + " already installed!")
    }
  }
}

Main()
