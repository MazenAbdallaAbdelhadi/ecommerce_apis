const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

const logEvent = async (message, fileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs")))
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", fileName),
      logItem
    );
  } catch (e) {
    console.log(e);
  }
};

const logger = (req, res, next) => {
  logEvent(
    `${req.method}\t${req.url}\t${req.headers.origin}\t${req.ip}`,
    "reqLog.log"
  );
  next();
};

module.exports = { logEvent, logger };
