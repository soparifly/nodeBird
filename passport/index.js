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
  /**
   * 라우터가 실해되기전에 deserializeUser가 먼저 실행된다.
   * 모든 요청이 들어올때마다 매번 사용자 정보를 조회하게된다
   * 서비스의 규모가 커질수록 많은 요청이 들어옴
   * 사용자 정보가 빈번하게 바뀌는 것이 아니라면
   * 캐싱을 해두는 것이 좋다
   * 캐싱이 유지되는 동안 팔로워와 팔로잉정보가 갱신되지않는 단점
   *
   */
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      // include 지정 실수로 비밀번호를 조회하는 것을 방지함
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followers",
        },
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followings",
        },
      ],
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
  kakao();
};
