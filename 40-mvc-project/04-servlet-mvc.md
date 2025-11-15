# MVC 구조 익히기 (Servlet + Service) 구현

## 📘 학습 개요

MVC 패턴으로 웹사이트를 구축할때 순서를 알아보고 회원가입과 로그인 페이지 만들어보기.

> **MVC (Model–View–Controller)**

- Model: 데이터 및 비즈니스 로직 담당 (예: DAO, DTO, Service)

- View: 사용자에게 보여지는 화면 담당 (예: JSP, HTML)

- Controller: 요청을 받고 처리 흐름을 제어 (예: Servlet)

## 💡 주요 내용

1. 요구/라우팅 정의

2. DB 스키마/DTO + DAO 구현

3. Service 레이어(비즈니스 규칙)

4. Controller (Servlet)

5. View (JSP/HTML)

## ⚙️ 필요한 라이브러리 추가하기

1. 디렉터리 이동 ( `jsp.servlet.localhost` 경로 다르면 확인 ):
    ```bash
    cd /var/www/jsp.servlet.localhost/WEB-INF/lib
    ```

2. `mysql-connector-j-9.5.0.tar.gz` 압축 파일 다운로드:
    ```bash
    wget https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-9.5.0.tar.gz
    ```

3. `mysql-connector-j-9.5.0.tar.gz` 압축해제:
    ```bash
    tar -xvf mysql-connector-j-9.5.0.tar.gz
    ```

4. `.jar` 파일을 톰캣 공용 라이브러리에 복사:
    ```bash
    sudo cp mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar /usr/share/tomcat10/lib/
    ```


## 1. 라우팅 표 만들기

- 어떤 URL이 어떤 동작을 할지 표로 먼저 확정 ( 예시: )

    | Method | Path           | 기능     | 뷰/응답           |
    | -----: | -------------- | ------ | -------------- |
    |    GET | /user/register | 회원가입 폼   | `register.jsp` |
    |    GET | /user/register_ok | 회원가입 축하  | `register_ok.jsp` |
    |    GET | /user/login | 로그인 화면   | `login.jsp` |    
    |    GET | /user/login_ok | 로그인 성공 화면   | `login_ok.jsp` |    
    |   POST | /user/register | 회원가입 처리  | /user/register_ok 로 리다이렉트 |    
    |   POST | /user/login | 로그인 처리   | /user/login_ok 로 리다이렉트|    


## 2. DB 스키마/DTO + DAO 구현

1. 스키마 확정

    - 테이블/컬럼/제약/인덱스/기본 데이터(Seed)

2. `DTO` ( Data Transfer Object )

    - `User.java` - user 테이블 row(행)

        ```java
        package localhost.myapp.user;

        /**
        * User 엔티티(모델) 클래스
        * - JavaBean 규칙 준수 (private 필드 + getter/setter)
        * - JSP/EL에서 ${user.id} 형태로 접근 가능 (getId() 호출)
        * - DB 조회/삽입 시 DAO에서 값을 채워 넣는 용도
        */
        public class User {

            /** 고유 번호 (Primary Key) */
            public int idx;

            /** 사용자 아이디 */
            public String id;

            /** 비밀번호 (해싱된 값이 들어감) */
            public String password;

            /** 이메일 */
            public String email;

            /** 회원 가입 날짜 (문자열로 저장: yyyy-MM-dd HH:mm:ss 등) */
            public String regDate;


            /** 기본 생성자 (JavaBean 규약) */
            public User() {}

            // ---------- Getter / Setter ----------

            /** idx 반환 (JSP에서 ${user.idx} → getIdx() 호출) */
            public int getIdx() {
                return idx;
            }

            /** idx 설정 (DAO에서 rs.getInt("idx") 값 저장 시 사용) */
            public void setIdx(int idx) {
                this.idx = idx;
            }

            /** id 반환 */
            public String getId() {
                return id;
            }

            /** id 설정 */
            public void setId(String id) {
                this.id = id;
            }

            /** password 반환 */
            public String getPassword() {
                return password;
            }

            /** password 설정 */
            public void setPassword(String password) {
                this.password = password;
            }

            /** email 반환 */
            public String getEmail() {
                return email;
            }

            /** email 설정 */
            public void setEmail(String email) {
                this.email = email;
            }

            /** regDate 반환 */
            public String getRegDate() {
                return regDate;
            }

            /** regDate 설정 */
            public void setRegDate(String regDate) {
                this.regDate = regDate;
            }
        }
        ```

    - `Board.java` - board 테이블 row(행)
        ```java
        package localhost.myapp.board; // 이 클래스가 속한 패키지 지정 (폴더 구조와 매칭됨)

        /**
        * Board DTO(데이터 전달 객체)
        * - DB의 board 테이블 한 행(row)을 그대로 담는 역할
        * - JavaBean 규약(필드는 private, getter/setter 제공)을 따름
        * - JSP의 EL(${board.title})에서 getter를 자동으로 호출하여 값을 읽을 수 있음
        */
        public class Board {

            /** 게시글 번호 (Primary Key, DB의 idx에 해당) */
            public int idx;

            /** 게시글 제목 */
            public String title;

            /** 게시글 내용 */
            public String content;

            /** 게시글 등록일 (문자열 형태로 저장: yyyy-MM-dd HH:mm:ss 등) */
            public String regDate;

            // ---------------------- Getter / Setter ----------------------

            /**
            * 게시글 번호(idx) 읽기
            * JSP에서 ${board.idx} 라고 쓰면 내부적으로 getIdx()가 자동 호출됨
            */
            public int getIdx() {
                return idx;
            }

            /**
            * 게시글 번호(idx) 설정
            * DAO에서 DB 조회 시 rs.getInt("idx") 값을 넣어주는 용도로 사용
            */
            public void setIdx(int idx) {
                this.idx = idx;
            }

            /**
            * 게시글 제목(title) 읽기
            */
            public String getTitle() {
                return title;
            }

            /**
            * 게시글 제목(title) 설정
            */
            public void setTitle(String title) {
                this.title = title;
            }

            /**
            * 게시글 내용(content) 읽기
            */
            public String getContent() {
                return content;
            }

            /**
            * 게시글 내용(content) 설정
            */
            public void setContent(String content) {
                this.content = content;
            }

            /**
            * 게시글 작성일(regDate) 읽기
            */
            public String getRegDate() {
                return regDate;
            }

            /**
            * 게시글 작성일(regDate) 설정
            */
            public void setRegDate(String regDate) {
                this.regDate = regDate;
            }
        }
        ```

        - `JSTL` + `EL`에서 사용하기 위해 `DTO` 클래스에서 `Getter`/`Setter`가 필요한 이유는 `JavaBean` 규칙 을 따르기 때문.

           1. `JavaBean` 규칙이란?

                > `Java`에서 `JSP`·`EL`·프레임워크들이 객체와 데이터를 쉽게 주고받기 위해 정한 표준 규칙.

                > 즉, `${user.id}`라고 적으면 `user.getId()` 메서드를 호출해서 값을 읽는다.

                | EL 표현           | 실제 호출되는 메서드       |
                | --------------- | ----------------- |
                | `${user.id}`    | `user.getId()`    |
                | `${user.email}` | `user.getEmail()` |
                | `${user.age}`   | `user.getAge()`   |


                - 예외: 첫 2글자가 모두 대문자인 경우 → 그대로 유지

                    | EL 표현           | 실제 호출되는 메서드       |
                    | --------------- | ----------------- |
                    | `${object.URL}`    | `object.getURL()`    |
                    | `${object.HTMLText}` | `object.getHTMLText()` |
                    | `${object.UUID}`   | `object.getUUID()`   |



