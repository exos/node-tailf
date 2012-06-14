var events = require('events');
var fs = require('fs');

var tailf = function () {
    this.initialize.apply(this, arguments);
}

tailf.prototype = {
    
    buffersize: 1024*64,
    startWithall: false,
  
    initialize: function (filename) {
        this._filename = filename;
        this._wathinstance = null;
        this._status = 0;
        this.eventEmitter =  new events.EventEmitter();
        
        events.EventEmitter.call(this.eventEmitter);
    },
    
    _throwError: function (message) {
        if (this.eventEmitter.listeners('error').length) {
            this.eventEmitter.emit('error',message);
        } else {
            throw new Error(message);
        }
    },
    
    _wlistener: function (curr, prev) {
        
        if (this.startWithall) {
            this.startWithall = false;
            var bstart = 0;
            var startin = curr.size;
        } else {
            var startin = prev.size;
            var bstart = curr.size - prev.size;
        }
        
        var sending = 0;
        
        if (bstart < 0) {
            this._throwError('File change, no add');
            return;
        }
        
        if (this.eventEmitter.listeners('data').length) {
        
            var streamer = fs.createReadStream(this._filename,{
                bufferSize: this.buffersize,
                start: startin,
                end: curr.size
            });

            var self = this;

            streamer.on('data', function (data) {
                sending += data.length;
                self.eventEmitter.emit('data',data,sending,bstart);
            });

            streamer.on('end', function () {
                streamer.destroy();
            });

            streamer.on('error', function (error) {
                self.eventEmitter.emit('error',error);
                streamer.destroy();
            });
            
        }
        
    },
    
    start: function (startWithall) {
        
        var startWithall = startWithall || false;
        
        this.startWithall = startWithall;
        
        if (this._status != 0) {
            throw Error ("Is not stoped");
        }
        
        this._status = 1;
        
        self = this;
        
        this._wathinstance = fs.watchFile(this._filename, function () {
            self._wlistener.apply(self,arguments);
        });
        
    },
    
    stop: function () {
        fs.unwatchFile(this._filename);
        this._wathinstance = null;
        
        this._status = 0;
    },
    
    on: function() {
        this.eventEmitter.on.apply(this.eventEmitter, arguments);
    }
    
};

module.exports = tailf;