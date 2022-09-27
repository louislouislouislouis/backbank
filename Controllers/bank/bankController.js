const getLink = async (req, res, next) => {
  let { uderId } = req.body;

  res.status(200).json({ products: process.env.TEST });
};

exports.getLink = getLink;
