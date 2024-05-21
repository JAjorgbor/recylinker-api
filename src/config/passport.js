const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { PortalUser } = require('../models');
const { PortalAgency } = require('../models');
const { ConsoleUser } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const portalUser = await PortalUser.findById(payload.sub);
    const portalAgency = await PortalAgency.findById(payload.sub);
    const consoleUser = await ConsoleUser.findById(payload.sub);
    if (portalUser) {
      return done(null, portalUser);
    }
    if (consoleUser) {
      return done(null, consoleUser);
    }
    if (portalAgency) {
      return done(null, portalAgency);
    }
    done(null, false);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
