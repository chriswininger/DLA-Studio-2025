DLA Studio
===========

This is a UI for exploring [Diffusion-Limited Aggregation](https://en.wikipedia.org/wiki/Diffusion-limited_aggregation)

![example of an image generated using this tool](./public/example-1.png)


# Run Local

```
npm install
npm run dev
```

# Deploy

run: `npm run deploy` 

This is hosted on github pages at https://dlastudio.org

The run command will build, commit and push to the gh-pages branch

# Deploy Process

The `deploy` process will run `github-pages -d dist`. This will automatically run
the `prerender` task which runs `build` and coppies addtional resources.

After prerender it will simply coppy everything from the dist directory to the root of the gh-pages branch and push it. This triggers a built in github action
which will update what is served.

# About the build

There are 2 steps:

1. `build:base`: this is the original, simple vite build
2. `build`: this invokes `build:base` and then `npm run prerender`

The `prerender` step was added to allow us to integrate Google AdSense. Without this
step Google could not see the site content and would not allow ads to be served as it
believed the page to be mostly empty. This should also help with search indexing.

The prerender phase, serves the inital vite build from dist, visits the routes with puppet and creates new static assets from them.

# Preview

`npm run preview`, this is not to be confusd with `npm run dev` which is an easy way
to server the site during development. Preview is used to serve the dist folder and was primarily added to allow generation of the static pages. You can run it youself
to see how things will serve. To truly see what will be seen durring prerender, first
run `npm run build:base` to generate the base vite site in the dist folder
