var tailf = require('./tailf');
var events = require('events');

var blocktailf = function () {
    this.initialize.apply(this, arguments);
}

blocktailf.prototype = {
    
    maxbuffer: 1024*64,
    
    initialize: function (filename, cutstring) {
        
        var self = this;
        
        var cutstring = cutstring || /\n/;
        
        this.buffer = "";
        
        this.eventEmitter = new events.EventEmitter();
        
        events.EventEmitter.call(this.eventEmitter);
        
        this.otailf = new tailf(filename);
        
        this.otailf.on('data', function (data,info) {
            
            var totalSize = info.end -info.start;
            
            console.log("-------------------");
            console.log('start: ',info.start);
            console.log('end: ',info.end);
            console.log('total: ',totalSize);
            console.log('sending: ',info.sending);
            
            self.buffer += data.toString('binary');
            
            console.log ('  data: ', data.toString().substr(0,10), '...',data.toString().substr(-10));
            console.log ('  buffer: ', self.buffer.substr(0,10), '...',self.buffer.substr(-10));
            
            
            var md = self.buffer.split(cutstring);
            
            console.log("Partes encontradas: ", md.length);
            //console.log("  * estas: ", md);
            
            if (info.sending > totalSize ) {
                console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ERRORRRRRRRR@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
                console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ERRORRRRRRRR@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
                console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ERRORRRRRRRR@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
            }
            
            if (info.sending == totalSize ) {
                
                console.log("  * Yegamos al final, devolvemos todo: ");
                
                for (var i = 0; i < md.length ; i++ ) {
                    console.log ('       -',md[i].substr(0,10), '...',md[i].substr(-10));
                    self.eventEmitter.emit('data',md[i]);
                }
                
                console.log("  * borro buffer");
                console.log("=============================");
                self.buffer = '';
                return;
                
            }
            
            if (md.length) {
                
                console.log(" * Envio menos el ultimo");
                
                for (var i = 0; i < md.length-1 ; i++ ) {
                    console.log ('       -', md[i].substr(0,10), '...',md[i].substr(-10));
                    self.eventEmitter.emit('data',md[i]);
                }
                
                self.buffer = md[md.length-1];
            }
            
            console.log("  * Buffer quedo de: ", self.buffer.length)
            console.log ('       :', self.buffer.substr(0,10), '...',self.buffer.substr(-10));
                    
            if (self.buffer.length > this.maxbuffer) {
                self.buffer = '';
                throw Error ('Buffer over capacity');
                self.stop();
            }
            
        });
        
        this.otailf.on('error', function (error) {
            self._throwError(error);
        });
        
    },
    
    _throwError: function (message) {
        if (this.eventEmitter.listeners('error').length) {
            this.eventEmitter.emit('error',message);
        } else {
            throw new Error(message);
        }
    },
    
    start: function (startWithall) {
        this.otailf.start(startWithall);
    },
    
    stop: function () {
        this.otailf.stop();
    },
    
    on: function() {
        this.eventEmitter.on.apply(this.eventEmitter, arguments);
    }

}

module.exports = blocktailf;