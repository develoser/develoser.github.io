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

Eiler 2016 AWS Lambda only supported NodeJS v4.x and I wanted to take advantage of ES6. You could say: why didn't you used BabelJS?... ok, you got me, I not only wanted ES6 classes, generators, arrows, etc. the more important thing that I wanted was [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) and the best way to did it at that time was having TypeScript and Inversify, but thats another story. 

### What do I need?

- [NodeJS](https://nodejs.org/en/)
- [TypeScript npm module](https://www.npmjs.com/package/typescript)
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

Now, we are able to create a simple class and its interface:

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

### Generating JavaScript files

Execute the following command in the root directoy:

```shell
> tsc --sourcemap
```

The above command will generate each corresponding ts file to js file in the folder that we specifed in the __tsconfig.json__ ("outDir": "dist"). The **tsc** command is available once we installed typescript globally.

The ---sourcemap option is to include source mapping files. Why do I need source mapping?: [debugging](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps).

So, this is the project structure so far:

```
project-folder
│   tsconfig.json
└───node_modules/
└───dist
│   │   greeting.js
│   
└───src
    │   greeting.ts
```

At this point we can create a lambda handler file, which imports our just generated class:

```ts
import { Greeting } from './src/greeting'

const greeting = new Greeting();

export const handler = (event: any, context: {succeed: Function, fail: Function}) => {
    context.succeed(Greeting.greet(event.name));
}
```

Once again lets generate its corresponding js file. You already figured out that this could be a tedious tasks, it is actually, but we can easily solve it with a simple gulp file and a watch task:

```javascript
var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('tsc:watch', function() {
    gulp.watch([
        '**/*.ts',
    ], ['tsc:run']);
});

gulp.task('tsc:run', shell.task(['tsc --sourcemap']));
```

And don't forget to add gulp to our package 

```shell
> npm i -S gulp gulp-shell
```

So now everytime we modify a .ts file its corresponding .js will be generated automagically by:

```shell
> gulp tsc:watch
```