3. `DAO` ( Data Access Object ) 

    - `UserDao.java` - user 테이블 관련 SQL문을 실행하고 결과를 반환.

        ```java
        package localhost.myapp.user;                         // UserDao 클래스가 속한 패키지 선언

        import localhost.myapp.common.DB;                     // DB 커넥션 풀(DataSource) 제공 클래스 import

        import javax.sql.DataSource;                          // DataSource 인터페이스
        import java.sql.*;                                     // JDBC 관련 클래스들 import

        /**
        * UserDao: user 테이블에 대한 CRUD 중 일부 기능을 담당하는 DAO 클래스
        * - 회원가입(insert)
        * - 아이디로 회원 조회(findById)
        * - 아이디 존재 여부 확인(existsById)
        * - 로그인 검증(login)
        */
        public class UserDao {

            private final DataSource ds = DB.getDataSource(); // DB.getDataSource()로 커넥션 풀 객체 생성

            /**
            * 회원가입 (INSERT)
            * 비밀번호는 DB에서 sha2(?, 256)으로 단방향 해싱하여 저장
            */
            public boolean insert(User u) throws SQLException {

                // password는 sha2(?,256)으로 서버가 아닌 MySQL에서 해싱 처리함
                String sql = "INSERT INTO user (id, password, email) VALUES (?, sha2(?, 256), ?)";

                try (Connection con = ds.getConnection();      // 커넥션 풀에서 Connection 가져오기
                    PreparedStatement ps = con.prepareStatement(sql)) { // 쿼리 준비

                    ps.setString(1, u.id);                    // 첫 번째 ? = 사용자 ID
                    ps.setString(2, u.password);              // 두 번째 ? = 평문 password → MySQL sha2()로 해싱됨
                    ps.setString(3, u.email);                 // 세 번째 ? = email

                    return ps.executeUpdate() == 1;           // INSERT 실행 → 영향받은 행이 1이면 성공
                }
            }

            /**
            * 아이디로 사용자 한 명 조회
            * 회원정보 보여주기/로그인 전 아이디 확인 등에서 사용
            */
            public User findById(String id) throws SQLException {

                String sql = "SELECT * FROM user WHERE id=?";  // 특정 id로 조회하는 SQL

                try (Connection con = ds.getConnection();      // 커넥션 가져오기
                    PreparedStatement ps = con.prepareStatement(sql)) { // 쿼리 준비

                    ps.setString(1, id);                      // 첫 번째 ? = 검색할 사용자 ID

                    try (ResultSet rs = ps.executeQuery()) {  // SELECT 실행 후 결과를 ResultSet으로 받음

                        if (rs.next()) {                     // 조회 결과가 있을 경우

                            User u = new User();             // User DTO 객체 생성

                            u.idx = rs.getInt("idx");        // idx 컬럼 값 저장
                            u.id = rs.getString("id");       // id 저장
                            u.email = rs.getString("email"); // email 저장
                            u.regDate = rs.getString("reg_date"); // 가입일 저장

                            return u;                        // 완성된 User 객체 반환
                        }

                        return null;                         // 조회 결과 없음 → null 반환
                    }
                }
            }

            /**
            * 특정 ID가 존재하는지 확인 (회원가입 중복 체크에 사용)
            * idx만 가져오므로 빠르고 가볍다.
            */
            public User existsById(String id) throws SQLException {

                String sql = "SELECT idx FROM user WHERE id=?"; // 존재 여부 조회 → idx만 SELECT

                try (Connection con = ds.getConnection();        // 커넥션 가져오기
                    PreparedStatement ps = con.prepareStatement(sql)) { // 쿼리 준비

                    ps.setString(1, id);                        // 첫 번째 ? = 아이디

                    try (ResultSet rs = ps.executeQuery()) {    // SELECT 실행

                        if (rs.next()) {                        // 결과 존재 시

                            User u = new User();                // User 객체 생성
                            u.idx = rs.getInt("idx");           // idx만 저장하여 빠르게 체크

                            return u;                           // 존재하면 User 반환
                        }

                        return null;                            // 존재하지 않으면 null
                    }
                }
            }

            /**
            * 로그인 (ID + PASSWORD 일치 여부 확인)
            * 비밀번호는 SQL에서 sha2(?, 256)을 사용해 비교
            */
            public boolean login(String id, String password) throws SQLException {

                // 입력된 패스워드를 sha2(?,256)으로 해싱해서 DB에 저장된 값과 비교
                String sql = "SELECT COUNT(*) FROM user WHERE id=? AND password=sha2(?, 256)";

                try (Connection con = ds.getConnection();        // 커넥션 가져오기
                    PreparedStatement ps = con.prepareStatement(sql)) { // SQL 준비

                    ps.setString(1, id);                         // 첫 번째 ? = ID
                    ps.setString(2, password);                   // 두 번째 ? = 평문 password (SQL에서 해싱됨)

                    try (ResultSet rs = ps.executeQuery()) {     // SELECT 실행 → COUNT(*) 결과

                        rs.next();                               // COUNT(*)는 무조건 한 행이므로 next() 한 번 호출
                        return rs.getInt(1) == 1;                // 결과가 1이면 로그인 성공, 0이면 실패
                    }
                }
            }
        }

        ```

    - `BoardDao.java` - board 테이블 관련 SQL문을 실행하고 결과를 반환.
        ```java
        package localhost.myapp.board; // 현재 클래스가 속한 패키지

        import localhost.myapp.common.DB; // DB 커넥션 풀(DataSource)을 제공하는 DB 유틸 클래스

        import javax.sql.DataSource; // DataSource 인터페이스 (커넥션 풀)
        import java.sql.*; // JDBC 관련 클래스 (Connection, PreparedStatement 등)
        import java.util.ArrayList; // ArrayList 사용
        import java.util.List; // List 인터페이스

        /**
        * 게시판 CRUD 전용 DAO 클래스
        * DAO(Data Access Object)는 DB 처리 로직만 담당한다.
        * Controller/Service는 DB 코드를 직접 작성하지 않고 DAO에게 맡긴다.
        */
        public class BoardDao {

            private final DataSource ds = DB.getDataSource(); // DB.getDataSource()로 커넥션 풀 객체 생성

            /**
            * 게시글 목록 조회 (페이징)
            * page(1부터 시작), size(한 페이지의 개수)
            */
            public List<Board> findAll(int page, int size) throws SQLException {

                int limit = Math.max(1, Math.min(size, 100)); // size는 최소 1, 최대 100으로 제한
                int offset = Math.max(0, (page - 1) * limit); // OFFSET 계산 (page=1이면 offset=0)

                // DESC 정렬로 최신 글 먼저 → LIMIT/OFFSET으로 페이징
                String sql = "SELECT idx, title, content, reg_date " +
                        "FROM board " +
                        "ORDER BY idx DESC " +
                        "LIMIT ? OFFSET ?";

                try (Connection con = ds.getConnection(); // 커넥션 풀에서 Connection 하나 가져오기
                        PreparedStatement ps = con.prepareStatement(sql)) { // SQL을 준비하는 PreparedStatement 생성

                    ps.setInt(1, limit); // 첫 번째 ? = LIMIT
                    ps.setInt(2, offset); // 두 번째 ? = OFFSET

                    try (ResultSet rs = ps.executeQuery()) { // SELECT 실행 → 결과 ResultSet 반환

                        List<Board> list = new ArrayList<>(); // 결과 목록을 담을 리스트

                        while (rs.next()) { // 결과행이 있을 때까지 반복

                            Board b = new Board(); // Board 객체 생성

                            b.idx = rs.getInt("idx"); // DB의 idx 컬럼 값을 Board.idx 필드에 저장
                            b.title = rs.getString("title"); // DB title → Board.title
                            b.content = rs.getString("content"); // DB content → Board.content
                            b.regDate = rs.getString("reg_date");// DB reg_date → Board.regDate

                            list.add(b); // 리스트에 객체 추가
                        }

                        return list; // 최종 목록 반환
                    }
                }
            }

            /**
            * 한 개의 게시글 상세 조회
            * idx(PK)를 기준으로 조회
            */
            public Board findById(int idx) throws SQLException {

                String sql = "SELECT * FROM board WHERE idx=?"; // PK 조건 조회

                try (Connection con = ds.getConnection(); // 커넥션 얻기
                        PreparedStatement ps = con.prepareStatement(sql)) { // SQL 준비

                    ps.setInt(1, idx); // 첫 번째 ?에 idx 바인딩

                    try (ResultSet rs = ps.executeQuery()) { // SELECT 실행 → ResultSet 반환

                        if (rs.next()) { // 결과가 존재하면

                            Board b = new Board(); // Board 객체 생성

                            b.idx = rs.getInt("idx"); // idx 컬럼 가져와 저장
                            b.title = rs.getString("title"); // title 저장
                            b.content = rs.getString("content"); // content 저장
                            b.regDate = rs.getString("reg_date");// reg_date 저장

                            return b; // 객체 반환
                        }

                        return null; // 결과가 없을 경우 null 반환
                    }
                }
            }

            /**
            * 게시글 등록
            */
            public Integer insert(Board b) throws SQLException {

                String sql = "INSERT INTO board (title, content) VALUES (?, ?)"; // INSERT SQL

                try (Connection con = ds.getConnection(); // 커넥션 얻기
                        PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) { // SQL 준비

                    ps.setString(1, b.title); // 첫 번째 ? = title
                    ps.setString(2, b.content); // 두 번째 ? = content

                    int affected = ps.executeUpdate(); // INSERT 실행

                    if (affected == 0) {
                        return null; // INSERT 실패
                    }

                    // 생성된 PK(idx) 가져오기
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (rs.next()) {
                            return rs.getInt(1); // PK (AUTO_INCREMENT)
                        }
                    }

                    return null; // 혹시 키가 없으면 null
                }
            }

            /**
            * 게시글 수정
            */
            public boolean update(Board b) throws SQLException {

                String sql = "UPDATE board SET title=?, content=? WHERE idx=?"; // UPDATE SQL

                try (Connection con = ds.getConnection(); // 커넥션 얻기
                        PreparedStatement ps = con.prepareStatement(sql)) { // SQL 준비

                    ps.setString(1, b.title); // 1번 파라미터 = 새 title
                    ps.setString(2, b.content); // 2번 파라미터 = 새 content
                    ps.setInt(3, b.idx); // 3번 파라미터 = 조건 idx

                    return ps.executeUpdate() == 1; // 1행이 변경되면 true
                }
            }

            /**
            * 게시글 삭제
            */
            public boolean delete(int idx) throws SQLException {

                String sql = "DELETE FROM board WHERE idx=?"; // DELETE SQL

                try (Connection con = ds.getConnection(); // 커넥션 얻기
                        PreparedStatement ps = con.prepareStatement(sql)) { // SQL 준비

                    ps.setInt(1, idx); // 첫 번째 ? = 삭제할 idx

                    return ps.executeUpdate() == 1; // 삭제 성공이면 true
                }
            }

            /**
            * 전체 게시글 개수 조회
            */
            public int countAll() throws SQLException {

                String sql = "SELECT COUNT(*) FROM board"; // 전체 행 개수 구하는 SQL

                try (Connection con = ds.getConnection(); // 커넥션 얻기
                        PreparedStatement ps = con.prepareStatement(sql); // SQL 준비
                        ResultSet rs = ps.executeQuery()) { // 실행 후 ResultSet 얻기

                    if (rs.next()) { // COUNT(*)는 한 행만 반환됨
                        return rs.getInt(1); // 첫 번째 컬럼(int) = 전체 개수
                    }

                    return 0; // 비정상 상황 대비
                }
            }

        }
        ```

        - `PreparedStatement`

            > 미리 컴파일된 SQL + 바인딩만 하는 안전하고 빠른 SQL 실행 도구. 

            | 메서드               | 용도                               |
            | ----------------- | -------------------------------- |
            | `setXXX()` 계열 메서드  | 값 바인딩 ( setString, setInt, setTimestamp, setObject )                           |
            | `executeQuery()`  | SELECT                           |
            | `executeUpdate()` | INSERT / UPDATE / DELETE         |
            
            - SQL Injection 방지 ( setXXX() 계열 메서드 )

                > ? 에 값만 넣기 때문에 "kim"; DROP TABLE user; --" 같은 공격도 문자열로 취급됨
        
        - `try-with-resources` 패턴 사용
            ```java
                try (
                    Connection con = ds.getConnection();
                    PreparedStatement ps = con.prepareStatement(sql)
                ) {
                    ...
                }
            ```
            - try() 안에 선언한 객체는 자동으로 close() 호출됨

            - 정상/예외 관계없이 무조건 close() 호출됨

            - try 안에서 사용 안하면 무조건 close() 해줘야 함 ( 옛날방식 )

            - close() 안하면 서버장애 발생

    4. `/ex/dao.java` - Dao 코드 테스트

        ```java
        package localhost.myapp.ex;

        @WebServlet("/ex/dao")
        public class dao extends HttpServlet {

            // 데이터베이스 접근 객체(DAO)
            private final UserDao userDao = new UserDao();

            @Override
            protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

                // 1) 응답 인코딩 설정 (한글 깨짐 방지)
                resp.setCharacterEncoding("UTF-8");

                // 2) JSON 응답임을 브라우저에게 알림
                resp.setContentType("application/json; charset=UTF-8");

                try {
                    // 3) DB에서 사용자 정보 조회
                    User u = userDao.findById("1234");

                    // 4) 조회된 User 객체를 JSON 문자열로 변환
                    String json = new Gson().toJson(u);

                    // 5) JSON 응답 출력
                    resp.getWriter().print(json);

                } catch (SQLException e) {
                    // 6) DB 예외 발생 시 서버 로그 출력
                    e.printStackTrace();

                    // 7) 클라이언트에게 오류 응답(JSON) 보내기
                    resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    resp.getWriter().print("{\"error\": \"DB 조회 중 오류가 발생했습니다.\"}");
                }
            }
        }
        ```

