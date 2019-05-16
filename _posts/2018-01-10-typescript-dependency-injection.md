---
title: "TypeScript and Dependency Injection"
layout: post
date: 2018-01-10 20:42
tag: typescript
image: https://dosagemayvary.com/wp-content/uploads/2015/06/162223080.0.jpg
headerImage: true
category: blog
author: luis
externalLink: false
hidden: true
---

In a [previous post](http://develoser.mx/blog/typescript-aws) we have already explained how to setup a simple TypeScript (TS) project running in AWS Lambda, this time we are going to take advantage of having TS and introduce the last but not least <a href="https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)" target="_blank">SOLID</a> principle: <a href="https://en.wikipedia.org/wiki/Dependency_injection" target="_blank">Dependency Inversion/Injection (DI)</a>.

One of the situations that led me to TS instead of pure ES6 was the lack of a good library for DI. There are a lot of them ([Electrolyte](https://github.com/jaredhanson/electrolyte), [Spur-IoC](https://github.com/opentable/spur-ioc) among others) but all that I tested ended up looking like [monkey patch](https://en.wikipedia.org/wiki/Monkey_patch) in the fall of 2010, until [Inversify](http://inversify.io) arrived.


Inversify is a very cool library that handles dependency injection in a fancy way, taking all the advantage of TS ES6/7, inspiration of Ninject, decatorators, reflection and magic.

Let's get started.

### Installation

```shell
npm i -S inversify reflect-metada
```

We are assuming you already have an existing initialized npm package, if not what are you awting for? (```npm init```)

> The InversifyJS type definitions are included in the inversify npm package. InversifyJS requires TypeScript 2.0 and the *experimentalDecorators*, *emitDecoratorMetadata*, *types* and *lib* compilation options in your tsconfig.json file:

```json
{
    "compilerOptions": {
        "target": "es6",
        "lib": ["es6", "dom"],
        "types": ["reflect-metadata"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

### Directory Structure
```
project-folder
│   tsconfig.json
└───node_modules/
└───src
    │   classes/
    │   interfaces/
    │   types.ts
    │   container.ts

```

Do not pay attention to the types.ts and container.ts files, we will be talking about it a moment.


### Creating our interfaces

Following the Dependency Injection principle we need to work based on *abstrcations* rather than direct or concrete classes, those abstractions are better known as *interfaces*. So let's go ahead and define our first interface:

*src/interfaces/logger.interface.ts*
```typescript
export interface ILogger {
    log(...event: any[])
    error(...event: any[])
    warn(...event: any[])
    debug(...event: any[])
    info(...event: any[])
}
```

And now let's create the implementation of that interface:

*src/classes/logger.ts*
```typescript
import { injectable } from "inversify";
import { ILogger } from '../interfaces/logger/logger.interface';

const chalk = require('chalk');

@injectable()
export class Logger implements ILogger {

    log(...event: any[]) {
        event.unshift(this.getDateTime());
        console.log.apply(console, event);
    }

    warn(...event: any[]) {
        event.unshift(chalk.yellow(this.getDateTime()));
        console.warn.apply(console, event);
    }

    error(...event: any[]) {
        event.unshift(chalk.red('ERROR: '));
        event.unshift(chalk.red(this.getDateTime()));
        console.error.apply(console, event);
    }

    info(...event: any[]) {
        event.unshift(chalk.blue(this.getDateTime()));            
        console.info.apply(console, event);
    }

    debug(...event: any[]) {
        event.unshift(this.getDateTime());
        console.log.apply(console, event);
    }

    getDateTime() {
        return `${new Date().toISOString()} | `;
    }

} 
```

At this point there's nothing special, only a pretty basic implemantion of the ILogger interface. We are wraping the global *console* function with our own logic and making use of the npm *chalk* module to give the output some nice colors based on the type of the log function do we need.

But await! What is that *@injectable()* decorator used for? Well this is how we tell inversify that this is an *injectable* class and it could be *injected* by another class. 

### TYPES

Do your remeber the *types.ts* file listed in the directory strcuture?, well is time talk about it:

Inversify is pretty smart but we need to give it some clues in order to allow it to identify the interfaces at runtime for a later mapping to the concrete implementation.  

We achieve that creating a hash-table-alike file. We are using Symbol for abstraction but in theory we can use a plain string literals. 

*src/types.ts*
```typescript
let TYPES = {
    ILogger: Symbol("ILogger") // or using plain string: ILogger: "ILogger"
    // IInterfaceName: Symbol("IInterfaceNameUniqueIdentifier")
};

export default TYPES;
```

### Service Locator

Is time to map our interface with its class definition. In order to do that let's create a *container.ts* in charge of that:

> This is the only place in which there is some coupling. In the rest of your application your classes should be free of references to other classes.

*src/container.ts*
```typescript
import { Container } from "inversify";
import TYPES from "./types";
import { ILogger } from "./interfaces/logger.interface.ts";
import { Logger } from "./classes/logger.ts";

var container = new Container();
container.bind<ILogger>(TYPES.ILogger).to(Logger);
export default container;
```

The *container.bind()* method is used for linking abstractions to its implementation. The default behavior is creating one instance of the implementation each time the class is being injected, but there are other varitions like: *.inSingletonScope()*

```typescript
// no matter how many times the class is being injected
// it will always return a singleton 
container.bind<ILogger>(TYPES.ILogger).to(Logger).inSingletonScope();
```

### Resolving Dependencies

And here we are, finally. We are going to create a class that *injects* the ILogger abstraction without creating the class directly:

Create *src/interfaces/hello-world.interface.ts* file:
```typescript
export interface IHelloWorld {
    sayHello(): string
}
```

Add:
```typescript
    IHelloWorld: Symbol("IHelloWorld")
```
to: *src/types.ts*

Add:
```typescript
container.bind<IHelloWorld>(TYPES.IHelloWorld).to(HelloWorld);
```
to: *src/container.ts*

Create *src/hello-world.ts* file:
```typescript
import { injectable, inject } from "inversify";
import { ILogger } from '../interfaces/logger.interface';
import { IHelloWorld } from '../interfaces/hello-world.interface';
import { TYPES } from '../types.ts';

@injectable()
export class HelloWorld implements IHelloWorld {
    logger: ILogger

    constructor(
        @inject(TYPES.ILogger) logger: ILogger
    ) {
        this.logger = logger;
    }

    sayHello() {
        this.logger.info('Hello World with Inversify!');
    }

}
```

As you can see we are not creating the class directly but instead just injecting it using the inversify *inject()* method.

### Time to test

Everything is setup, so now we can create an entry point file, let's call it: *src/main.ts*:

```typescript
import { container } from "./container.ts";
import { TYPES } from "./types.ts";
import { IHelloWorld } from "./interfaces/hello-world.interface.ts";

// Magically creates the HelloWorld class with all its dependencies
let helloWorld = container.get<IHelloWorld>(TYPES.IHelloWorld);

helloWorld.sayHello(); // 2018-01-10 | Hello World with Inversify!

```

And that's it. This is the most basic sample of use of inversify, the reality is that inversify does a LOT more and we can discuss more complex samples making use of snapshots, scope dependencies, injecting a factory, etc, but that could be the topic for future posts.

Futher details could be found in the official InversifyJS website: [http://inversify.io/](http://inversify.io/)

Happy coding! </>