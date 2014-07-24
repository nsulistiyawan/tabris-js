/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Window", function() {

  var nativeBridge;
  var wnd;

  beforeEach(function () {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start( nativeBridge );
    wnd = tabris.Window.create();
  });

  describe( "created window", function() {

    it( "is an instance of tabris.Window", function() {
      expect(wnd).toEqual(jasmine.any(tabris.Window));
    });

  });

  describe("setTimeout", function() {

    var delay = 23;
    var taskId;
    var callback;
    var createCall;

    beforeEach(function() {
      callback = jasmine.createSpy("callback");
      taskId = wnd.setTimeout(callback, delay);
      createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];
    });

    it("creates native Timer", function() {
      expect(createCall).toBeDefined();
    });

    it("passes arguments to Timer creation", function() {
      expect(createCall.properties.delay).toBe(delay);
      expect(createCall.properties.repeat).toBe(false);
    });

    it("listens on Run event of native Timer", function() {
      var listenCall = nativeBridge.calls({id: createCall.id, op: "listen", event : "Run"})[0];
      expect(listenCall).toBeDefined();
    });

    it("returns a number", function() {
      expect(typeof taskId).toBe("number");
    });

    it("returns ascending numbers", function() {
      var nextTaskId = wnd.setTimeout(callback, 23);
      expect(nextTaskId).toBeGreaterThan(taskId);
    });

    describe("when notified", function() {

      beforeEach(function() {
        tabris._notify(createCall.id, "Run", {});
      });

      it("callback is called", function() {
        expect(callback).toHaveBeenCalled();
      });

      it("timer is disposed", function() {
        var destroyCall = nativeBridge.calls({id: createCall.id, op: "destroy"})[0];
        expect(destroyCall).toBeDefined();
      });

    });

    describe("clearTimeout", function() {

      beforeEach(function() {
        wnd.clearTimeout(taskId);
      });

      it("calls native cancelTask", function() {
        var cancelCall = nativeBridge.calls({id: createCall.id, op: "call", method: "cancel"})[0];
        expect(cancelCall).toBeDefined();
      });

      it("destroys native timer", function() {
        var destroyCall = nativeBridge.calls({id: createCall.id, op: "destroy"})[0];
        expect(destroyCall).toBeDefined();
      });

      it("tolerates unknown taskId", function() {
        wnd.clearTimeout(taskId + 1);
      });

    });

  });

  describe("setInterval", function() {

    var delay = 23;
    var taskId;
    var callback;
    var createCall;

    beforeEach(function() {
      callback = jasmine.createSpy("callback");
      taskId = wnd.setInterval(callback, delay);
      createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];
    });

    it("creates native Timer", function() {
      expect(createCall).toBeDefined();
    });

    it("passes arguments to Timer creation", function() {
      expect(createCall.properties.delay).toBe(delay);
      expect(createCall.properties.repeat).toBe(true);
    });

    it("listens on Run event of native Timer", function() {
      var listenCall = nativeBridge.calls({id: createCall.id, op: "listen", event : "Run"})[0];
      expect(listenCall).toBeDefined();
    });

    it("returns a number", function() {
      expect(typeof taskId).toBe("number");
    });

    it("returns ascending numbers", function() {
      var nextTaskId = wnd.setInterval(callback, delay);
      expect(nextTaskId).toBeGreaterThan(taskId);
    });

    it("returned numbers don't clash with getTimeout", function() {
      var timeoutTaskId = wnd.setTimeout(callback, delay);
      expect(timeoutTaskId).toBeGreaterThan(taskId);
    });

    describe("when notified", function() {

      beforeEach(function() {
        tabris._notify(createCall.id, "Run", {});
      });

      it("callback is called", function() {
        expect(callback).toHaveBeenCalled();
      });

      it("callback is called on subsequent Run events", function() {
        tabris._notify(createCall.id, "Run", {});

        expect(callback.calls.count()).toBe(2);
      });

    });

    describe("clearInterval", function() {

      beforeEach(function() {
        wnd.clearInterval(taskId);
      });

      it("calls native cancelTask", function() {
        var calls = nativeBridge.calls({id: createCall.id, op: "call", method: "cancel"});
        expect(calls.length).toBe(1);
      });

      it("destroys native timer", function() {
        var destroyCall = nativeBridge.calls({id: createCall.id, op: "destroy"})[0];
        expect(destroyCall).toBeDefined();
      });

      it("tolerates unknown taskId", function() {
        wnd.clearInterval(taskId + 1);
      });

    });

  });

});