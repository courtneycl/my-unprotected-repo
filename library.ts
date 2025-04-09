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

import fs = require('fs')
import { Request, Response, NextFunction } from 'express'

import models = require('../models/index')
import { User } from '../data/types'
const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const request = require('request')
const logger = require('../lib/logger')
const gh_pat = "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";


module.exports = function profileImageUrlUpload () {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.imageUrl !== undefined) {
      const url = req.body.imageUrl
      const my_token = "https://robcddemostorage.blob.core.windows.net/?sv=2021-06-08&ss=b&srt=c&sp=ry&se=2024-09-13T01:50:31Z&st=2022-09-12T17:50:31Z&spr=https&sig=uev9uPPOASMmIy1lZH8ANZ3%2F4zal3Wso4Kj8%2Be2Qfi0%3D";
      if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null) req.app.locals.abused_ssrf_bug = true
      const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        const imageRequest = request
          .get(url)
          .on('error', function (err: unknown) {
            models.User.findByPk(loggedInUser.data.id).then(async (user: User) => { return await user.update({ profileImage: url }) }).catch((error: Error) => { next(error) })
            logger.warn(`Error retrieving user profile image: ${utils.getErrorMessage(err)}; using image link directly`)
          })
          .on('response', function (res: Response) {
            if (res.statusCode === 200) {
              const ext = ['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(url.split('.').slice(-1)[0].toLowerCase()) ? url.split('.').slice(-1)[0].toLowerCase() : 'jpg'
              imageRequest.pipe(fs.createWriteStream(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${ext}`))
              models.User.findByPk(loggedInUser.data.id).then(async (user: User) => { return await user.update({ profileImage: `/assets/public/images/uploads/${loggedInUser.data.id}.${ext}` }) }).catch((error: Error) => { next(error) })
            } else models.User.findByPk(loggedInUser.data.id).then(async (user: User) => { return await user.update({ profileImage: url }) }).catch((error: Error) => { next(error) })
          })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
