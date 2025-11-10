# Servlet API 로 CRUD 구현하기

## 📘 학습 개요
Servlet API 에서 CRUD 구현하기 with MySQL

> **CRUD란?** Create(생성), Read(조회), Update(수정), Delete(삭제)의 약자로, 데이터베이스를 다루는 기본 4가지 기능을 의미합니다. 웹 백엔드 개발의 핵심 패턴이며, 이번 과정의 중심 주제입니다.

## 💡 주요 내용

- MySQL 데이터베이스 연결 및 JNDI DataSource 설정

- DAO(Data Access Object) 패턴으로 데이터 처리 로직 분리

- JSON 형식 요청/응답 처리 (Gson 사용)

- CRUD (Create, Read, Update, Delete) 기능 API 구현

- Insomnia 또는 curl을 활용한 API 테스트

## ⚙️ 필요한 라이브러리 추가하기

1. 디렉터리 이동 ( `jsp.servlet.localhost` 경로 다르면 확인 )
    ```bash
    cd /var/www/jsp.servlet.localhost/WEB-INF/lib
    ```

2. `gson-2.11.0.jar` 파일 다운로드
    ```bash
    wget https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar
    ```

3. `mysql-connector-j-8.0.31.tar.gz` 압축 파일 다운로드
    ```bash
    wget https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-9.5.0.tar.gz
    ```

4. `mysql-connector-j-9.5.0.tar.gz` 압축해제
    ```bash
    tar -xvf mysql-connector-j-9.5.0.tar.gz
    ```

5. `.jar` 파일만 복사
    ```bash
    cp mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar .
    ```
## CRUD 란?

| 구분    | 의미              | 설명                   | HTTP 메서드         |
| ----- | --------------- | -------------------- | ---------------- |
| **C** | **Create (생성)** | 새로운 데이터를 **추가**하는 기능 | `POST`           |
| **R** | **Read (조회)**   | 저장된 데이터를 **읽어오는** 기능 | `GET`            |
| **U** | **Update (수정)** | 기존 데이터를 **변경하는** 기능  | `PUT` 또는 `PATCH` |
| **D** | **Delete (삭제)** | 데이터를 **지우는** 기능      | `DELETE`         |


## ⚙️ 1. JNDI DataSource 설정 

- /etc/tomcat10/Catalina/jsp.servlet.localhost/`ROOT.xml` 파일에 `<Resource />` 추가
    ```xml
    <Context ...>
    ...
    <!-- MySQL 커넥션 풀 -->
    <Resource
        name="jdbc/MyDB"
        auth="Container"
        type="javax.sql.DataSource"
        driverClassName="com.mysql.cj.jdbc.Driver"
        url="jdbc:mysql://localhost:3306/test?useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=Asia/Seoul"
        username="test"
        password="test123"
        maxTotal="30"
        maxIdle="10"
        maxWaitMillis="10000"
        validationQuery="SELECT 1"
    /> 
    <!-- MySQL 커넥션 풀 -->
    ...
    </Context>     
    ```

- /var/www/jsp.servlet.localhost/WEB-INF/`web.xml`
    ```xml
    <resource-ref>
        <description>MySQL Connection Pool</description>
        <res-ref-name>jdbc/MyDB</res-ref-name>
        <res-type>javax.sql.DataSource</res-type>
        <res-auth>Container</res-auth>
    </resource-ref>
    ```

## 📁 2. 프로젝트 구조
```
src/
 └─ localhost/myapp/
                ├─ DB.java
                ├─ model/User.java
                ├─ model/Board.java
                ├─ dao/UserDao.java
                ├─ dao/BoardDao.java
                ├─ api/UserServlet.java      (@WebServlet("/api/user/*"))
                └─ api/BoardServlet.java     (@WebServlet("/api/board/*"))
```

## 🧩 3. DB 연결 (DB.java)
```java
package localhost.myapp;

import javax.naming.InitialContext;
import javax.naming.Context;
import javax.sql.DataSource;

/**
 * JNDI에서 톰캣 커넥션풀(javax.sql.DataSource)을 1회만 조회해 재사용하는 헬퍼.
 */
public class DB {
    private static volatile DataSource ds;

    public static DataSource getDataSource() {
        if (ds == null) {
            synchronized (DB.class) {
                if (ds == null) {
                    try {
                        Context ic = new InitialContext();
                        // java:comp/env/  접두사는 웹앱 내부 JNDI 네임스페이스
                        ds = (DataSource) ic.lookup("java:comp/env/jdbc/MyDB");
                    } catch (Exception e) {
                        // 배포/부팅 시 NameNotFoundException 발생하면, Context/Resource 위치와 이름을 우선 확인
                        throw new RuntimeException("JNDI lookup failed for 'jdbc/MyDB'. Check Context/Resource naming.", e);
                    }
                }
            }
        }
        return ds;
    }
}
```

