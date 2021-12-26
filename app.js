const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
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
const passport = require("./passport");

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

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
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

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
