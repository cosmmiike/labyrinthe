var generateNotification = function(notification) {
  return {
    notification,
    createdAt: new Date().getTime()
  };
};

module.exports = {generateNotification};
