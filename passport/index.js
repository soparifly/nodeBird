// index.js;
const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");
/**
 * Passport 핵심
 * passport.seriallizeUser
 * -로그인시 실행, 세션에 저장할 정보지정
 * passport.session 미들웨어가
 * passport.deserilazieUser 를
 * -매요청시 실행
 * 조회한 정보는 done이 실행되는 user
 * req.user에 저장됨
 *
 * session 에 불필요한 데이터를 담아두지않기위한 과정
 *
 */

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
  kakao();
};
