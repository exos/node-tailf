var tailf = require('./tailf');
var events = require('events');

var blocktailf = function () {
    this.initialize.apply(this, arguments);
}

blocktailf.prototype = {
    
    maxbuffer: 1024*64,
    
    initialize: function (filename, cutstring) {
        
        var self = this;
        
        this.buffer = "";
        
        this.eventEmitter =  new events.EventEmitter();
        
        events.EventEmitter.call(this.eventEmitter);
        
        this.otailf = new tailf(filename);
        
        this.otailf.on('data', function (data) {
            
            self.buffer += data.toString();
            var md = self.buffer.split(cutstring);
            
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
    
    _throwError: function (message) {
        if (this.eventEmitter.listeners('error').length) {
            this.eventEmitter.emit('error',message);
        } else {
            throw new Error(message);
        }
    },
    
    start: function () {
        this.otailf.start();
    },
    
    stop: function () {
        this.otailf.stop();
    },
    
    on: function() {
        this.eventEmitter.on.apply(this.eventEmitter, arguments);
    }

}

module.exports = blocktailf;