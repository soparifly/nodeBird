const express = require("express");
const { Post, User, Hashtag } = require("../models/index.js");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares.js");

const router = express.Router();
/**
 * 로그인 한 경우에는 req.user가 존재하므로 팔로잉/ 팔로워 수와 팔로워 아이디 리스트를 넣는다
 *
 */
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
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

/**
 * 데이버이스에서 게시글을 조호히한후 결과를 twits에 넣어 렌더링
 * 조회할때 게시글 작성자의 아이디와 닉네임을 JOIN 해서 제공, 게시글 순서는 최신순으로 정렬
 */
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("main", {
      title: "NodeBird",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});
//Get hashtag로 쿼리스트링으로 해시태그 이름을 받고 해시태그값이 없는경우 메인페이지로 리다이랙트
// 데이터베이스에서 해시태그가 있으면 시퀄라이즈에서 제공하는 getPosts 메서드로 모든 게시글을 가져온다
// 작성자정보를 합쳐서 메인페이지를 렌더링하면서 전체 게시글 대신조회딘 게시글만 twits에 넣어렌더링
router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