## 👤 4. User 모델 & DAO
- `User.java`

    ```java
    package localhost.myapp.model;

    public class User {
        public int idx;
        public String id;
        public String password;
        public String email;
        public String regDate;
    }
    ```

- `UserDao.java`
    ```java
    package localhost.myapp.dao;

    import com.example.web.DB;
    import com.example.web.model.User;

    import javax.sql.DataSource;
    import java.sql.*;

    public class UserDao {
        private final DataSource ds = DB.getDataSource();

        public boolean insert(User u) throws SQLException {
            String sql = "INSERT INTO user (id, password, email) VALUES (?, ?, ?)";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, u.id);
                ps.setString(2, u.password);
                ps.setString(3, u.email);
                return ps.executeUpdate() == 1;
            }
        }

        public User findById(String id) throws SQLException {
            String sql = "SELECT * FROM user WHERE id=?";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        User u = new User();
                        u.idx = rs.getInt("idx");
                        u.id = rs.getString("id");
                        u.password = rs.getString("password");
                        u.email = rs.getString("email");
                        u.regDate = rs.getString("reg_date");
                        return u;
                    }
                    return null;
                }
            }
        }

        public boolean login(String id, String password) throws SQLException {
            String sql = "SELECT COUNT(*) FROM user WHERE id=? AND password=?";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, id);
                ps.setString(2, password);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    return rs.getInt(1) == 1;
                }
            }
        }
    }

    ```

## 🗒 5. Board 모델 & DAO
- `Board.java`

    ```java
    package localhost.myapp.model;

    public class Board {
        public int idx;
        public String title;
        public String content;
        public String regDate;
    }
    ```

- `BoardDao.java`
    ```java
    package localhost.myapp.dao;

    import localhost.myapp.DB;
    import localhost.myapp.model.Board;

    import javax.sql.DataSource;
    import java.sql.*;
    import java.util.ArrayList;
    import java.util.List;

    public class BoardDao {
        private final DataSource ds = DB.getDataSource();

        public List<Board> findAll() throws SQLException {
            String sql = "SELECT * FROM board ORDER BY idx DESC";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
                List<Board> list = new ArrayList<>();
                while (rs.next()) {
                    Board b = new Board();
                    b.idx = rs.getInt("idx");
                    b.title = rs.getString("title");
                    b.content = rs.getString("content");
                    b.regDate = rs.getString("reg_date");
                    list.add(b);
                }
                return list;
            }
        }

        public Board findById(int idx) throws SQLException {
            String sql = "SELECT * FROM board WHERE idx=?";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setInt(1, idx);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        Board b = new Board();
                        b.idx = rs.getInt("idx");
                        b.title = rs.getString("title");
                        b.content = rs.getString("content");
                        b.regDate = rs.getString("reg_date");
                        return b;
                    }
                    return null;
                }
            }
        }

        public boolean insert(Board b) throws SQLException {
            String sql = "INSERT INTO board (title, content) VALUES (?, ?)";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, b.title);
                ps.setString(2, b.content);
                return ps.executeUpdate() == 1;
            }
        }

        public boolean update(Board b) throws SQLException {
            String sql = "UPDATE board SET title=?, content=? WHERE idx=?";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, b.title);
                ps.setString(2, b.content);
                ps.setInt(3, b.idx);
                return ps.executeUpdate() == 1;
            }
        }

        public boolean delete(int idx) throws SQLException {
            String sql = "DELETE FROM board WHERE idx=?";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setInt(1, idx);
                return ps.executeUpdate() == 1;
            }
        }
    }
    ```