## 3. Service 레이어(비즈니스 규칙)

- DAO 조합, 검증, 예외 변환

- 예) 아이디 중복 확인 → 저장 → 결과 반환

- `ServiceResult.java` - “결과 메시지”용 DTO ( 여러 서비스들에서 공통적으로 사용가능 )
    ```java
    package localhost.myapp.dto;

    /**
    * 공통 서비스/API 응답 DTO
    *
    * - success : 성공 여부
    * - message : 메시지 (성공/실패 이유)
    * - data : 실제 담을 데이터 (제네릭)
    *
    * 예)
    * ServiceResult<Integer> : 새로 생성된 게시글 idx
    * ServiceResult<Board> : 게시글 한 건
    * ServiceResult<List<Board>> : 게시글 목록
    */
    public class ServiceResult<T> {

        /** 요청 성공 여부 */
        public boolean success;

        /** 메시지 (성공/실패 이유) */
        public String message;

        /** 실제 데이터 (없으면 null) */
        public T data;

        public ServiceResult() {
        }

        public ServiceResult(boolean success, String message, T data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        /** ✔ 성공 (데이터만 있는 버전) */
        public static <T> ServiceResult<T> ok(T data) {
            return new ServiceResult<>(true, null, data);
        }

        /** ✔ 성공 (메시지 + 데이터) */
        public static <T> ServiceResult<T> ok(String message, T data) {
            return new ServiceResult<>(true, message, data);
        }

        /** ❌ 실패 (메시지만, data=null) */
        public static <T> ServiceResult<T> fail(String message) {
            return new ServiceResult<>(false, message, null);
        }
    }

    ```

