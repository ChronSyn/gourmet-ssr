---
id: tutorial-1
title: Creating a Basic Structure of the News App
---

## What we will build

In this tutorial, we will build a news reader application. Starting with a simple app with the dummy user interface, we will add more features as we progress to show you how to build a fullstack application using Gourmet SSR.

First, let's take a look at the screenshot of the final app that we are going to build.

![Tutorial - News App](assets/tutorial-app.png)

This app works as follows:

- A user must login to the app to access this main screen.
- The main screen has two panes that you can switch between using tabs.
- The "Latest News Headlines" pane displays a list of news articles fetched from `newsapi.org`.
- The "Saved Articles" pane displays bookmarked news articles.
- Bookmarks are saved per user account.
- If there are more articles than displayed in the current pane, there will be a `Load more` button at the bottom of the list. If clicked, 10 more items are fetched and appended to the list.
- A user can log out by clicking `Log out` button at the top right corner of the screen.

## Creating project files

Create a new directory named `news-ssr`, and inside, create files as below. Alternatively, you can get these files from the GitHub repo if you want.

```sh
git clone https://github.com/gourmetjs/news-ssr
cd news-ssr
git checkout step-1a
```

#### package.json

```json
{
  "private": true,
  "scripts": {
    "build": "gourmet build",
    "start": "node lib/server.js",
    "dev": "nodemon --ignore src lib/server.js -- --watch"
  },
  "dependencies": {
    "express": "^4.16.4",
    "@gourmet/server-args": "^1.2.1",
    "@gourmet/client-lib": "^1.2.0"
  },
  "devDependencies": {
    "@gourmet/gourmet-cli": "^1.1.0",
    "@gourmet/preset-react": "^1.2.2",
    "@gourmet/group-react-i80": "^1.2.0",
    "react": "^16.8.1",
    "react-dom": "^16.8.1",
    "nodemon": "^1.18.10"
  }
}
```

#### lib/server.js

```js
"use strict";

const express = require("express");
const gourmet = require("@gourmet/client-lib");
const serverArgs = require("@gourmet/server-args");

const args = serverArgs({workDir: __dirname + "/.."});
const app = express();

app.use(gourmet.middleware(args));

app.get(["/login", "/signup"], (req, res) => {
  res.serve("public");
});

app.get(["/", "/saved"], (req, res) => {
  res.serve("main");
});

app.use(gourmet.errorMiddleware());

app.listen(args.port, () => {
  console.log(`Server is listening on port ${args.port}`);
});
```

#### gourmet_config.js

```js
module.exports = {
  pages: {
    public: "./src/containers/PublicPage",
    main: "./src/containers/MainPage"
  }
};
```

#### src/containers/MainPage.js

```js
import React from "react";
import i80, {ActiveRoute} from "@gourmet/react-i80";
import NewsView from "./NewsView";
import SavedView from "./SavedView";

i80([
  ["/", NewsView],
  ["/saved", SavedView]
]);

export default function MainPage() {
  return (
    <div>
      <h1>Main Page</h1>
      <ActiveRoute/>
    </div>
  );
}
```

#### src/containers/PublicPage.js

```js
import React from "react";
import i80, {ActiveRoute} from "@gourmet/react-i80";
import LoginView from "./LoginView";
import SignupView from "./SignupView";

i80([
  ["/login", LoginView],
  ["/signup", SignupView]
]);

export default function PublicPage() {
  return (
    <div>
      <h1>Public Page</h1>
      <ActiveRoute/>
    </div>
  );
}
```

#### src/containers/NewsView.js

```js
import React from "react";

export default function NewsView() {
  return (
    <div>
      <p>News article #1</p>
      <p>News article #2</p>
      <p>News article #3</p>
    </div>
  );
}
```

#### src/containers/SavedView.js

```js
import React from "react";

export default function SavedView() {
  return (
    <div>
      <p>Saved article #1</p>
      <p>Saved article #2</p>
      <p>Saved article #3</p>
    </div>
  );
}
```

#### src/containers/LoginView.js

```js
import React from "react";

export default function LoginView() {
  return (
    <div>
      <p>Login Form</p>
    </div>
  );
}
```

#### src/containers/SignupView.js

```js
import React from "react";

export default function SignupView() {
  return (
    <div>
      <p>Signup Form</p>
    </div>
  );
}
```

## Building and running

Now, install dependencies and run the app.

```sh
npm install
npm run build
npm start
```

Open your browser and try the following URLs.

- http://localhost:3000/
- http://localhost:3000/saved
- http://localhost:3000/login
- http://localhost:3000/singup

You will see screens like these.

![Mock UI](assets/tutorial-mock-ui.png)

## Routing using React I80

React I80 is a tiny routing library specifically designed for Gourmet SSR. Using React I80, you can divide the user interface of your app into more manageable smaller units called views, and associate them with URLs. Also, you can group multiple views into pages.

Switching between views inside the same page happens on the client-side and no round-trip to the server is made. On the other hand, each page is a completely separated HTML endpoint from the other. A transition between pages always happens in a clean, new browser sessions.

Using Gourmet SSR, you are not limited to a single HTML page for your whole app. In fact, splitting your app into multiple pages is an encouraged pattern for the better user experience. At least, you must separate the content for authenticated state from the unauthenticated public content for security. With this in mind, we structured our pages and views as below.

```text
PublicPage --+-- LandingView
             |
             +-- LoginView
             |
             +-- SignupView

MainPage ----+-- NewsView
             |
             +-- SavedView
```

To use React I80, you should add `@gourmet/group-react-i80` as a dependency in addition to `@gourmet/preset-react`. `@gourmet/group-react-i80` is a group of sub-packages that enables a React I80 support in your project.

Inside your SSR code, you use `@gourmet/react-i80` to implement your routing logic. `@gourmet/react-i80` is a main package that exposes user APIs. It comes as a sub-package in `@gourmet/group-react-i80`, so you don't need to include it as a dependency. Just import it inside your SSR code and Gourmet Builder will resolve it to the sub-package inside `@gourmet/group-react-i80`.

> #### Preset vs group
> In Gourmet SSR, a preset is a complete set of sub-packages that defines the target environment of your Gourmet SSR project. Presets are mutually exclusive, so your app must use only one preset in your app. (e.g. React vs Vue)
>
> On the other hand, a group is a set of related sub-packages to support an addition functionality, on top of a preset. Internally, groups are used as building blocks of presets too.

In Gourmet SSR, each page is a completely separated HTML endpoint from each other. That is, a transition between pages happens with clean, new browser sessions.

In `gourmet_config.js`, we defined two pages, named "main" and "public". We also defined `MainPage` and `PublicPage` as root components of the corresponding pages.

In our news app, we structured our pages and views as below.

```text
MainPage ----+-- NewsView
             |
             +-- SavedView
   
PublicPage --+-- LoginView
             |
             +-- SignupView
```


> #### Containers vs components
>

> #### Why another routing library?
> We could certainly use routing libraries already exist out there such as React Router.

## Auto-rebuild using `--watch`




### Pages and Views


 using React I80



### Data access API

### Adding authentication

### Fetching data

### Using React I80 for a routing

### Using CSS

### Debugging the app

### Adding watch mode

### Deploying the production build on AWS using Elastic Beanstalk

### Polyfill and browser support