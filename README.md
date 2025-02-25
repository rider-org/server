# rider-org/server

The Rider server that powers most core services.

### Installation

You can simply just install all the dependencies with:

```bash
pnpm i
```

### Development

You must first populate your .env file. You have two options to do so:

1.  If you are on the Rider team, you can use `dotenv` to pull the latest development config. To do so, you can simply run:

    ```bash
    pnpm run env:pull
    ```

2.  If you are a maintainer, you can simply copy `.env.example` and rename the copy to `.env` and then populate all the values. NOTE: If your `.env` file is missing variables, there should be an error thrown so you know what to add to the `.env` file. If this is the case, please open a PR to update `.env.example`; it would be greatly appreciated.

### Testing

To run all the formatters + linters + tests in one go, simple run:

```bash
pnpm run test
```

Check `package.json` for the details on each test.

On every push to `main`, the entire test suite is run. If passed, the server will then be upgraded to the newest version.

**Vitest** - To run vitest in watch mode, run:

```bash
pnpm run vitest:watch
```

### Best Practices

1.  All APIs should follow REST principles, some of which include but are not limited to:

    - `GET` Requests should not modify resources (exceptions may be made if needed)
    - `POST` Requests should be used to create new resources, while `UPDATE` and `DELETE` should be used for their respective attributes.

2.  All APIs must follow versionings (example: If you are trying to create a `/report` route, you should be writing routes on `/report/v1`. That way , if you decide to overhaul the service, it won't break services that rely on the logic to work, while making the necessary advancements for newer services).

3.  All database, DTOs and parser belong to `rider-org/models` so that they can be re-used easily.

4.  `rider-org/packages/superjson` & `rider-org/packages/attempt` are required packages in this repository. If you would like to read more details, click [here](https://github.com/rider-org/packages/tree/main/README.md)
