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
 */
router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, passport } = req.body;

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
