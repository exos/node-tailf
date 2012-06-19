var fs = require('fs');
var events = require('events');

var Tailf = function () {
    this.initialize.apply(this, arguments);
}

Tailf.prototype = {
    
    initialize: function (filename, options) {
        
        var options = options || {};
        
        this.filename = filename;
        this.buffersize = options.buffersize || 1024;
        
        this.EventEmitter = new events.EventEmitter();
        this.watcher = null;
        this.wstreams = [];
        this.status = 0;
        this.lastByte = 0;
        
        this.changeId = 0;
        
    },
    
    _throwError: function (err) {
        if (this.eventEmitter.listeners('error').length) {
            this.eventEmitter.emit('error',err);
        } else {
            throw err;
        }
    },
    
    _watchFile: function () {
        
        var self = this;
        this.watcher = fs.watch(this.filename, function () {
            
            var last = self.lastByte;
            var current = fs.statSync(self.filename).size;
            
            self.lastByte = current;
            
            var changeSize = current - last;
            
            if (changeSize < 0) {
                self._throwError(new Error("File change, dont increment"));
                return;
            }
            
            if (self.EventEmitter.listeners('data').length) {
                self._createStream(self.filename, last,current);
            }
            
        });
        
        this.watcher.on('error', function (err) {
            self._throwError(err);
        });
        
    },
    
    __runNextStream: function () {
        if (this.wstreams.legth) {
            var d = this.wstreams.shift();
            this._createStream(d[0],d[1],d[2]);
        }
    },
    
    _createStream: function (file, start, end) {
        
        var self = this;
        
        if (this.status != 0) {
            this.wstreams.push([file,start,end]);
            return;
        }
        
        this.status = 1;
        this.changeId++
        
        var stream = fs.createReadStream(file,{
            bufferSize: this.buffersize,
            encoding: 'binary',
            start: start,
            end: end
        });
        
        var f = function () {
            stream.destroy();
            self.status = 0;
            self.__runNextStream();
        }
        
        var totalsend = 0;
        
        stream.on('data', function (data) {
            
            totalsend += parseInt(data.byteLength); // In some machines this get NaN ??
            
            if (self.EventEmitter.listeners('data').length) {
                self.EventEmitter.emit('data', data, {
                    'start': start,
                    'end': end,
                    'sending': totalsend,
                    'changeno': self.changeId
                });
            }
            
        });
        
        stream.on('end', function () {
            self.status = 0;
            f();
        });
        
    },
    
    start: function (sendAll) {
        
        var sendAll = sendAll || false;
        
        this.lastByte = fs.statSync(this.filename).size;
        
        if (sendAll) {
            this._createStream(this.filename, 0, this.lastByte);
        }
        
        this._watchFile();
    },
    
    stop: function () {
        this.watcher.close();
    },
    
    // Events methods:
    
    on: function () {
        this.EventEmitter.on.apply(this.EventEmitter, arguments);
    },
    
    removeAllListeners: function () {
        this.EventEmitter.removeAllListeners.apply(this.EventEmitter, arguments);
    }
    
};

module.exports = Tailf;