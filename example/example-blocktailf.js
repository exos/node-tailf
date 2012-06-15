
var tailf = require('../index');

var fta = new tailf.blockTailf('test.log',/\n\n/);

fta.buffersize = 100;

fta.on('data', function (data) {
   
   console.log('LLEGO DATA:',data);
    
});

fta.on('error', console.log);

fta.start(true);
