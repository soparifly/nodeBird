// auth.js;
// "/auth" router
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");
const router = express.Router();
/**
 * 회원가입 라우터
 * 이메일 중복확인후 이미 있는 이메일이라면 회원가입 페이지로 되돌리고
 * 주소뒤에 에러 쿼리스트링으로 표시
 * 같은 이메일로 가입한 사용자가 없다면 비밀번호를 암호화, 사용자 정보 생성
 *
 * 회원가입시 비밀번호는 암호화해서 저장
 * bcrypt 사용 12이상 추천 31까지 사용 promise 지원하는 함수이므로 await를 사용
 */
router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;

  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect(`
		  join?error=exist`);
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});
/**
 * 로그인 라우터, 로그인 요청이 들어오면
 *
 * passprt.authenticate('local') 미들웨어가 로컬 로그인 전략을 수행
 * 미들웨어 이지만 라우터 미들웨어안에 들어있다
 *
 * 사용자 정의 기능을 추가하고 싶을때
 *
 * 이럴때는 내부 미들웨어에 req,res,next를 인수로 제공해서 호출한다
 *
 */
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    //로그인 라우터가 실행되고 문제가 없을때 두번째매개변수(user)값이 있다면 성공
    //   req.login 메서드를 호출
    // Passport는 req객체에 login 과 logout 메서드를 추가한다
    //   req.login은 passport.serializeUser를 호출한다
    // req.login에 제공하는 user객체가 serializeUser로 넘어간다
    return req.login(user, (loginError) => {
      //미들웨어 안에 미들웨어 사용자 정의기능을 추가하고싶을때
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }

      return res.redirect("/");
    })(req, res, next);
  });
});
/**
 * req.logout메서드는 req.user 객체를 제거
 * req.session.destroy는 req.session 객체의 내용을 제거한다
 * 세션정보를 지운후 메인페이지로 되돌아간다
 * 로그인헤제
 */
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "./kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
