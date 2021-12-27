// post.js;
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
/**
 * 서비스 특성에 따른 저장방식
 *
 * input  태그를 통해 이미지를 선택할때 업로드 진행
 * 이미지 경로는 데이터베이스에
 * 이미지는 서버디스크에 저장
 *
 */
const { Post, Hashtag } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();
try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("upload 폴더가 없어 uploads 폴더를 생성합니다");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
//이미지 하나를 업로드 받은뒤 이미지의 저장경로를 클라이언트로 응답
router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});
const upload2 = multer();
//게시글 업로드 처리 라우터
//req.body.url 로 전송됨
// multipart 이미지 데이터가 들어있지않으므로 none 메서드 사용

router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    console.log(req.body);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    // 게시글을 데이터 베이스에 저장한후 해시테그 정규 표현식으로 추출
    const hashtags = req.body.content.match(/#[^\s#]*/g);

    if (hashtags) {
      //findOrCreate 메서드를 사용
      //해시태그가 존재하면 가져오고 존재하지않으면 생성한후 가져옴
      // 결과값으로 모델, 생성여부를 반환
      const result = await Promise.all(
        hashtags.map((tag) => {
          // #을 떼고 소문자로 변경
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      // result.map(r => r[0])으로 모델만 추출
      //post.addHashtag메서드로 게시글과 연결
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
