const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  console.log('advancedResults middleware called for model:', model.modelName);
  console.log('Request query:', req.query);

  // Create a copy of req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', '_sort', '_limit', 'search', 'feeStatus', 'sortByFees', 'q'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  console.log('Query string:', queryStr);
  console.log('Parsed query:', JSON.parse(queryStr));

  // Finding resource
  const parsedQuery = JSON.parse(queryStr);
  
  // Handle fee status filter for Student model
  if (model.modelName === 'Student' && req.query.feeStatus) {
    if (req.query.feeStatus === 'pending') {
      parsedQuery['fee.balance'] = { $gt: 0 };
    } else if (req.query.feeStatus === 'completed') {
      parsedQuery['fee.balance'] = { $lte: 0 };
    }
  }

  // Handle search query
  if (req.query.q && model.modelName === 'Student') {
    parsedQuery.$or = [
      { firstName: { $regex: req.query.q, $options: 'i' } },
      { lastName: { $regex: req.query.q, $options: 'i' } },
      { rollNumber: { $regex: req.query.q, $options: 'i' } },
      { phoneNumber: { $regex: req.query.q, $options: 'i' } }
    ];
  }

  query = model.find(parsedQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sortByFees && model.modelName === 'Student') {
    // Sort by fee balance
    if (req.query.sortByFees === 'desc') {
      query = query.sort('-fee.balance');
    } else if (req.query.sortByFees === 'asc') {
      query = query.sort('fee.balance');
    }
  } else if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(parsedQuery);

  console.log('Total documents found:', total);
  console.log('Page:', page, 'Limit:', limit);

  query = query.skip(startIndex).limit(limit);

  // Populate
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(populateOption => {
        query = query.populate(populateOption);
      });
    } else {
      query = query.populate(populate);
    }
  }

  // Executing query
  const results = await query;

  console.log('Results found:', results.length);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: total,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
