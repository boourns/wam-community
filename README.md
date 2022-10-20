# wam-community
A collection of built Web Audio Modules ready for use

# Goal
Package and deliver a collection of high quality Web Audio Modules (WAMs), ready to be used in audio software without further build steps.

# How to use this repository
The easiest way to use this WAM collection is to install them with npm or yarn:
```
yarn add wam-community
```

The WAMs will be installed in `./node_modules/wam-community/plugins`.  Your application is responsible for serving the WAMs and their assets over HTTP to the user's browser.

An index of the installed WAMs is included for your javascript application to list the available plugins:
```

```

# How to add your own plugins

- Fork this repository: `git clone git@github.com:boourns/wam-community.git; cd wam-community`
- Create a branch: `git checkout -b add-my-wams`
- Create a directory for your "collection" of WAMs: `mkdir ./plugins/my-name`
- Create a `plugins.json` file `./plugins/my-name/plugins.json`.  This file lists every plugin you have added and what category it should be listed under by the host.  See [this file](https://github.com/boourns/wam-community/blob/main/plugins/burns-audio/plugins.json) as an example.

To add prebuilt WAMs directly to this repository, add your pre-built WAM files as subdirectories to `./plugins/my-name/`.  Put one plugin in each subdirectory.

To add WAMs that are built and released elsewhere:
- If your WAMs are released on NPM, add your NPM package to this project's devDependencies.
- Create a `package.sh` script in `./plugins/my-name`.  This script will by run by the packager.  It is responsible for copying your plugins into `./dist/plugins/my-name/`, and for copying the `plugins.json` file as well.  See [this file](https://github.com/boourns/wam-community/blob/main/plugins/burns-audio/package.sh) as an example.

