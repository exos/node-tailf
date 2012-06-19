var tailf = require('../index');


var fta = new tailf.simpleTailf('test.log');

fta.buffersize = 100;

fta.on('data', function () {
   console.log(arguments); 
});

fta.on('error', console.log);

fta.start(true);
