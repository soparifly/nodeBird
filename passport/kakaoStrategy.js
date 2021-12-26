const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");

module.exports = () => {
  passport.use(
    /**
     * passport kakao 모듈,
     * Strategy 생성자 전략
     * 카카오로그인에 대한 설정
     * .clientID 카카오 발급
     * 노출 안되게 .env
     * callbackURL 카카오로부터 인증 결과를 받을 라우터주소
     */
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      /**
       * 기존 카카오를 통해 회원가입한 사용자가 있는지 조회
       * 가입되어있는경우 done함수를 호출하고 전략을 종료한다
       */
      async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (exUser) {
            done(null, exUser);
            /**
             * 카카오를 통해 회원가입한 사용자가 없다면 회원가입을 진행한다
             * profile에는 사용자 정보가 들어있다
             * 카카오에서 보내주는것.
             * profile객체에서 원하는 정보를 꺼내와 회원가입을 한다
             * 사용자를 생성한뒤 done 함수를 호출한다
             */
          } else {
            const newUser = await User.create({
              email: profile._json && profile._json.kakao_account_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
