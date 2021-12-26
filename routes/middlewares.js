// middlewares.js;
/**
 * Passport 는 req객체에 isAuthenticaed 메서드를 추가한다
 * 로그인중이면 req.isAuthenticated()가 true
 * 아니면 false
 * 로그인 여부는 이 메서드로 확인이 가능하다
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("로그인 한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};
