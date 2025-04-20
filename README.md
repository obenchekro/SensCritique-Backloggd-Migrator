# SensCritique-Backloggd-Migrator

## Overview
This tool is designed to save you the hassle of manually rating your games on [Backloggd](https://backloggd.com) one by one.
It automates the rating process by syncing your existing ratings from your [SensCritique](https://www.senscritique.com/) collection directly into Backloggd.
That way, you can spend less time clicking — and more time gaming.

## Disclaimer
The solution provided is not affliated neither to SensCritique or Backloggd.  It relies on web crawling and private APIs that may change at any time, potentially breaking functionality.

## Setup
You'll need to prepare all the required dependencies in order to run this project:
```ts
npm i
```
then build and run the project:
```ts
npm run build
npm run start
```

## Warnings
Please read carefully before using or modifying the code.

This project contains several code smells, mostly due to limitations in the private GraphQL API exposed by SensCritique. We’re doing our best with the available options.

Some logic relies on web crawling specific DOM elements. This means the code may break if SensCritique or Backloggd changes their HTML structure or class names.

A few code snippets are case-sensitive and fragile by nature. Any change in capitalization or DOM attributes may cause them to fail silently.

Side effects may occur when intercepting or simulating certain DOM events. These issues can stem from third-party resources or external asynchronous requests.

Some game titles retrieved from SensCritique are labeled in french so the odds to not fetch the right game in Backloggd are quite high.

Use at your own risk — and feel free to submit improvements or bug reports by opening a new [issue](https://github.com/obenchekro/SensCritique-Backloggd-Migrator/issues/new)!

## How to use it?

### Step 1
Launch the migration process by clicking on the "Go To SensCritique" button

![SC1](https://i.imgur.com/0V9mh4A.png)

### Step 2
Simply log in to your SensCritique account as usual

![SC2](https://i.imgur.com/UbmlIKF.png)

You'll be redirected to this following page where all your games rated would be gathered up! Wait until all the games are fetched!

![SC3](https://i.imgur.com/4raUIBd.png)

### Step 3

You'll be again redirected to the backloggd login page where you'll connect to your account as you normally would

![SC4](https://i.imgur.com/UFF28zc.png)

### Step 4

**No action required!**

Sit back, relax, and enjoy this [videogamedunkey video](https://www.youtube.com/watch?v=ojapVW-7lQ0) while the app takes care of rating each of your migrated games, page by page — all by itself!

![SC5](https://i.imgur.com/6E2ARD8.png)

Then finally, when all your migration ratings come to fruition...
You'll be automatically redirected to your rated games page – a satisfying proof that the migration has been successfully accomplished

![SC5](https://i.imgur.com/N2TkjLP.png)

