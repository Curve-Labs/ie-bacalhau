# Impact Evaluator

# Setup

1. Clone Repo using

using SSH

```
git clone git@github.com:Curve-Labs/ie-bacalhau.git
```

or using HTTPS

```
git clone https://github.com/Curve-Labs/ie-bacalhau.git
```

2. Go to the repo

```
cd ie-bacalhau
```

3. Install packages

```
yarn install
```

4. (Optional) Test

```
yarn test-setup
```

## Playaround with monorepo setup

### Run a file from different workspace

```
yarn workspace on-chain run invade
```

or

```
yarn run invade
```

# How to work in workspaces

- Go to your workspace using

```
cd packages/{WORKSPACE}
```

Note: replace your workspace name with "{WORKSPACE}"

- Work normally, like how you work on a single repository.
- After adding new dependencies, go to root and run

```
yarn install
```

- go back to your workspace and work normally

# Adding new Dependency

## From Root directory

```
yarn workspace {WORKSPACE} add ...
```

Note: here `add` is the normal yarn command

### Example

Adding Dotenv package

```
yarn workspace bacalhau add dotenv
```

or

```
yarn workspace bacalhau add -d dotenv
```

## From workspace directory

1. Be on your workspace directory, if you are not, go to your workspace directory using

```
cd packages/{WORKSPACE}
```

2. Install package that you want to install

```
yarn add ...
```

3. (Safe Side) go to root directory

```
cd ../..
```

4. (Safe Side) yarn install

```
yarn install
```

# Git Workflow

Git workflow is the same. New guidelines will be shared here.

# Useful commands

## Run any command in workspace

```
yarn workspace <workspaceName> <commandName> ...
```

## List workplaces

```
yarn workspaces list
```

# Making Changes

- Any code changes relevant to a workspace should be made inside workspace.
- If you want to add scripts, lint or hooks that should apply to whole repo (monorepo), add it in root directory.

# Things to keep in mind

- `./package.json` file deals with whole monorepo.
- `./packages/{WORKSPACE}/package.json` file deals with that {WORKSPACE} only. Any changes made in thi file will only reflect in that workspace.
- All the dependencies are installed globally and no node_modules folder should exist inside workspace directory.
- Lint rules and scripts should be global hence added in root directory.
- Try to run commands while staying in root directory as much as possible.
- Enviornment Variables are not shared and are specific to each workspace
- Import files with proper path from different workspace
