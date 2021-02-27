# IMPEACH - Imparting Member Pleas to Extend Advice and Constructive Help

A new version of Computer Science House's Eboard Evals, built with Express and Mongoose.

### Getting started

This project uses yarn ([install docs](https://classic.yarnpkg.com/en/docs/install/#debian-stable)) and nvm ([install docs](https://github.com/nvm-sh/nvm#installing-and-updating)).

```bash
nvm use # Set node version to the project version
yarn # Install dependencies
yarn start # run the app (you probably need some environment variables, which I haven't documented for local dev yet)
```

For linting, this project uses gulp.
`npx gulp lint` will run linters for pug and js.
You can use `npx gulp lint:js` and `npx gulp lint:pug` to run the individual linters, and `npx gulp lint:js:fix` to run with `--fix`.
