# Homestar Image Processing Demo

Homestar Image Processing Demo is a frontend for demonstrating Homestar workflows. It requires a backend to run the workflows.

## Setup

Install dependencies.

```shell
npm install
```

## Develop

Work on the application in local development.

```shell
npm run dev
```

Navigate to `localhost:5173` in your web browser.

## Build

Export a static build.

```shell
npm run build
```

The build outputs the static site to the `build` directory.

## Configure

The application can be configured in [.env](/.env):

- `VITE_WEBSOCKET_ENDPOINT`. Backend websocket endpoint.
- `VITE_PING_INTERVAL`. Ping interval for heartbeat check over websocket connection.
- `VITE_MAX_PING_RETRIES`. Max retries before a workflow is failed.
- `VITE_EMULATION_MODE`. Enable emulation with an echo server. Primarily for testing the frontend, does not process images.

## Publish

The built site publishes with the [Fission CLI](https://guide.fission.codes/developers/cli) and the [Fission GH publish action](https://github.com/fission-suite/publish-action). Publishing from the command line is configured in [fission.yaml](fission.yaml), and the GitHub publish action is configured in [publish.yml](.github/workflows/publish.yml).

To setup publishing with the Fission CLI:

1. [Install the CLI](https://guide.fission.codes/developers/installation)
2. Run `fission setup` to make a Fission account
3. Run `npm run build` to build the app
4. Delete `fission.yaml`
5. Run `fission app register` to register a new Fission app (accept the `./build` directory suggestion for your build directory)
6. Run `fission app publish` to publish your app to the web

After publishing, your app will be available online at the domain assigned by the register command.

To set up the GitHub publish action:

1. Reigster the app with the CLI
2. Export your machine key with `base64 ~/.config/fission/key/machine_id.ed25519`
3. Add your machine key as a GH Repository secret named `FISSION_MACHINE_KEY`
4. Update the `publish.yml` with the name of your registered app

See the [Fission Guide](https://guide.fission.codes/developers/installation) and the publish action README for more details.

## License

The source code for this template is available under the Apache 2.0 license.
