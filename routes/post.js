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
