const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const passportConfig = require("./passport");
const passport = require("passport");
/**
 * require './passport 는 require('./passport/index.js') 와 같다
 * 폴더내의 index.js 파일은 require 시 이름을 생략할 수있다
 * passport.initialize 미들웨어는
 * 요청(req객체)에 passport 설정을 심고,
 *
 * passport.session 미들웨어는
 * req.session 객체에 passport 정보를 저장한다
 *
 * req.session 객체는 express-session에서 생성하는 것이므로
 *
 * passport 미들웨어는
 * express-session 미들웨어보다
 * 뒤에연결되어야한다
 */

dotenv.config();
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const app = express();
// 패스포트설정
passportConfig();
//포트설정
app.set("port", process.env.PORT || 8001);
//view 엔진설정
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

//패스포트 설정 세션
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

/**
 * <미들웨어>
 * 미들웨어 요청과 응답의 중간에 위치함
 * 미들웨어를 익스프레스서버에 연결하는법
 * app.use('/주소') /주소로 모든 미들웨어
 * app.post('/주소') /주소 post 미들웨어
 */

app.use(passport.initialize());
app.use(passport.session());

// sequlize 설정
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database connect Success !!");
  })
  .catch((err) => {
    console.error(err);
  });
/**
 * morgan
 * dev / combined / common / short / tiny
 */
app.use(morgan("dev"));
/**
 * static
 * 정적인 파일들을 제공하는 라투어
 * 내장 미들웨어
 * pulbic 폴더를 만들고 css나 js, 이미지 파일들을 public 폴더에 넣으면 브라우저에서 접근할수 있다
 *
 * 요청주소에는 pulbic 이 들어있지않으므로 구조파악이 어렵게되어잇다
 * 보안에 도움이된다
 * fs.readFile로 파일을 직접 읽어서 전송할 필요없다
 * 파일이 없으면 next를 내부적으로 호출한다
 *
 */
app.use(express.static(path.join(__dirname, "public")));
/**
 * body-parser
 * 요청의 본문에있는 데이터를 해석해서
 * req.body객체로 만들어주는 미들웨어
 * form , ajax 처리
 * 멀티파티데이터는 처리 불가
 * multer 사용
 * 내장 미들웨어 (4.16 버젼부터)
 * json과 url-encoded 형식 데이터 웨에 Raw, Text 형식의 데이터를 추가 해석
 *
 * app.use(bodyParser.raw()) / app.use(boduParser.text()) 옵션을 추가한다
 *
 */
app.use(express.json());
//extended옵션
// false : queryString 모듈을 사용하여 쿼리스트링을 해석하고
// true : qs 모듈을 사용하여 쿼리스트링을 해석
app.use(express.urlencoded({ extended: false }));
//
/**
 * <cookie Parser>
 * 요청에 동봉된 쿠키를 해석해 req.cookies객체로 만듬
 * 유효기간이 지난 쿠키는 알아서 거른다
 * 서명된 쿠키는 req.signedCookies객체에 들어간다
 * cookie-parser가 쿠키를 생성할때 쓰이는것이아님
 * 쿠키 생성 제거를 하기위해서는 res.cookie, res.clearCookie 메서드를 사용한다
 * res.cookie(키, 값, 옵션)형식으로 사용한다
 * signed 옵션은 true일때 쿠키에 내 SECRET 붙여서 내가 만들었다는걸 검증할 수 있다.
 *
 */
app.use(cookieParser(process.env.COOKIE_SECRET));
// 쿠키옵션 domain, expires, httpOnly, maxAge, path, secure등
// 쿠키를 지울때도 옵션도 일치해줘야 쿠키가 삭제됨

/**
 * express-session 로그인등의 이유로 세션을 구현하거나 특정 사용자를 위한 데이터를 임시적으로 저장해둘때 유용
 * req.session안에 사용자별로 유지된다
 * cookie-parser 뒤에 놓는것이 안전
 * parser를 사용하기때문
 * 세션에 대한 설정을 인수로 받는다
 */
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use("/", pageRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});
/**
 * error처리미들웨어
 * err,req,res,next 네개여야한다
 * 모든 매개변수를 사용하지않아도 다사용
 * err에는 에러에관한 정보
 * res.stuts메서드로 상태코드를 지정
 * 기본값 200
 * 미들웨어를 직접 연결하지않아도 익스프레스가 에러처리를 한다
 * 실무에서는 직접 에러처리 미들웨어를 연결해주는것이 좋다
 * 에러처리 미들웨어는 가장아래위치
 *
 */
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
