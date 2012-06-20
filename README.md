
Install
=======

With NPM
========

    npm install tailf

From sources
============

    git clone https://github.com/exos/node-tailf.git tailf

Specific version
================

If you want install an specific version you can see the tags section: https://github.com/exos/node-tailf/tags. The new features has code in a own branch, you see the actual branches and pull it. (if you clone the repo).

Watch a file changes and return a buffer with the new added data, for watch logs, etc.

```JS

var tailf = require('tailf');

var watchinglog = new tailf.simpleTailf('my.log');

watchinglog.on('data', function (data) {
    console.log('Data arrived: ' , data.toString());
});

```

blockTailf
==========

Watching file and emit data splited by a string or regular expresion.

Usage:
======

```JS

var tailf = require('tailf');

// emit a data event for once line
var watchinglog = new tailf.blockTailf('my.log',/\n/);

watchinglog.on('data', function (data) {
    console.log('Data arrived: ' , data);
});

```
