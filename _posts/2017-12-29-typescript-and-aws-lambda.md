---
title: "TypeScript and AWS Lambda"
layout: post
date: 2017-12-29 00:00
tag: aws
image: http://www.esynergy-solutions.co.uk/sites/default/files/TS.png
headerImage: true
description: "TypeScript and Dependency Injection in AWS Lambda"
category: blog
author: luis
externalLink: false
---

Eiler 2016 AWS Lambda only supported NodeJS v4.x and I wanted to take advantage of ES6. You could say: why didn't you used BabelJS?... ok, you got me, I not only wanted ES6 classes, generators, arrows, etc. the more important thing that I wanted was [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) and the best way to did that at that time was having TypeScript and Inversify, but thats [another story](http://develoser.mx/blog/typescript-dependency-injection). 

### What do I need?

- [NodeJS](https://nodejs.org/en/)
- [TypeScript package](https://www.npmjs.com/package/typescript)
- An [AWS Account](https://aws.amazon.com/account/)

A this point we are assuming you already have a current valid AWS Account from the which you could create a new Lambda service, also NodeJS installed and typescript installed globally, so let's start:

### Create a project

```shell
> mkdir project-folder
> cd project-folder
> npm init
> npm i -g typescript
```

### Configure TypeScript

```shell
> touch tsconfig.json
```

**tsconfig.json** content:
```json
{
    "compilerOptions": {
        "target": "es5",
        "lib": [
            "es6"
        ],
        "types": [
            "node",
            "reflect-metadata"
        ],
        "module": "commonjs",
        "outDir": "dist",
        "rootDir": ".",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

**Simple class and interface**
```typescript
export class Greeting implements IGreeting {

    greet(name?: string): string {
        return `Hello ${name ? name : 'stranger'}!`; 
    }

}

interface IGreeting {
    greet(name?: string): string
}

```

### Project Structure so far:

```
project-folder
│   tsconfig.json
└───node_modules
└───dist
│   │   my-class.js
│   
└───src
    │   my-class.ts
```


### Generate JavaScript files

Execute the following command in the root directoy:

```shell
> tsc --sourcemap
```

The above command will generate each corresponding ts file to js file in the folder that we specifed in the __tsconfig.json__ ("outDir": "dist") including the source mapping (why do I need source mapping? [debugging](http://develoser.mx/blog/debugging-typescript-with-vscode))
