const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getPage = catchAsync(async (req, res, next) => {
  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('test');
});