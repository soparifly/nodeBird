const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares.js");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = [];
  next();
});
/**
 * isLoggedIn 미들웨어 내부에 next 함수가 실행되면 다음 render가 있는 미들웨어로 넘어간다
 * 아니라면 isLogged내부의 403에러 발생
 *
 */
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { title: "내 정보 - NodeBird" });
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", { title: "회원가입 - NodeBird" });
});

router.get("/", (req, res, next) => {
  const twits = [];
  res.render("main", {
    title: "NodeBird",
    twits,
  });
});

module.exports = router;
