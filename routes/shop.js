var router = require('express').Router();
function 로그인했니(요청, 응답, next) {
    // 요청.user이 있으면 next() (통과)
    if (요청.user) {
        next()
        // 없으면 경고메세지
    } else {
        응답.send('로그인안하셨는데요?')
    }
}
router.use(로그인했니)
router.get('/shirts', function (요청, 응답) {
    응답.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', function (요청, 응답) {
    응답.send('바지 파는 페이지입니다.');
});

module.exports = router;