var expect = require('expect');

var {generateNotification} = require('./notification');

describe('generateNotification', function() {
  it('should generate correct notification object', function() {
    var text = 'Notification';
    var notification = generateNotification(text);

    expect(notification.createdAt).toBeA('number');
    expect(notification).toInclude({text});
  });
});
