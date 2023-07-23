const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const renderInitialPage = require('../views/initialRender');

exports.getPage = catchAsync(renderInitialPage);