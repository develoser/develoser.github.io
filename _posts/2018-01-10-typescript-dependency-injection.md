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

### Directory Structure

```shell
npm i -S inversify reflect-metada
```

### Root File

```shell
npm i -S inversify reflect-metada
```

### Interface Locator

```shell
npm i -S inversify reflect-metada
```

### Resolving Dependencies

```shell
npm i -S inversify reflect-metada
```
