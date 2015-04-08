'use strict';

describe('Service: pdfService', function () {

  // load the service's module
  beforeEach(module('wechatGalleryClientApp'));

  // instantiate service
  var pdfService;
  beforeEach(inject(function (_pdfService_) {
    pdfService = _pdfService_;
  }));

  it('should do something', function () {
    expect(!!pdfService).toBe(true);
  });

});
