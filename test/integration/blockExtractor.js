#!/usr/bin/env node
'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';



var assert        = require('assert'),
  config          = require('../../config/config'),
  BlockExtractor  = require('../../lib/BlockExtractor'),
  networks        = require('bitcore/networks'),
  util            =  require('bitcore/util/util');

var should = require('chai');
//var txItemsValid = JSON.parse(fs.readFileSync('test/model/txitems.json'));

describe('BlockExtractor', function(){

  var be = new BlockExtractor(config.bitcoind.dataDir, config.network);

  var network = config.network === 'testnet' ? networks.testnet: networks.startcoin;

  it('should glob block files ', function(done) {
    assert(be.files.length>0);
    done();
  });

  var lastTs;

  it('should read genesis block ', function(done) {
    be.getNextBlock(function(err,b) {
      assert(!err);
      var genesisHashReversed = new Buffer(32);
      network.genesisBlock.hash.copy(genesisHashReversed);
      var genesis = util.formatHashFull(network.genesisBlock.hash);

      assert.equal(util.formatHashFull(b.hash),genesis);
      assert.equal(b.nounce,network.genesisBlock.nounce);
      assert.equal(b.timestamp,network.genesisBlock.timestamp);
      assert.equal(b.merkle_root.toString('hex'),network.genesisBlock.merkle_root.toString('hex'));

      lastTs = b.timestamp;
      done();
    });
  });

  it('should read next '+config.network+' block ', function(done) {
    be.getNextBlock(function(err,b) {
      assert(!err);
      // 2nd block of testnet3
      util.formatHashFull(b.hash).should.equal('4d053299de50dea15836958fb19037d6c054632ba8fe3e2e964e9c5dae732fb5');
      assert(b.timestamp > lastTs, 'timestamp > genesis_ts');
      done();
    });
  });

  it.skip('should read 100000 blocks with no error ', function(done) {

    var i=0;
    while(i++<100000) {
      be.getNextBlock(function(err,b) {
        assert(!err,err);
        assert(lastTs < b.timestamp, 'genesisTS < b.timestamp: ' + lastTs + '<' + b.timestamp + ":" + i);
        if(i % 1000 === 1)  process.stdout.write('.');
        if(i === 100000) done();
      });
    }
  });



});



