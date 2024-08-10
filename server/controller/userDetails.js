const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(request, response) {
  try {
    const tokenx = " ";
    if (request.body.token) {
      tokenx = request.body.token;
    }
    const token = request.cookies.token || tokenx;

    const user = await getUserDetailsFromToken(token);

    return response.status(200).json({
      message: "user details",
      data: user,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = userDetails;