- `UserService.java`
    ```java
    package localhost.myapp.user;

    import java.sql.SQLException;
    import localhost.myapp.dto.ServiceResult;

    /**
    * User 도메인의 비즈니스 규칙(Service Layer)을 담당.
    *
    * ✔ Controller(Servlet) ↔ Service ↔ DAO 구조에서 "Service" 역할
    * - 파라미터 검증
    * - 중복 확인
    * - 예외 처리 일관화
    * - DAO 호출 결과를 ServiceResult로 감싸 일관된 응답 제공
    */
    public class UserService {
        private final UserDao dao; // 데이터베이스 접근 객체(DAO)

        public UserService() {
            this.dao = new UserDao();
        }

        // 테스트용 또는 외부에서 DAO 주입 가능하도록 하는 생성자
        public UserService(UserDao dao) {
            this.dao = dao;
        }

        /**
        * -----------------------------
        * 🚀 회원가입 처리
        * - 입력값 검증
        * - 아이디 중복 체크
        * - DB insert
        * - ServiceResult 로 성공/실패 메시지 반환
        * ------------------------------
        */
        public ServiceResult<Void> register(String id, String password, String email) {
            try {
                // 1) 기본 형식 검증
                validateRegister(id, password, email);

                // 2) 아이디 중복 검사
                if (dao.existsById(id) != null) {
                    return ServiceResult.fail("이미 존재하는 아이디입니다.");
                }

                // 3) User 객체 생성
                User u = new User();
                u.id = id.trim();
                u.password = password; // DAO에서 SHA2 해시 처리
                u.email = email.trim();

                // 4) DB 저장
                boolean ok = dao.insert(u);

                // 5) 결과 반환 (data는 사용하지 않으므로 null)
                return ok
                        ? ServiceResult.ok("회원가입 성공", null)
                        : ServiceResult.fail("회원가입 실패");

            } catch (IllegalArgumentException e) {
                // validateRegister()에서 발생된 예외 처리
                return ServiceResult.fail(e.getMessage());

            } catch (SQLException e) {
                // DB 관련 예외 처리
                return ServiceResult.fail("데이터베이스 오류: " + e.getMessage());
            }
        }

        /**
        * -----------------------------
        * 🔐 로그인 처리
        * - 기본값 검증
        * - DAO.login(id, pw) 호출
        * - 성공/실패를 ServiceResult 로 반환
        * ------------------------------
        */
        public ServiceResult<Void> login(String id, String password) {
            try {
                // 필수 입력값 체크
                if (id == null || id.trim().isEmpty() ||
                        password == null || password.isEmpty()) {

                    return ServiceResult.fail("아이디/비밀번호를 입력해 주세요.");
                }

                // DAO에서 비밀번호 SHA2 비교
                boolean ok = dao.login(id.trim(), password);

                // data는 사용하지 않으므로 null
                return ok
                        ? ServiceResult.ok("로그인 성공", null)
                        : ServiceResult.fail("로그인 실패");

            } catch (SQLException e) {
                return ServiceResult.fail("데이터베이스 오류: " + e.getMessage());
            }
        }

        /*
        * ========================================
        * 🔽 내부 유틸 메서드 (Service 내부용)
        * ========================================
        */

        /** 회원가입 입력값 검증 */
        private void validateRegister(String id, String password, String email) {
            if (id == null || id.trim().length() < 4) {
                throw new IllegalArgumentException("아이디는 4자 이상이어야 합니다.");
            }
            if (password == null || password.length() < 4) {
                throw new IllegalArgumentException("비밀번호는 4자 이상이어야 합니다.");
            }
            if (email == null || !email.contains("@")) {
                throw new IllegalArgumentException("올바른 이메일을 입력해 주세요.");
            }
        }
    }
    ```

