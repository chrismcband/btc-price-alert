var unirest = require('unirest');

function Provider(options){
  options = options || {}
  this.name = options.name || null;
  this.description = options.description || null;
  this.restUrl = options.restUrl || null;
  this.refreshInterval = options.refreshInterval || 30000;

  this.last = 0;
  this.bid = 0;
  this.ask = 0;
  this.high = 0;
  this.low = 0;
}

Provider.prototype.refreshPrice = function(){
  var that = this;

  var request = unirest.get(this.restUrl);
  request.set('Accepts', 'application/json');
  request.end(function(response){
    var data = JSON.parse(response.body);
    var keys = ['last', 'bid', 'ask', 'high', 'low'];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      that[key] = data[key];
    }
    console.log("Refreshed price for " + that.name + ", new price " + that.bid);
  });
};

Provider.prototype.startListening = function(){
  var that = this;

  console.log("Started listening for " + this.name + " provider, querying " +
    this.restUrl + " every " + this.refreshInterval+" ms...");

  this.timerId = setInterval(
    function() {
      that.refreshPrice();
    },
    this.refreshInterval
  );
  this.refreshPrice();
};

Provider.prototype.stopListening = function(){
  console.log("Stopped listening for " + this.name + " provider.");
  clearInterval(this.timerId);
};

Provider.prototype.getName = function(){
  return this.name;
};

Provider.prototype.getDescription = function(){
  return this.description;
};

Provider.prototype.getRestUrl = function(){
  return this.restUrl;
};

Provider.prototype.getRefreshInterval = function(){
  return this.refreshInterval;
};

Provider.prototype.getBid = function(){
  return this.bid;
};

Provider.prototype.getAsk = function(){
  return this.ask;
};

Provider.prototype.getHigh = function(){
  return this.high;
};

Provider.prototype.getLow = function(){
  return this.low;
};

exports.createProvider = function(options){
  return new Provider(options);
};

exports.Provider = Provider;