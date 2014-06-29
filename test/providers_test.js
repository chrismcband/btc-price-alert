var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var unirest = require('unirest');
var providers = require('../providers');
var Provider = providers.Provider;

describe('providers', function(){
  it('should have createProvider function', function(){
    expect(providers).to.respondTo('createProvider')
  });

  it('should create Provider instance', function(){
    var providerInstance = providers.createProvider();
    expect(providerInstance).to.be.instanceof(Provider);
  });

  describe('Provider', function(){

    it('should allow options in constructor', function(){
      var options = {
        'name': 'test',
        'description': 'test description',
        'restUrl': 'http://localhost/test',
        'refreshInterval': 1000
      };
      var providerInstance = providers.createProvider(options);

      expect(providerInstance.getName()).to.equal(options.name);
      expect(providerInstance.getDescription()).to.equal(options.description);
      expect(providerInstance.getRestUrl()).to.equal(options.restUrl);
      expect(providerInstance.getRefreshInterval())
        .to.equal(options.refreshInterval);
    });

    describe('rest consumption', function(){
      var clock, providerInstance, fakeResponse;

      before(function(){
        clock = sinon.useFakeTimers();
        providerInstance = providers.createProvider({
          'name': 'test',
          'description': 'test description',
          'restUrl': 'http://localhost/test',
          'refreshInterval': 10000
        });
      });

      after(function(){
        clock.restore();
      });

      it('polls refreshPrice according to interval', function(){
        var stub = sinon.stub(providerInstance, 'refreshPrice');

        providerInstance.startListening();
        expect(stub).to.have.callCount(1);

        clock.tick(10001);
        expect(stub).to.have.callCount(2);

        clock.tick(30000);
        expect(stub).to.have.callCount(5);

        providerInstance.stopListening();
        clock.tick(20000);
        expect(stub).to.have.callCount(5);

        providerInstance.refreshPrice.restore();
      });

      it('caches last price information', function(){
        var fakeResponse = {
          "timestamp":"1404040957",
          "bid":0.00732265,
          "ask":0.00732618,
          "low":"0.006799",
          "high":"0.00748",
          "last":"0.00732265",
          "volume":"95411.59573083"
        };
        var mockUnirest = {
          'set': function(){

          },
          'end': function(callback){
            callback({body: JSON.stringify(fakeResponse)});
          }
        };

        sinon.mock(unirest).expects('get').twice().returns(mockUnirest);

        providerInstance.startListening();
        expect(providerInstance.getBid()).to.equal(fakeResponse.bid);
        expect(providerInstance.getAsk()).to.equal(fakeResponse.ask);

        fakeResponse.bid = 0.5;
        clock.tick(10001);
        expect(providerInstance.getBid()).to.equal(0.5);

        unirest.get.restore();
      });
    });

  });
});