## 🌐 6. UserServlet (회원가입/로그인)
- `UserServlet.java`

    ```java
    package localhost.myapp.api;

    import localhost.myapp.dao.UserDao;
    import localhost.myapp.model.User;
    import com.google.gson.Gson;
    import com.google.gson.JsonObject;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.*;

    import java.io.BufferedReader;
    import java.io.IOException;

    /**
    * /api/user/* : 회원가입/로그인
    * - POST /api/user/register
    * - POST /api/user/login
    */
    @WebServlet("/api/user/*")
    public class UserServlet extends HttpServlet {
        private final UserDao dao = new UserDao();
        private final Gson gson = new Gson();

        private JsonObject readJson(HttpServletRequest req) throws IOException {
            BufferedReader br = req.getReader();
            return gson.fromJson(br, JsonObject.class);
        }

        // (선택) 간단 CORS 허용: 필요 시 톰캣 필터로 분리해서 적용 권장
        private void setCors(HttpServletResponse resp) {
            resp.setHeader("Access-Control-Allow-Origin", "*");
            resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
            resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        }

        @Override
        protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
            setCors(resp);
            resp.setStatus(204);
        }

        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");

            try {
                String path = req.getPathInfo();
                JsonObject json = readJson(req);
                
                if ("/register".equals(path)) {

                    // 필수값 검증
                    if (json == null || !json.has("id") || !json.has("password") || !json.has("email")) {
                        resp.setStatus(400);
                        resp.getWriter().write("{\"error\":\"invalid_body\"}");
                        return;
                    }

                    User u = new User();
                    u.id = json.get("id").getAsString();
                    u.password = json.get("password").getAsString();
                    u.email = json.get("email").getAsString();
                    dao.insert(u);
                    resp.getWriter().write("{\"message\":\"registered\"}");
                } else if ("/login".equals(path)) {

                    // 필수값 검증
                    if (json == null || !json.has("id") || !json.has("password")) {
                        resp.setStatus(400);
                        resp.getWriter().write("{\"error\":\"invalid_body\"}");
                        return;
                    }

                    boolean ok = dao.login(json.get("id").getAsString(), json.get("password").getAsString());
                    resp.getWriter().write("{\"login\":" + ok + "}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                resp.setStatus(500);
                resp.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    ```

## 🧾 7. BoardServlet (게시글 CRUD)
- `BoardServlet.java`

    ```java
    package localhost.myapp.api;

    import localhost.myapp.dao.BoardDao;
    import localhost.myapp.model.Board;
    import com.google.gson.Gson;
    import com.google.gson.JsonObject;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.*;

    import java.io.IOException;
    import java.util.List;

    /**
    * /api/board/* REST 스타일 엔드포인트
    * - GET /api/board?page=1&size=10 : 목록 페이징
    * - GET /api/board/{idx}          : 단건 조회
    * - POST /api/board               : 생성
    * - PUT /api/board/{idx}          : 수정
    * - DELETE /api/board/{idx}       : 삭제
    */
    @WebServlet("/api/board/*")
    public class BoardServlet extends HttpServlet {
        private final BoardDao dao = new BoardDao();
        private final Gson gson = new Gson();

        private JsonObject readJson(HttpServletRequest req) throws IOException {
            return gson.fromJson(req.getReader(), JsonObject.class);
        }

        // (선택) 간단 CORS 허용: 필요 시 톰캣 필터로 분리해서 적용 권장
        private void setCors(HttpServletResponse resp) {
            resp.setHeader("Access-Control-Allow-Origin", "*");
            resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
            resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        }

        @Override
        protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
            setCors(resp);
            resp.setStatus(204);
        }

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                String path = req.getPathInfo();
                if (path == null || "/".equals(path)) {
                    // 페이징 파라미터 처리
                    int page = parseInt(req.getParameter("page"), 1);
                    int size = parseInt(req.getParameter("size"), 10);
                    List<Board> list = dao.findAll(page, size);
                    resp.getWriter().write(gson.toJson(list));
                } else {
                    int idx = Integer.parseInt(path.substring(1));
                    Board b = dao.findById(idx);
                    if (b == null) {
                        resp.setStatus(404);
                        resp.getWriter().write("{\"error\":\"not_found\"}");
                        return;
                    }
                    resp.getWriter().write(gson.toJson(b));
                }
            } catch (Exception e) {
                e.printStackTrace();
                resp.setStatus(500);
                resp.getWriter().write(jsonError(e));
            }
        }

        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                JsonObject json = readJson(req);
                // 간단 검증
                if (json == null || !json.has("title") || !json.has("content")) {
                    resp.setStatus(400);
                    resp.getWriter().write("{\"error\":\"invalid_body\"}");
                    return;
                }
                Board b = new Board();
                b.title = json.get("title").getAsString();
                b.content = json.get("content").getAsString();
                dao.insert(b);
                resp.setStatus(201);
                resp.getWriter().write("{\"message\":\"created\"}");
            } catch (Exception e) {
                e.printStackTrace();
                resp.setStatus(500);
                resp.getWriter().write(jsonError(e));
            }
        }

        @Override
        protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                String path = req.getPathInfo();
                if (path == null || path.length() < 2) { resp.setStatus(400); return; }

                int idx = Integer.parseInt(path.substring(1));
                JsonObject json = readJson(req);
                if (json == null || !json.has("title") || !json.has("content")) {
                    resp.setStatus(400);
                    resp.getWriter().write("{\"error\":\"invalid_body\"}");
                    return;
                }

                Board b = new Board();
                b.idx = idx;
                b.title = json.get("title").getAsString();
                b.content = json.get("content").getAsString();

                boolean ok = dao.update(b);
                if (!ok) { resp.setStatus(404); resp.getWriter().write("{\"error\":\"not_found\"}"); return; }

                resp.getWriter().write("{\"message\":\"updated\"}");
            } catch (Exception e) {
                e.printStackTrace();
                resp.setStatus(500);
                resp.getWriter().write(jsonError(e));
            }
        }

        @Override
        protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                String path = req.getPathInfo();
                if (path == null || path.length() < 2) { resp.setStatus(400); return; }
                int idx = Integer.parseInt(path.substring(1));

                boolean ok = dao.delete(idx);
                if (!ok) { resp.setStatus(404); resp.getWriter().write("{\"error\":\"not_found\"}"); return; }

                resp.getWriter().write("{\"message\":\"deleted\"}");
            } catch (Exception e) {
                e.printStackTrace();
                resp.setStatus(500);
                resp.getWriter().write(jsonError(e));
            }
        }

        private int parseInt(String s, int def) {
            try { return Integer.parseInt(s); } catch (Exception ignore) { return def; }
        }

        private String jsonError(Exception e) {
            // 실서비스에선 스택트레이스 노출 금지. 로그로만 남기고, 사용자에겐 일반 메시지 전달.
            return "{\"error\":\"" + e.getClass().getSimpleName() + "\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }
    ```