- `BoardService.java`
    ```java
    package localhost.myapp.board;

    import localhost.myapp.dto.ServiceResult;
    import java.sql.SQLException;
    import java.util.List;

    public class BoardService {

        private final BoardDao dao;

        public BoardService() {
            this.dao = new BoardDao();
        }

        public BoardService(BoardDao dao) {
            this.dao = dao;
        }

        /** 목록 페이징 (Read는 그대로 반환) */
        public List<Board> list(int page, int size) throws SQLException {
            if (page < 1)
                page = 1;
            if (size < 1)
                size = 10;
            return dao.findAll(page, size);
        }

        /** 전체 개수 */
        public int count() throws SQLException {
            return dao.countAll();
        }

        /** 단건 조회 (없으면 null) */
        public Board get(int idx) throws SQLException {
            if (idx <= 0)
                return null;
            return dao.findById(idx);
        }

        /** 생성 : 성공 시 새 idx 가 data로 들어감 */
        public ServiceResult<Integer> create(String title, String content) {
            try {
                validate(title, content);

                Board b = new Board();
                b.title = title.trim();
                b.content = content.trim();

                Integer newId = dao.insert(b);

                if (newId == null) {
                    return ServiceResult.fail("게시글 등록에 실패했습니다.");
                }

                return ServiceResult.ok("게시글이 등록되었습니다.", newId);

            } catch (IllegalArgumentException e) {
                return ServiceResult.fail(e.getMessage());

            } catch (SQLException e) {
                return ServiceResult.fail("데이터베이스 오류: " + e.getMessage());
            }
        }

        /** 수정 */
        public ServiceResult<Void> update(int idx, String title, String content) {
            try {
                if (idx <= 0) {
                    return ServiceResult.fail("잘못된 게시글 번호입니다.");
                }

                validate(title, content);

                Board b = new Board();
                b.idx = idx;
                b.title = title.trim();
                b.content = content.trim();

                boolean ok = dao.update(b);

                if (!ok) {
                    return ServiceResult.fail("게시물이 존재하지 않습니다.");
                }

                return ServiceResult.ok("게시글이 수정되었습니다.", null);

            } catch (IllegalArgumentException e) {
                return ServiceResult.fail(e.getMessage());

            } catch (SQLException e) {
                return ServiceResult.fail("데이터베이스 오류: " + e.getMessage());
            }
        }

        /** 삭제 */
        public ServiceResult<Void> delete(int idx) {
            try {
                if (idx <= 0) {
                    return ServiceResult.fail("잘못된 게시글 번호입니다.");
                }

                boolean ok = dao.delete(idx);

                if (!ok) {
                    return ServiceResult.fail("게시물이 존재하지 않습니다.");
                }

                return ServiceResult.ok("게시글이 삭제되었습니다.", null);

            } catch (SQLException e) {
                return ServiceResult.fail("데이터베이스 오류: " + e.getMessage());
            }
        }

        /** 공통 검증 */
        private void validate(String title, String content) {
            if (title == null || content == null) {
                throw new IllegalArgumentException("제목과 내용을 입력해야 합니다.");
            }

            String t = title.trim();
            String c = content.trim();

            if (t.isEmpty() || c.isEmpty()) {
                throw new IllegalArgumentException("제목과 내용을 입력해야 합니다.");
            }

            if (t.length() > 45) {
                throw new IllegalArgumentException("제목은 45자 이하로 입력해주세요.");
            }
        }
    }
    ```

- `/ex/service.java` - Service 코드 테스트
    ```java
    package localhost.myapp.ex;

    @WebServlet("/ex/service")
    public class service extends HttpServlet {

        // 서비스 레이어: 비즈니스 로직(검증/처리)을 담당
        private final UserService userService = new UserService();

        // Gson 인스턴스 재사용
        private final Gson gson = new Gson();

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

            // 1) 응답을 UTF-8로 인코딩 (한글 깨짐 방지)
            resp.setCharacterEncoding("UTF-8");

            // 2) JSON 응답임을 브라우저에게 안내
            resp.setContentType("application/json; charset=UTF-8");

            // 3) 서비스 레이어 호출 (회원가입 로직 실행 예제)
            // ServiceResult<Void> → data 는 null
            ServiceResult<Void> r = userService.register("test1", "test1", "test@test.com");

            // 4) 응답 객체(ServiceResult)를 JSON 문자열로 변환
            String json = gson.toJson(r);

            // 5) JSON을 HTTP 응답으로 전송
            resp.getWriter().print(json);
        }
    }
    ```

