---
title: "TypeScript and AWS Lambda"
layout: post
date: 2017-12-29 00:00
tag: aws
image: /imgs/ts-aws.png
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
- [Gulp npm module](https://www.npmjs.com/package/gulp)
- [Lambda runner in local](https://www.npmjs.com/package/aws-lambda-function-sandbox-runner)
- node and reflect-metadata type definitions
- An [AWS Account](https://aws.amazon.com/account/)

A this point we are assuming you already have a current valid AWS Account from the which you could create a new Lambda service and also NodeJS installed, so let's start:

### Create a project

```shell
> mkdir project-folder
> cd project-folder
> npm init
> npm i -g typescript gulp
> npm i -S gulp gulp-shell aws-lambda-function-sandbox-runner @types/node @types/reflect-metadata
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

**greeting.ts**:
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

This is a pretty basic class, nothing special. We will save it as <strong>greeting.ts</strong> file under the <strong>src</strong> directory. In this directory we will place all typescript files.

### Generating JavaScript files

We have our class in typescript, but as we already know AWS Lambda only knows JavaScript, so lets generate js file from ts. In order to do that let's execute the following command in the root directoy:

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
└──────src
    │      greeting.js
│   
└───src
    │   greeting.ts
```

At this point we can create a lambda handler file, which imports our just generated class:

**handler.ts**
```ts
import { Greeting } from './src/greeting'

const greeting = new Greeting();

export const handler = (event: any, context: {succeed: Function, fail: Function}) => {
    context.succeed(greeting.greet(event.name));
}
```

Once again lets generate its corresponding js file. You already figured out that this could be a tedious tasks, it is actually, but we can easily solve it with a simple gulp file and a watch task:

**Gulpfile.js**:

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

Now everytime we modify a .ts file its corresponding .js will be generated automagically by:

```shell
> gulp tsc:watch
```

We don't need to worry about generating .js files any more, it's transparent, just keep runing the gulp watch task.

### Test our lambda in local

With the handler file generated we are now able to test our lambda function in local before deploying it to AWS, for that we will take advantage of **aws-lambda-function-sandbox-runner** module.

I have a npm script to execute lambda in local

**package.json:**
```json
{
    "scripts": {
        ...
        "lambda": "node ./scripts/lambda.js"
        ...
    }
}
```

**lambda.js:**
```javascript
const runner = require('aws-lambda-function-sandbox-runner');
runner.run(process.argv[2], process.argv[3], process.argv[4]);
```

**event.json:**
```json
{
    "name": "Luis Rivera"
}
```


**Execute the script:**
```shell
npm run lambda dist/handler.js handler event.json
```

If everything is setup right, you must see <i>Hello Luis Rivera!</i> output. If it is, congratulations, you are done!

### Deployment

You can now deploy your project either manually uploading a zip file or using Travis CI.

The following script is used to generate the zip file:
**build.sh**
```shell
rm -rf ./dist/node_modules
cp -R ./node_modules ./dist/node_modules
s
rm -rf compiled/
mkdir compiled

zip -r compiled/project-name.zip ./dist | grep 'deflated 9[0-9]\%'
```

You can now upload your just generated zip file to S3 when defining your lambda, or if you are a Travis CI user you can have a .travis.yml file similar to this and it would handle the upload process for you, just in case your connection is not good enought (have in mind you need to also upload the whole <i>node_modules</i> folder).

**.travis.yml**
```yaml
language: node_js
node_js:
  - "6.10"

install:
  - npm install -g typescript gulp
  - npm install
  - tsc --sourcemap

before_deploy:
  . build.sh  

deploy:
  provider: lambda
  function_name: "lambda-test"
  region: "us-east-1"
  role: "arn:aws:iam::0123456789012:role/lambda_basic_execution"
  runtime: "nodejs6.10"
  module_name: "dist/handler"
  handler_name: "handler"
  access_key_id: "AWS ACCESS KEY ID"
  secret_access_key: "AWS SECRET ACCESS KEY"
  zip: compiled/project-name.zip
```

That's it!

This was just a quickie about TypeScript and AWS Lambda, pretty basic setup stuff, in future posts we would talk about more complex samples, taking advantage of TypeScript for SOLID principles.

Happy Coding!
