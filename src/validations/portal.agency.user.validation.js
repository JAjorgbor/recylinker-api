const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createPortalAgency = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
  }),
};

const getPortalAgencys = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPortalAgency = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updatePortalAgency = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
    })
    .min(1),
};

const deletePortalAgency = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPortalAgency,
  getPortalAgencys,
  getPortalAgency,
  updatePortalAgency,
  deletePortalAgency,
};
