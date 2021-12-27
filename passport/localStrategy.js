// localStratege.js;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");
/**
 * LocalStrategy 생성자를 첫번째 인수 - 전략설정
 * usernameField, passwordField에는 일치하는 로그인 라우터의 req.body 속성명을 적으면된다
 *
 */
module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });

          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);

            if (result) {
              done(null, exUser);
            } else {
              done(null, false, {
                message: "비밀번호 불일치",
              });
            }
          } else {
            done(null, false, { message: "비회원" });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
