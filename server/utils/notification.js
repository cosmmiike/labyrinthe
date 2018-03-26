var generateNotification = function(text) {
  return {
    text,
    createdAt: new Date().getTime()
  };
};

module.exports = {generateNotification};