## 4. Controller (Servlet)

- 파라미터 파싱, 기본 검증(널/빈값/형식), 서비스 호출, 뷰로 포워드 또는 JSON/리다이렉트

- 예외는 공통 필터/에러페이지로 위임

- `UserController.java`
    ```java
    package localhost.myapp.user;

    import jakarta.servlet.ServletException;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.*;
    import localhost.myapp.dto.ServiceResult;

    import java.io.IOException;

    /**
    * UserController
    *
    * - URL 패턴: /user/*
    * 예) /user/login, /user/register, /user/logout 등
    * - 역할: 로그인/로그아웃/회원가입 처리(Controller)
    * - GET → 화면 이동 (JSP forward)
    * - POST → 실제 처리(login, register)
    *
    * Controller 흐름
    * 1) 클라이언트 요청
    * 2) pathInfo 로 세부 경로 확인
    * 3) 필요한 JSP 또는 서비스 호출
    * 4) 결과에 따라 redirect 또는 forward
    */
    @WebServlet("/user/*")
    public class UserController extends HttpServlet {

        // 사용자 관련 비즈니스 로직을 담당하는 서비스
        private final UserService service = new UserService();

        /**
        * pathInfo 정규화 함수
        * - null 또는 "" → "/" 로 변경
        * - 마지막에 "/" 가 있으면 제거 (단, "/" 자체는 그대로 유지)
        * 예)
        * "/login/" → "/login"
        * null → "/"
        */
        private String normPath(HttpServletRequest req) {
            String p = req.getPathInfo();
            if (p == null || p.isEmpty())
                return "/";
            if (p.length() > 1 && p.endsWith("/"))
                return p.substring(0, p.length() - 1);
            return p;
        }

        /**
        * GET 요청 처리
        * - 보통 화면 이동 담당
        * - /login → login.jsp
        * - /logout → 세션 종료 후 로그인 페이지로 redirect
        */
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

            String path = normPath(req); // 정리된 경로값
            System.out.println(path); // 디버깅용 출력

            switch (path) {

                // 로그인 화면
                case "/login":
                    req.getRequestDispatcher("/WEB-INF/view/user/login.jsp")
                            .forward(req, resp);
                    break;

                // 로그인 성공 화면
                case "/login_ok":
                    req.getRequestDispatcher("/WEB-INF/view/user/login_ok.jsp")
                            .forward(req, resp);
                    break;

                // 회원가입 화면
                case "/register":
                    req.getRequestDispatcher("/WEB-INF/view/user/register.jsp")
                            .forward(req, resp);
                    break;

                // 회원가입 성공 화면
                case "/register_ok":
                    req.getRequestDispatcher("/WEB-INF/view/user/register_ok.jsp")
                            .forward(req, resp);
                    break;

                // 로그아웃 처리
                case "/logout":
                    HttpSession session = req.getSession(false);
                    if (session != null) {
                        session.invalidate(); // 세션 완전 종료
                    }
                    // 다시 로그인 화면으로
                    resp.sendRedirect(req.getContextPath() + "/user/login");
                    break;

                // 기본 URL → /user/ → 로그인 페이지로 보냄
                case "/":
                    resp.sendRedirect(req.getContextPath() + "/user/login");
                    break;

                // 정의되지 않은 URL
                default:
                    resp.sendError(HttpServletResponse.SC_NOT_FOUND, "페이지를 찾을 수 없습니다.");
            }
        }

        /**
        * POST 요청 처리
        * - 실제 이동이 아닌 "데이터 처리(login, register)" 담당
        * - 성공 → 성공 페이지 redirect
        * - 실패 → flash 메시지 저장 후 다시 원래 페이지로 redirect
        */
        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

            String path = normPath(req);
            HttpSession session = req.getSession();

            // 공통 파라미터
            String id = req.getParameter("id");
            String password = req.getParameter("password");

            switch (path) {

                /** -------------------- 로그인 처리 -------------------- */
                case "/login":
                    try {
                        ServiceResult<Void> r = service.login(id, password);

                        if (r.success) {
                            // 로그인 성공 → 세션에 id 저장
                            session.setAttribute("id", id);
                            resp.sendRedirect(req.getContextPath() + "/user/login_ok");
                        } else {
                            // 실패 메시지를 flash 로 전달
                            session.setAttribute("flash_error", r.message);
                            resp.sendRedirect(req.getContextPath() + "/user/login");
                        }

                    } catch (Exception e) {
                        log("login failed", e);
                        session.setAttribute("flash_error", "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                        resp.sendRedirect(req.getContextPath() + "/user/login");
                    }
                    break;

                /** -------------------- 회원가입 처리 -------------------- */
                case "/register":

                    String email = req.getParameter("email");

                    try {
                        // 제네릭 타입 맞추기: ServiceResult<Void>
                        ServiceResult<Void> r = service.register(id, password, email);

                        if (r.success) {
                            // 회원가입 성공 → 자동 로그인 비슷하게 세션에 id 저장
                            session.setAttribute("id", id);
                            resp.sendRedirect(req.getContextPath() + "/user/register_ok");
                        } else {
                            session.setAttribute("flash_error", r.message);
                            resp.sendRedirect(req.getContextPath() + "/user/register");
                        }

                    } catch (Exception e) {
                        log("register failed", e);
                        session.setAttribute("flash_error", "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                        resp.sendRedirect(req.getContextPath() + "/user/register");
                    }
                    break;

                /** -------------------- 기타 잘못된 POST 요청 -------------------- */
                default:
                    System.out.println("잘못된 요청입니다");
                    resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "잘못된 요청입니다.");
            }

        }
    }
    ```

