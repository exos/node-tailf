
Watch a file changes and return a buffer with the new added data, for watch logs, etc.

simpleTailf
===========

Simple watching file

Methods
=======

start()
-------

Start the watching of file.

stop()
------

Stop the watching of file.

on(event_name, callback)
-----------------------

Subscribe to event

Events
======

data
----

On data is added to file

error
-----

On error watching the file

Usage:
======

```JS

var tailf = require('node-tailf');

var watchinglog = new tailf.simpleTailf('my.log');

watchinglog.on('data', function (data) {
    console.log('Data arrived: ' , data.toString());
});

```



blockTailf
==========

Watching file and emit data splited by a string or regular expresion.

Methods
=======

start()
-------

Start the watching of file.

stop()
------

Stop the watching of file.

on(event_name, callback)
-----------------------

Subscribe to event

Events
======

data
----

On data is added to file

error
-----

On error watching the file

Usage:
======

```JS

var tailf = require('node-tailf');

// emit a data event for once line
var watchinglog = new tailf.blockTailf('my.log',/\n/);

watchinglog.on('data', function (data) {
    console.log('Data arrived: ' , data);
});

```
