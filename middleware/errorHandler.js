// const { logEvent } = require("./logger");

const errorHandler = (err, req, res, next) => {
  // logEvent(
  //   `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
  //   "errLog.log"
  // );

  const statusCode = err.statusCode || 500; //server error

  res.status(statusCode);

  if (process.env.NODE_ENV === "development") {
    return res.json({
      error: err.message.split(","),
      stack: err.stack,
    });
  }
  return res.json({
    error: err.message,
  });
};

module.exports = errorHandler;
