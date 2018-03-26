var expect = require('expect');

var {generateData} = require('./data');

describe('generateData', function() {
  it('should generate correct data object', function() {
    var pointX = 184;
    var pointY = 133;
    var score = 33;
    var data = generateData(pointX, pointY, score);

    expect(data).toInclude({pointX, pointY, score});
  });
});
