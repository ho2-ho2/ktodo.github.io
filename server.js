const express = require('express')/** express다운 */
const app = express()/** express다운 */
const bodyParser = require('body-parser')/** body parser다운 */
app.use(bodyParser.urlencoded({ extended: true }))/** body parser다운 */
app.set('view engine', 'ejs') /** ejs다운 */
app.use('/public', express.static('public')); /*css파일 추가 */
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
const MongoClient = require('mongodb').MongoClient; /** 몽고db 불러오기*/
var db; /** 임의로 db 변수선언 */

MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.ukz6wet.mongodb.net/todoapp?retryWrites=true&w=majority', function (에러, client) {
    // 연결되면 할일   
    if (에러) return console.log(에러)

    db = client.db('todoapp');
    // db.collection('post').insertOne({ 이름: 'John', _id: 1, 나이: 20 }, function (에러, 결과) {
    //     console.log('저장완료');
    // });

    app.listen(8080, function () {
        console.log('listening on 8080')
    });
});


// 누군가가 / pet으로 방문을 하면
// pet 관련 안내문 띄어주자
app.get('/pet', function (요청, 응답) {
    응답.send('반갑습니다')
});
app.get('/beauty', function (요청, 응답) {
    응답.send('뷰티용품 쇼핑페이지임')
});
// app.get('/', function (요청, 응답) {
//     응답.sendFile(__dirname + '/index.html')
// });
// app.get('/write', function (요청, 응답) {
//     응답.sendFile(__dirname + '/write.html')
// });

app.get('/', function (요청, 응답) {
    응답.render('index.ejs')
})
app.get('/write', function (요청, 응답) {          /* 어떤 사람이 write로 접속하면*/
    응답.render('write.ejs') /* write.ejs보여줘*/
})

// 어떤사람이 /add 경로로 post 요청하면
// ~~를해주세요 
// app.post('/add', function (요청, 응답) {
//     응답.send('전송완료')
//     console.log(요청.body.title)
//     console.log(요청.body.date)
// });

// 어떤사람이 /add 경로로 post 요청하면
// 데이터2개(날짜,제목)을 보내주는데,
// 이 때 post라는 이름을 가진 collection에 두개 데이터를 저장하기 + 게시물마다 번호부여하기 (collection 하나 추가해서 총갯수 관리할거야)
// + counter라는 collection에 있는 totalPost라는 항목도 1증가시키기(수정)


// list로 get요청으로 접속하면
// 실제 db에 저장된 데이터들로 예쁘게 꾸며진 html 보여줘
app.get('/list', function (요청, 응답) {
    /** db에 저장된 post라는 collection 안에 모든 데이터를 꺼내주셈 */
    db.collection('post').find().toArray(function (에러, 결과) {
        console.log(결과);
        응답.render('list.ejs', { posts: 결과 }) /**ejs파일 보여주고 찾은걸 ejs파일에 집어 넣어주셈 */
    });
});
// 서버에서 query string 꺼내는법 , 검색기능
app.get('/search', (요청, 응답) => {
    var 검색조건 = [
        {
            $search: {
                index: '님이만든인덱스명',
                text: {
                    query: 요청.query.value,
                    path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                }
            }
        }]
    console.log(요청.query);
    db.collection('post').aggregate(검색조건).toArray((에러, 결과) => {
        console.log(결과)
        응답.render('search.ejs', { posts: 결과 })
    })
})




// 상세페이지 번호식 , 클릭할 때마다 상세페이지 (쇼핑몰처럼)
app.get('/detail/:id', function (요청, 응답) {          /* 어떤 사람이 detail/@로 접속하면*/
    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {  /* db에서 id가 @인 게시물 찾음*/
        응답.render('detail.ejs', { data: 결과 }) /*data에 찾은결과를 detail.ejs로 보냄 */
    })
});

// edit 페이지에 결과값을 미리 불러와야 수정하기 편함
app.get('/edit/:id', function (요청, 응답) {
    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        응답.render('edit.ejs', { post: 결과 })
    })
})

// edit put으로 요청하면 게시물 수정 처리하기
app.put('/edit', function (요청, 응답) {
    // 폼에 담긴 제목,날짜 데이터를 가지고 db.컬렉션에 업데이트함
    db.collection('post').updateOne({ _id: parseInt(요청.body.id) }, {
        $set: { 제목: 요청.body.title, 날짜: 요청.body.date }
    }, function (에러, 결과) {
        console.log('수정완료')
        응답.redirect('/list')
    })
})

// 회원 로그인페이지 기능 구현하기
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function (요청, 응답) {
    응답.render('login.ejs')
});
app.post('/login', passport.authenticate('local', {
    // local이라는 방식으로 검사하고 인증 실패시 /fail로 가라!
    failureRedirect: '/fail'
}), function (요청, 응답) {
    응답.redirect('/')
    // 인증성공하면 '/' 로보내주셈 
});

// 로그인을 하면 마이페이지로
app.get('/mypage', 로그인했니, function (요청, 응답) {
    console.log(요청.user)
    응답.render('mypage.ejs', { 사용자: 요청.user })
})
function 로그인했니(요청, 응답, next) {
    // 요청.user이 있으면 next() (통과)
    if (요청.user) {
        next()
        // 없으면 경고메세지
    } else {
        응답.send('로그인안하셨는데요?')
    }
}


// 인증하는 방법을 strategy라고함
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    // 아디비번말고 다른거 정보 검증할거? 안할거면 false
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

// 로그인한 유저의 개인정보를 db에서 찾는역할
passport.serializeUser(function (user, done) {
    done(null, user.id)
});
passport.deserializeUser(function (아이디, done) {
    //   디비에서 위에있는 user.id로 유저를 찾은 뒤에 유저정보를 {}안에 넣음!
    db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과)
    })
});

app.post('/register', function (요청, 응답) {
    db.collection('login').insertOne({ id: 요청.body.id, pw: 요청.body.pw }, function (에러, 결과) {
        응답.redirect('/')
    })
})
app.post('/add', function (요청, 응답) {
    응답.send('전송완료');
    /**db카운터 내의 총게시물갯수를 찾고 총게시물갯수를 변수에저장 */
    db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {
        console.log(결과.totalPost)
        var 총게시물갯수 = 결과.totalPost;
        var 저장할거 = { _id: 총게시물갯수 + 1, 작성자: 요청.user._id, 제목: 요청.body.title, 날짜: 요청.body.date, 작성자: 요청.user._id }
        /**post에 새게시물 기록하고 제목,날짜를 넣음 */
        db.collection('post').insertOne(저장할거, function (에러, 결과) {
            console.log('저장완료')
            /**완료되면 카운터 내의 총게시물 갯수+1 */
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
                if (에러) {
                    return console.log(에러)
                }
            })
        });
    });
});

// 삭제
app.delete('/delete', function (요청, 응답) {
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    var 삭제할데이터 = { _id: 요청.body._id, 작성자: 요청.user._id }
    // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주셈
    db.collection('post').deleteOne(삭제할데이터, function (에러, 결과) {
        console.log('삭제완료');
        if (에러) { console.log(에러) }
        응답.status(200).send({ message: '성공ㅋㅋ' });
    })
})


// route관리방법
app.use('/shop', require('./routes/shop.js'))
app.use('/board/sub', require('./routes/board.js'))

// 이미지 업로드 라이브러리
let multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/image')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

app.get('/upload', function (요청, 응답) {
    응답.render('upload.ejs')
})

app.post('/upload', upload.single('프로필'), function (요청, 응답) {
    응답.send('업로드완료')
})