var events = require('events');
var fs = require('fs');

var tailf = function () {
    this.initialize.apply(this, arguments);
}

tailf.prototype = {
    
    buffersize: 1024*64,
    startWithall: false,
    status: 0,
  
    initialize: function (filename) {
        this._filename = filename;
        this._wathinstance = null;
        this._status = 0;
        this.eventEmitter =  new events.EventEmitter();
        this.sendsPool = [];
        
        events.EventEmitter.call(this.eventEmitter);
    },
    
    _throwError: function (message) {
        if (this.eventEmitter.listeners('error').length) {
            this.eventEmitter.emit('error',message);
        } else {
            throw new Error(message);
        }
    },
    
    _sendstream: function (s,e) {
        
        if (this.status == 1) {
            console.log('INTERN: Pooling: ', s,e);
            this.sendsPool.push([s,e]);
        }
        
        this.status = 1;
        
        var streamer = fs.createReadStream(this._filename,{
            bufferSize: this.buffersize,
            encoding: null,
            start: s,
            end: e
        });

        var self = this;
        
        var totalsend = 0;

        var f = function () {
            self.status = 0;
            
            if (self.sendsPool.length) {
                console.log('INTERN:  UP FROM POOL ');
                self._sendstream.apply(self, self.sendsPool.shift()  );
            }
            
        }

        streamer.on('data', function (data) {
            totalsend += data.length;
            console.log('INTERN: ', data.toString().substr(0,10) + '...' +  data.toString().substr(-10) + ' (' + data.length + ')'  );
            console.log('    : ',s, ' | ', e );
            self.eventEmitter.emit('data',data,totalsend,e-s);
        });

        streamer.on('end', function () {
            streamer.destroy();
            f();
        });

        streamer.on('error', function (error) {
            self.eventEmitter.emit('error',error);
            streamer.destroy();
            f();
        });
        
    },
    
    _wlistener: function (curr, prev) {
        
        var startin = prev.size;
        var endin = curr.size - 1;
        var bstart = endin - startin + 1;
        
        if (bstart < 0) {
            this._throwError('File change, no add');
            return;
        }
        
        if (this.eventEmitter.listeners('data').length) {
            console.log('NEW  CHANGE: ', startin, endin); 
            this._sendstream(startin, endin);
            
        }
        
    },
    
    start: function (startWithall) {
        
        var startWithall = startWithall || null;
        
        if (this._status != 0) {
            throw Error ("Is not stoped");
        }
        
        this._status = 1;
        
        self = this;
        
        this._wathinstance = fs.watchFile(this._filename, function () {
            self._wlistener.apply(self,arguments);
        });
        
        if (startWithall) {
            self._sendstream.apply(self,[0,fs.statSync(this._filename).size]);
        }
        
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