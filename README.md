# redoc
[![Circle CI](https://circleci.com/gh/reactioncommerce/redoc/tree/master.svg?style=svg)](https://circleci.com/gh/reactioncommerce/redoc/tree/master) [![Code Climate](https://codeclimate.com/github/reactioncommerce/redoc/badges/gpa.svg)](https://codeclimate.com/github/reactioncommerce/redoc)

**redoc** is a [Meteor](https://meteor.com) application that can be used to present styled markdown from multiple Github repositories.

**redoc** fetches content from GitHub and [renders markdown](https://github.com/markdown-it/markdown-it), caching the HTML to be managed with a Table of Contents and stylized with theme packages.

```
git clone https://github.com/reactioncommerce/redoc.git
cd redoc && npm install
meteor --settings settings.json
```

To run tests:

`npm run test` - run unit tests
`npm run test-app` - run "full app" tests
`npm run chimp`  run browser tests (while app running)
`npm run chimp-watch` run browser tests in watch mode (while app running)

**redoc** is the application used for the [Reaction](https://reactioncommerce.com) documentation.

**redoc** is using `meteor 1.4`, with imported [npm](https://www.npmjs.com/) dependencies. It also uses [react](https://facebook.github.io/react/) and [react-router](https://github.com/rackt/react-router) to render HTML server-side for the docs.

Since we use this project to generate docs for [Reaction Commerce](https://reactioncommerce.com/), we've included our `settings.json` and `redoc.json` that we use to generate our documentation as an example.

## Initialization
**redoc** is initialized with an array of repositories `repos`,  and a Table of Contents, `tocData` array. These are defined in settings.json `redoc.initRepoData`.

**_settings.json_ example**

```
{
  "public": {
    "ga": {
      "account": ""
    },
    "gitter": {
      "room": "reactioncommerce/reaction"
    },
    "redoc": {
      "branch": "master",
      "publicBranches": [
        "master"
      ]
    }
  },
  "services": [{
    "github": {
      "clientId": "",
      "secret": "",
      "webhook": {
        "updateDocs": ""
      }
    }
  }],
  "redoc": {
    "users": [
      {
        "username": "github_username",
        "roles": ["admin"]
      }
    ],
    "initRepoData": {
      "repos": [{
        "org": "reactioncommerce",
        "repo": "reaction-docs",
        "label": "Reaction",
        "description": "Reaction Commerce Guide"
      }],
      "tocData": [{
        "class": "guide-nav-item",
        "alias": "intro",
        "label": "Introduction",
        "repo": "reaction-docs",
        "docPath": "index.md",
        "default": true
      }, {
        "class": "guide-sub-nav-item",
        "alias": "dashboard",
        "label": "Dashboard",
        "repo": "reaction-docs",
        "docPath": "admin/dashboard.md"
      }]
    }
  }
}
```

## Document Structure
Documents is split into one of two sides. Left - Explanation Right - Examples

Heading levels (h1, h2, h3) create distinct sections. Heading level (h4) does not create a section, instead lives in the current heading section. Heading levels (h5, h6) create an example sub section within the current heading section.

The following example shows how this works:

```
# h1 - (creates a section)
Introduction Content

##### h5 - (starts the example section for the h1)
Example Content
Example ends at the h2. h2 is a new section

## h2 - (creates a section)
Content for h2

##### h5 - (starts the example section for the h2)
Example Content
Example ends at the h3. h3 is a new section

### h3 - (creates a section)
Content for h3

#### h4
#### h4
#### h4

##### h5 - (starts the example section for the h3, h4's are not distinct sections)
code
paragraph
table
list
etc...

###### h6 - (same effect as h5)
content...
Example ends at the h3. h3 is a new section

### h3
Content for h3
Has no example content. The right hand side will be empty, and thats OK.
```

The environment variable `METEOR_SETTINGS` can also be used.

### Remote configuration
You can supply a url in `initRepoData` as well, and we'll fetch from the remote location.

```js
"redoc": {
  "initRepoData": "https://raw.githubusercontent.com/reactioncommerce/redoc/master/private/redoc.json"
}
```

`initRepoData` can also be an object defining the initRepoData.

#### TOC Example Data

```
{
  "repos": [{
    "org": "reactioncommerce",
    "repo": "reaction-docs",
    "label": "Reaction",
    "description": "Reaction Commerce Guide"
  }, {
    "org": "reactioncommerce",
    "class": "guide-sub-nav-item",
    "repo": "reaction-braintree",
    "label": "Braintree",
    "docPath": "README.md"
  }, {
    "class": "guide-sub-nav-item",
    "org": "reactioncommerce",
    "repo": "reaction-paypal",
    "label": "Paypal",
    "docPath": "README.md"
  }
}
```

If you supply only a repo, the TOC data will be generated from the repo's folder/file structure.

## Theme
To customize the theme, copy the `packages/reaction-doc-theme` to a new package folder, and update the packages.js with your new theme package name.

## Gitter
Use `Meteor.settings.public.gitter.room` to configure the [Gitter Sidecar](https://sidecar.gitter.im/) room. To remove Gitter:

```
meteor remove reactioncommerce:redoc-gitter
```

## Scheduling
`Meteor.settings.redoc.schedule` is configurable in settings.json, and defaults to "every 4 hours".

This configures a schedule for flushing the collections and fetching updates.

## Deployment
Although you can deploy Redoc with any of the [deployment methods supported by Meteor](http://guide.meteor.com/v1.3/deployment.html), the recommended method is to use [Docker](http://docker.com).  Redoc has several Dockerfiles to choose from that are intended for different use cases.

All Dockerfiles and the associated build scripts are in the `docker/` directory. The default Dockerfile in the root of the project is an alias that points to `docker/redoc.prod.docker` (which is the recommended Dockerfile for production deployments). However, the production image builds from a base OS from scratch every time and will take a bit longer to build than the development image (found at `docker/redoc.dev.docker`). So when you're developing locally, you may prefer to have the faster build time that the development image gives you (by caching each build step layer). Just note that you don't ever want to use the development image for production because the image size is usually about 4x the size of the production image.

### Build
The Docker build step is optional and is only required if you have a customized version of Redoc. If you haven't customized the app, skip to the next section.

To build your custom version of Redoc:

```sh
# production image
docker build -t <your org>/redoc .

# or a local development image for quicker debugging
docker build -f docker/redoc.dev.docker -t <your org>/redoc .
```

Once you have built a production image, you can push it to your Docker Hub account:

```sh
docker push <your org>/redoc
```

### Run
Running the official Redoc image (assuming you're using `settings.json` in the project root and an external MongoDB):

```sh
docker run -d \
  -p 80:80 \
  -e ROOT_URL='http://example.com' \
  -e MONGO_URL='mongodb://url...' \
  -e METEOR_SETTINGS='$(cat settings.json)' \
  reactioncommerce/redoc:latest
```

We've also provided an example Docker Compose config (`docker-compose.yml`) that can be used as a starting point if you'd like to use the official MongoDB image from Docker Hub.

```yaml
redoc:
  image: reactioncommerce/redoc:latest
  ports:
    - 80:80
  links:
    - mongo
  restart: always
  environment:
    ROOT_URL: "http://example.com" # set to your domain name
    MONGO_URL: "mongodb://mongo:27017/redoc" # this is fine as-is
    METEOR_SETTINGS: # provide a JSON stringified version of your settings.json here

mongo:
  image: mongo:latest
  restart: always
  command: mongod --storageEngine=wiredTiger
```

Once you've added your `METEOR_SETTINGS`, you can then run start up the containers with:

```sh
docker-compose up -d
```

Once the containers have started, your app should be linked to the mongo container and serving content on port 80.