- `BoardController.java`
    ```java
    package localhost.myapp.board;

    import localhost.myapp.dto.ServiceResult;

    import jakarta.servlet.ServletException;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.HttpServlet;
    import jakarta.servlet.http.HttpServletRequest;
    import jakarta.servlet.http.HttpServletResponse;
    import jakarta.servlet.http.HttpSession;

    import java.io.IOException;
    import java.sql.SQLException;
    import java.util.List;

    /**
    * BoardController
    *
    * 라우팅 규칙 (URL 구조)
    * - GET
    * /board/list → 목록 페이지
    * /board/detail → 상세 페이지
    * /board/write → 글쓰기 페이지
    * /board/edit → 수정 페이지
    *
    * - POST
    * action=create → 게시글 생성
    * action=update → 게시글 수정
    * action=delete → 게시글 삭제
    *
    * Controller 역할:
    * - 사용자 요청 파악 (pathInfo, action)
    * - 필요한 Service 호출
    * - JSP로 forward 또는 redirect
    */
    @WebServlet("/board/*")
    public class BoardController extends HttpServlet {

        private BoardService service;

        /** 서블릿 초기화 시 서비스 객체 생성 */
        @Override
        public void init() throws ServletException {
            this.service = new BoardService();
        }

        /**
        * GET 요청 처리 (화면 이동)
        */
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException {

            // /board/list → pathInfo = /list
            String path = req.getPathInfo();

            // /board/ → 기본 URL이면 list로 이동
            if (path == null || path.equals("/")) {
                path = "/list";
            }

            try {
                switch (path) {
                    case "/list":
                        list(req, resp);
                        break;
                    case "/detail":
                        detail(req, resp);
                        break;
                    case "/write":
                        showWriteForm(req, resp);
                        break;
                    case "/edit":
                        showEditForm(req, resp);
                        break;
                    default:
                        // 정의되지 않은 URL
                        resp.sendError(HttpServletResponse.SC_NOT_FOUND);
                }
            } catch (SQLException e) {
                throw new ServletException(e);
            }
        }

        /**
        * POST 요청 처리 (실제 작업)
        * action 값으로 구분:
        * - create
        * - update
        * - delete
        */
        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException {

            String action = req.getParameter("action");

            if (action == null || action.isEmpty()) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            switch (action) {
                case "create":
                    create(req, resp);
                    break;
                case "update":
                    update(req, resp);
                    break;
                case "delete":
                    delete(req, resp);
                    break;
                default:
                    resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            }
        }

        /*
        * ===========================================================
        * ============== GET: View 화면 관련 =================
        * ===========================================================
        */

        /** 게시판 목록 페이지 */
        private void list(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException, SQLException {

            // 페이지 파라미터 기본값
            int page = parseInt(req.getParameter("page"), 1);
            int size = parseInt(req.getParameter("size"), 10);

            // 전체 게시글 개수
            int totalCount = service.count();
            int totalPages = (int) Math.ceil(totalCount / (double) size);

            if (totalPages == 0)
                totalPages = 1;
            if (page > totalPages)
                page = totalPages;

            // DB에서 현재 페이지 목록 가져오기
            List<Board> list = service.list(page, size);

            // 블록 페이징 계산 (5페이지씩)
            int blockSize = 5;
            int currentBlock = (page - 1) / blockSize;
            int startPage = currentBlock * blockSize + 1;
            int endPage = Math.min(startPage + blockSize - 1, totalPages);

            // JSP에서 사용할 데이터 전달
            req.setAttribute("list", list);
            req.setAttribute("page", page);
            req.setAttribute("size", size);
            req.setAttribute("totalCount", totalCount);
            req.setAttribute("totalPages", totalPages);
            req.setAttribute("startPage", startPage);
            req.setAttribute("endPage", endPage);

            req.getRequestDispatcher("/WEB-INF/view/board/list.jsp")
                    .forward(req, resp);
        }

        /** 게시글 상세 페이지 */
        private void detail(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException, SQLException {

            int idx = parseInt(req.getParameter("idx"), 0);

            // idx 검증 실패 → 목록으로
            if (idx <= 0) {
                resp.sendRedirect(req.getContextPath() + "/board/list");
                return;
            }

            Board board = service.get(idx);

            // 게시글 존재하지 않으면 목록으로
            if (board == null) {
                resp.sendRedirect(req.getContextPath() + "/board/list");
                return;
            }

            req.setAttribute("board", board);
            req.getRequestDispatcher("/WEB-INF/view/board/detail.jsp")
                    .forward(req, resp);
        }

        /** 글쓰기 폼 (빈 폼만 보여줌) */
        private void showWriteForm(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException {

            req.getRequestDispatcher("/WEB-INF/view/board/write.jsp")
                    .forward(req, resp);
        }

        /** 수정 폼 (기존 데이터 불러오기) */
        private void showEditForm(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException, SQLException {

            int idx = parseInt(req.getParameter("idx"), 0);

            if (idx <= 0) {
                resp.sendRedirect(req.getContextPath() + "/board/list");
                return;
            }

            Board board = service.get(idx);

            if (board == null) {
                resp.sendRedirect(req.getContextPath() + "/board/list");
                return;
            }

            req.setAttribute("board", board);
            req.getRequestDispatcher("/WEB-INF/view/board/edit.jsp")
                    .forward(req, resp);
        }

        /*
        * ===========================================================
        * ============== POST: Create/Update/Delete ============
        * ===========================================================
        */

        /** 게시글 생성 */
        private void create(HttpServletRequest req, HttpServletResponse resp)
                throws IOException {

            String title = req.getParameter("title");
            String content = req.getParameter("content");

            ServiceResult<Integer> result = service.create(title, content);

            HttpSession session = req.getSession();
            String ctx = req.getContextPath();

            if (result.success) {
                // 성공 메시지 flash로 전달
                session.setAttribute("flash_success", result.message);
                resp.sendRedirect(ctx + "/board/list");
            } else {
                session.setAttribute("flash_error", result.message);
                resp.sendRedirect(ctx + "/board/write");
            }
        }

        /** 게시글 수정 */
        private void update(HttpServletRequest req, HttpServletResponse resp)
                throws IOException {

            int idx = parseInt(req.getParameter("idx"), 0);
            String title = req.getParameter("title");
            String content = req.getParameter("content");

            ServiceResult<Void> result = service.update(idx, title, content);

            HttpSession session = req.getSession();
            String ctx = req.getContextPath();

            if (result.success) {
                session.setAttribute("flash_success", result.message);
                resp.sendRedirect(ctx + "/board/detail?idx=" + idx);
            } else {
                session.setAttribute("flash_error", result.message);
                resp.sendRedirect(ctx + "/board/edit?idx=" + idx);
            }
        }

        /** 게시글 삭제 */
        private void delete(HttpServletRequest req, HttpServletResponse resp)
                throws IOException {

            int idx = parseInt(req.getParameter("idx"), 0);
            ServiceResult<Void> result = service.delete(idx);

            HttpSession session = req.getSession();
            String ctx = req.getContextPath();

            if (result.success)
                session.setAttribute("flash_success", result.message);
            else
                session.setAttribute("flash_error", result.message);

            resp.sendRedirect(ctx + "/board/list");
        }

        /** 숫자 파싱 (예외 발생 → 기본값 반환) */
        private int parseInt(String s, int defaultValue) {
            try {
                return Integer.parseInt(s);
            } catch (Exception e) {
                return defaultValue;
            }
        }
    }
    ```

