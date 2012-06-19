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
        
        this.cutstring = cutstring;
        
        this.buffer = "";
        
        this.lastchange = 0;
        
        this.eventEmitter = new events.EventEmitter();
        
        events.EventEmitter.call(this.eventEmitter);
        
        this.otailf = new tailf(filename);
        
        this.otailf.on('data', function (data,info) {
            
            var totalSize = info.end - info.start;
            
            self.buffer += data.toString('binary');
            
            var md = self.buffer.split(cutstring);
            
            if (info.sending > totalSize ) {
                this._throwError(new Error('Sending data is higher that totalsize'));
            }
            
            if (info.sending == totalSize ) {
                
                for (var i = 0; i < md.length ; i++ ) {
                    self.eventEmitter.emit('data',md[i]);
                }
                
                self.buffer = '';
                return;
                
            }
            
            if (md.length) {
                
                for (var i = 0; i < md.length-1 ; i++ ) {
                    self.eventEmitter.emit('data',md[i]);
                }
                
                self.buffer = md[md.length-1];
            }
            
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
        
    flush: function () {
       
        var md = this.buffer.split(this.cutstring);

        for (var i = 0; i < md.length ; i++ ) {
            self.eventEmitter.emit('data',md[i]);
        }

        self.buffer = '';
        return;
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