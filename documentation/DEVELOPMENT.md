# Development

```sh
# run api with hot reload
denon start development

# run api with hot reload and stacktrace for Deno devs if a panic occurs
RUST_BACKTRACE=1 denon start development

# what denon does under the hood
deno run --allow-env --allow-net --allow-read --unstable --import-map import_map.json main.ts development
```

That's it. Denon abstracts away a lot of Deno's default verboseness. Still, here's a breakdown of the Deno permissions required to run this module:

- `--allow-env` for .env access (for EdgeDB)
- `--allow-net` to open a port and be accessible online
- `--allow-read` to access `<CWD>` (current working directory)
- `--unstable` `Deno.connectTls#alpnProtocols` is an unstable API

We have `--development` for the API to know which environment variables to use for third-party services.

Denon will complain about not being able to process logging when the server closes. Running `just` commands will not.



## Prerequisites

- [Deno](https://deno.land/#installation)
- [Denon](https://github.com/denosaurs/denon#install)
- [Just](https://just.systems/man/en)



## Installation

```sh
# run this upon INITIAL clone only
# set instance name to whatever you want
edgedb project init

# connect to default database
edgedb --branch main

# create database
CREATE DATABASE api;

# connect to just created database
\c api;

# delete default database
DROP DATABASE main;

# exit CLI
\q
```



## Create `.env` keys

```sh
# save these values in your password manager
openssl rand -base64 32  # KEY_ENCRYPTION
openssl rand -base64 128 # KEY_SECRET
openssl rand -base64 64  # KEY_SIGNING
```

You can pipe the output of these commands to your system clipboard instead of to the terminal by appending:

- `| pbcopy` (macOS)
- `| xclip -selection clipboard` (Linux, requires "xclip" installation)
- `| Set-Clipboard` (Windows)



## Schema Updates

```sh
# whenever you make changes to the schema, run…
edgedb migration create

# …then, apply changes
edgedb migrate

# generate the query builder
deno run -A https://deno.land/x/edgedb@v1.4.1/generate.ts edgeql-js --target deno
```



## UI

To view the database via the embedded UI:

```sh
edgedb ui --print-url
```
