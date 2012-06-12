var tailf = require('../index');


var fta = new tailf.simpleTailf('test.log');

fta.buffersize = 100;

fta.on('data', function (data) {
   
   console.log('LLEGO DATA:',data.toString());
    
});

fta.on('error', console.log);

fta.start();