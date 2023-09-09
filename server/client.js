
function Server() {
   var that = this;
   this.name = name;

   this.call = (name, callback) => {
      var request = new XMLHttpRequest();
      request.open('GET', name);
      request.onloadend = () => callback(request.responseText);
      request.send();
   }

   this.upload = (sketchName, sketchContent) => {
      var request = new XMLHttpRequest();
      request.open('POST', 'upload');

      var form = new FormData();
      form.append('sketchName', sketchName);
      form.append('sketchContent', sketchContent);

      request.send(form);
   }

   this.getTT = callback => {
      if (! this.getTT_request)
         this.getTT_request = new XMLHttpRequest();
      var request = this.getTT_request;

      request.open('POST', 'getTT');
      request.onloadend = () => callback(request.responseText);
      var form = new FormData();
      request.send(form);
   }

   this.set = (key, val) => {
      var request = new XMLHttpRequest();
      request.open('POST', 'set');

      var form = new FormData();
      form.append('key', key + '.json');
      form.append('value', JSON.stringify(val));
      request.send(form);
   }

   this.get = (key, callback, onErr) => {
      var request = new XMLHttpRequest();
      request.open('GET', key + '.json');
      request.onloadend = () => {
         if (request.responseText.indexOf('Cannot ') != 0)
            callback(JSON.parse(request.responseText));
         else if (onErr !== undefined)
            onErr(request.responseText);
      }
      request.send();
   }

   this.writeFile = (fileName, contents) => {
      var request = new XMLHttpRequest();
      request.open('POST', 'writeFile');
      var form = new FormData();
      form.append('fileName', fileName);
      form.append('contents', JSON.stringify(contents));
      request.send(form);
   }

   this.socket = null;

   this.construct = data => {
      let obj = data;
      if (Array.isArray(data)) {
         obj = [];
         for (let i = 0 ; i < data.length ; i++)
            obj.push(this.construct(data[i]));
      }
      else if (data.constructorName) {
         obj = new (eval(data.constructorName))();
         for (let f in data)
            obj[f] = this.construct(data[f]);
      }
      return obj;
   }

   this.connectSocket = () => {

      this.socket = new WebSocket("ws://" + window.location.hostname + ":22346");
      this.socket.binaryType = "arraybuffer";

      var that = this;
      this.socket.onmessage = event => {
         if (event.data instanceof ArrayBuffer)
            return;

         var obj = JSON.parse(event.data);

         if (obj.eventType) {
            obj.event.preventDefault = () => { };
            (events_canvas[obj.eventType])(obj.event);
            return;
         }

         if (obj.global) {
	    try {
	       if (obj.start !== undefined)
	          for (let i = 0 ; i < obj.value.length ; i++)
		     window[obj.global][obj.start + i] = this.construct(obj.value[i]);
               else
                  window[obj.global] = this.construct(obj.value);
            }
            catch (e) { }
            return;
         }

         if (obj.code) {
            try {
               eval(obj.code);
            }
            catch (e) { }
            return;
         }
      };
      return this.socket;
   };

   this.broadcastGlobalSlice = (name, start, end) =>
      this.broadcastObject( { global:name, start:start, value:window[name].slice(start,end) } );
   this.broadcastGlobal = name    => this.broadcastObject( { global:name, value:window[name] } );
   this.broadcastCode   = code    => this.broadcastObject( { code:code } );
   this.broadcastObject = object  => this.broadcast(JSON.stringify(object));
   this.broadcast       = message => {
      if (this.socket == null && this.connectSocket() == null) {
         console.log("socket is null, can't broadcast");
         return;
      }
      if (this.socket.readyState != 1) {
         console.log("socket is not open, can't broadcast");
         return;
      }
      this.socket.send(message);
   };

   this.synchronize = name => {
      if (window.clientID === undefined && window.clients !== undefined) {
         window.clientID = clients[clients.length-1];
	 if (clients.length == 1)                       // IF THERE IS ONLY ONE CLIENT,
	    this.get(name,                              // THEN THE VALUE IS INITIALIZED
	       s => window[name] = this.construct(s));  // FROM PERSISTENT STORAGE.
         else {
            window.needToUpdate = name;                 // ELSE WHEN A NEW CLIENT JOINS
            this.broadcastGlobal('needToUpdate');       // THE SESSION, IT BROADCASTS
            delete window.needToUpdate;                 // A NEED_TO_UPDATE INDICATOR.
         }
      }

      if (window.needToUpdate) {                        // WHEN THE OLDEST CLIENT GETS
         if (clientID == clients[0]) {                  // THE NEED_TO_UPDATE INDICATOR,
            window.updatedValue = window[needToUpdate]; // AS UPDATED_VALUE.
            this.broadcastGlobal('updatedValue');
            delete window.updatedValue;
         }
         delete window.needToUpdate;
      }

      if (window.updatedValue) {                        // WHEN ANY CLIENT RECEIVES THE
         window[name] = updatedValue;                   // UPDATED_VALUE, IT SETS ITS
         delete window.updatedValue;                    // OWN VALUE TO UPDATED_VALUE.
      }

      let time = Date.now() / 3000 >> 0;
      if (window.clients && time > this.time &&         // EVERY 3 SECONDS, THE OLDEST
          window.clientID == window.clients[0])         // CLIENT SAVES ITS CURRENT
	 this.set(name, window[name]);                  // VALUE TO PERSISTENT STORAGE.
      this.time = time;

      return window[name];
   }
   this.connectSocket();
}