## 5. View (JSP/HTML)

- 입력폼, 목록/상세 페이지, 에러 메시지 표기

- CSS `/assets/css` 로, Javascript 는 `/assets/js` 로 각각 분리.

- `view/layout/` 폴더 참고
    - `head.jsp`
    
    - `header.jsp`

    - `footer.jsp`

- `view/user` 폴더 참고
    - `regist.jsp`

    - `regist_ok.jsp`

    - `login.jsp`

    - `login_ok.jsp`

- `view/board` 폴더 참고
    - `detail.jsp`

    - `edit.jsp`

    - `list.jsp`

    - `write.jsp`





## 🧩 실습 / 과제

- 로그인 기능이 포함된 게시판 사이트 만들기

- 라우팅 표

    > `{ctx}`는 `req.getContextPath()`

1. 게시판 (`BoardController.java` → `/board/*`)

    1-1. `GET` 요청
    | HTTP | URL                           | 설명                    | 컨트롤러 메서드         | 뷰/처리                             | 주요 파라미터                |
    | ---- | ----------------------------- | --------------------- | ---------------- | -------------------------------- | ---------------------- |
    | GET  | `{ctx}/board(/)`              | 기본 진입 → 목록으로 이동       | `doGet` → `list` | `list.jsp`                       | `page`(선택), `size`(선택) |    
    | GET  | `{ctx}/board/list`            | 게시글 목록                | `list`           | `/WEB-INF/view/board/list.jsp`   | `page`, `size`         |
    | GET  | `{ctx}/board/detail?idx={번호}` | 게시글 상세                | `detail`         | `/WEB-INF/view/board/detail.jsp` | `idx` (필수)             |
    | GET  | `{ctx}/board/write`           | 글쓰기 폼                 | `showWriteForm`  | `/WEB-INF/view/board/write.jsp`  | -                      |
    | GET  | `{ctx}/board/edit?idx={번호}`   | 수정 폼                  | `showEditForm`   | `/WEB-INF/view/board/edit.jsp`   | `idx` (필수)             |

    1-2. `POST` 요청
    > 공통: action 파라미터로 분기 (create/update/delete)

    | HTTP | URL                             | 설명     | 컨트롤러 메서드 | 리다이렉트 위치                                                               | 주요 파라미터                                    |
    | ---- | ------------------------------- | ------ | -------- | ---------------------------------------------------------------------- | ------------------------------------------ |
    | POST | `{ctx}/board` + `action=create` | 게시글 생성 | `create` | 성공: `{ctx}/board/list`<br>실패: `{ctx}/board/write`                      | `title`, `content`, `action=create`        |
    | POST | `{ctx}/board` + `action=update` | 게시글 수정 | `update` | 성공: `{ctx}/board/detail?idx={idx}`<br>실패: `{ctx}/board/edit?idx={idx}` | `idx`, `title`, `content`, `action=update` |
    | POST | `{ctx}/board` + `action=delete` | 게시글 삭제 | `delete` | `{ctx}/board/list`                                                     | `idx`, `action=delete`                     |
    | POST | `{ctx}/board` (action 없음/이상)    | 잘못된 요청 | `doPost` | 400 Bad Request                                                        | -                                          |

2. 사용자 (`UserController.java` → `/user/*`)

    2-1. `GET` 요청
    | HTTP | URL                      | 설명               | 컨트롤러 메서드               | 뷰/처리                                                   | 비고                 |
    | ---- | ------------------------ | ---------------- | ---------------------- | ------------------------------------------------------ | ------------------ |
    | GET  | `{ctx}/user`             | 기본 → 로그인으로 리다이렉트 | `doGet` (path="/")     | `redirect` → `{ctx}/user/login`                        | -                  |
    | GET  | `{ctx}/user/`            | 위와 동일            | `doGet` (normPath="/") | `redirect` → `{ctx}/user/login`                        | -                  |
    | GET  | `{ctx}/user/login`       | 로그인 폼            | `doGet`                | `/WEB-INF/view/user/login.jsp`                         | -                  |
    | GET  | `{ctx}/user/login_ok`    | 로그인 성공 페이지       | `doGet`                | `/WEB-INF/view/user/login_ok.jsp`                      | 세션에 `id` 있어야 정상 흐름 |
    | GET  | `{ctx}/user/register`    | 회원가입 폼           | `doGet`                | `/WEB-INF/view/user/register.jsp`                      | -                  |
    | GET  | `{ctx}/user/register_ok` | 회원가입 완료 페이지      | `doGet`                | `/WEB-INF/view/user/register_ok.jsp`                   | -                  |
    | GET  | `{ctx}/user/logout`      | 로그아웃             | `doGet`                | 세션 `invalidate()` 후<br>`redirect` → `{ctx}/user/login` | -                  |
    | GET  | `{ctx}/user/*` (이외)     | 없는 페이지           | `doGet`                | 404 Not Found                                          | -                  |

    2-2. `POST` 요청
    > `/login`, `/register` 두 가지만 처리

    | HTTP | URL                   | 설명      | 컨트롤러 메서드                    | 리다이렉트 위치                                                  | 주요 파라미터                   |
    | ---- | --------------------- | ------- | --------------------------- | --------------------------------------------------------- | ------------------------- |
    | POST | `{ctx}/user/login`    | 로그인 처리  | `doPost` (path="/login")    | 성공: `{ctx}/user/login_ok`<br>실패: `{ctx}/user/login`       | `id`, `password`          |
    | POST | `{ctx}/user/register` | 회원가입 처리 | `doPost` (path="/register") | 성공: `{ctx}/user/register_ok`<br>실패: `{ctx}/user/register` | `id`, `password`, `email` |
    | POST | `{ctx}/user/*` (이외)   | 잘못된 요청  | `doPost` default            | 400 Bad Request                                           | -                         |