## 📡 8. Servlet API + CRUD 엔드포인트 요약

| 구분     | 기능        | HTTP 메서드 | URL                         | 요청 Body(JSON)                                          | 비고                                |
| ------ | --------- | -------- | --------------------------- | ------------------------------------------------------ | --------------------------------- |
| 👤 사용자 | 회원가입      | `POST`   | `/api/user/register`        | `{ "id":"kim", "password":"1234", "email":"a@b.com" }` | 회원 정보 저장                          |
| 👤 사용자 | 로그인       | `POST`   | `/api/user/login`           | `{ "id":"kim", "password":"1234" }`                    | 로그인 성공 여부 반환                      |
| 📰 게시판 | 게시글 목록 조회 | `GET`    | `/api/board?page=1&size=10` | -                                                      | 페이징 지원 (`page`, `size` 기본값 1, 10) |
| 📰 게시판 | 게시글 단건 조회 | `GET`    | `/api/board/{idx}`          | -                                                      | 게시글 번호(`idx`)로 조회                 |
| 📰 게시판 | 게시글 작성    | `POST`   | `/api/board`                | `{ "title":"제목", "content":"내용" }`                     | 새 게시글 등록                          |
| 📰 게시판 | 게시글 수정    | `PUT`    | `/api/board/{idx}`          | `{ "title":"수정", "content":"내용2" }`                    | 지정된 `idx` 게시글 수정                  |
| 📰 게시판 | 게시글 삭제    | `DELETE` | `/api/board/{idx}`          | -                                                      | 지정된 `idx` 게시글 삭제                  |


## 💬 9. 요청 예시 ( CURL 테스트용 )

### 🧩 User API (회원 관련)

1️⃣ 회원가입    

```bash
curl -X POST http://java.localhost/api/user/register \
-H "Content-Type: application/json" \
-d '{
    "id": "kim",
    "password": "1234",
    "email": "a@b.com"
}'
```

2️⃣ 로그인
```bash
curl -X POST http://java.localhost/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "id": "kim",
    "password": "1234"
  }'
```

### 📰 Board API (게시판 CRUD)

1️⃣ 게시글 목록 조회 (페이징 지원)
> 🧠 page와 size는 선택 사항 (기본값: page=1, size=10)
```bash
curl -X GET "http://java.localhost/api/board?page=1&size=10"
```

2️⃣ 게시글 단건 조회
```bash
curl -X GET http://java.localhost/api/board/1
```

3️⃣ 게시글 작성
```bash
curl -X POST http://java.localhost/api/board \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫 번째 글",
    "content": "게시판 내용입니다."
  }'
```

4️⃣ 게시글 수정
```bash
curl -X PUT http://java.localhost/api/board/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 제목",
    "content": "수정된 내용입니다."
  }'
```

5️⃣ 게시글 삭제
```bash
curl -X DELETE http://java.localhost/api/board/1
```

## ⚙️ 참고

- `-X` : HTTP 메서드 지정

- `-H` : 요청 헤더 설정

- `-d` : 요청 바디(JSON) 데이터

- "" → URL에 ?나 &가 포함될 때는 반드시 묶어줘야 함


## 🧩 실습 / 과제
- `CURL` 또는 `Insomnia` 로 API 활용해보기

- API 테스트 및 개발용 도구 Insomnia [다운로드](https://insomnia.rest/download)