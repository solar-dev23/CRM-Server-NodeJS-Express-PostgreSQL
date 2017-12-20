'use strict';

const nodemailer = require('nodemailer');
const env = require('../env');

const model = require('../model');
const mailModel = model.mailModel;

const LETTERS_HEAP_SIZE = 10;
const RESEND_ON_ERROR_INTERVAL = 60 * 1000;


let transporter = nodemailer.createTransport({
  service: env.POST_SERVICE,
  auth: {
    user: env.POST_ADDRESS,
    pass: env.POST_PASSWORD
  }
});

let mailWorkerTaskId = null;
let mailBoxDirty = false;

const sendLetter = function (letter) {
  let mailOptions = {
    from: letter.from,
    to: letter.to,
    subject: letter.subject,
    text: letter.text,
    html: letter.html
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (!error) {
        mailModel
          .removeById(letter.id)
          .then(() => resolve(info))
          .catch(reject);
      } else {
        reject(error);
      }
    });
  });
};

const sendLettersSynchronously = function (letters) {
  return new Promise((resolve, reject) => {
    if (letters.length > 0) {
      let letter = letters.shift();
      sendLetter(letter)
        .then(() => {
          if (letters.length > 0) {
            sendLettersSynchronously(letters)
              .then((sent) => resolve(++sent))
              .catch((sent) => reject(++sent));
          } else {
            resolve(1);
          }
        })
        .catch((error) => {
          console.error(error);
          reject(0);
        })
    } else {
      resolve(0);
    }
  });
};

const restartMailWorkerOnError = function () {
  setTimeout(() => {
    mailWorkerTaskId = null;
    sendMail();
  }, RESEND_ON_ERROR_INTERVAL);
};

const logMessagesSent = function (sent) {
  env.NODE_ENV === env.ENV_TYPE.development && console.info(`${sent} email messages was sent by mail worker`);
};

const sendMail = function () {
  if (mailWorkerTaskId) {
    mailBoxDirty = true;
    return;
  }
  mailBoxDirty = false;
  mailWorkerTaskId = setTimeout(() => {
    mailModel.loadLetters(LETTERS_HEAP_SIZE).then((letters) => {
      let lettersCount = letters.length;
      if (lettersCount > 0) {
        sendLettersSynchronously(letters).then((sent) => {
          logMessagesSent(sent);
          mailWorkerTaskId = null;
          sendMail();
        }).catch((sent) => {
          logMessagesSent(sent);
          restartMailWorkerOnError();
        });
      }
      else {
        mailWorkerTaskId = null;
        mailBoxDirty && sendMail();
      }
    }).catch((error) => {
      restartMailWorkerOnError();
      console.error(error);
    });
  }, 0);
};

module.exports.sendMail = sendMail;



