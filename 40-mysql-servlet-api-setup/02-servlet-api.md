# Servlet API 로 CRUD 구현하기

## 📘 학습 개요
Servlet API 에서 CRUD 구현하기 with MySQL

> **CRUD란?** Create(생성), Read(조회), Update(수정), Delete(삭제)의 약자로, 데이터베이스를 다루는 기본 4가지 기능을 의미합니다. 웹 백엔드 개발의 핵심 패턴이며, 이번 과정의 중심 주제입니다.

## 💡 주요 내용

- DB 연결 풀(DataSource)을 만들고, JNDI를 통해 불러오기

- DAO(Data Access Object) 패턴으로 데이터 처리 로직 분리

- JSON 형식 요청/응답 처리 (Gson 사용)

- CRUD (Create, Read, Update, Delete) 기능 API 구현

- Insomnia 또는 curl을 활용한 API 테스트

## ⚙️ 필요한 라이브러리 추가하기

1. 디렉터리 이동 ( `jsp.servlet.localhost` 경로 다르면 확인 ):
    ```bash
    cd /var/www/jsp.servlet.localhost/WEB-INF/lib
    ```

2. `gson-2.11.0.jar` 파일 다운로드:
    ```bash
    wget https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar
    ```

3. `mysql-connector-j-9.5.0.tar.gz` 압축 파일 다운로드:
    ```bash
    wget https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-9.5.0.tar.gz
    ```

4. `mysql-connector-j-9.5.0.tar.gz` 압축해제:
    ```bash
    tar -xvf mysql-connector-j-9.5.0.tar.gz
    ```

5. `.jar` 파일을 톰캣 공용 라이브러리에 복사:
    ```bash
    sudo cp mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar /usr/share/tomcat10/lib/
    ```
## CRUD 란?
> CRUD는 Create, Read, Update, Delete 의 약자입니다.

| 구분    | 의미              | 설명                   | HTTP 메서드         | SQL 명령어 |
| ----- | --------------- | -------------------- | ---------------- | --- |
| **C** | **Create (생성)** | 새로운 데이터를 **추가**하는 기능 | `POST`           | `INSERT` |
| **R** | **Read (조회)**   | 저장된 데이터를 **읽어오는** 기능 | `GET`            | `SELECT` |
| **U** | **Update (수정)** | 기존 데이터를 **변경하는** 기능  | `PUT` 또는 `PATCH` | `UPDATE` |
| **D** | **Delete (삭제)** | 데이터를 **지우는** 기능      | `DELETE`         | `DELETE` |


## ⚙️ 1. DB 연결 풀(DataSource)을 만들고, JNDI를 통해 불러오기

- DataSource 란? 
    > 데이터베이스 연결(Connection)을 만들어주는 객체입니다. 톰캣이 미리 여러 개의 연결을 만들어 **“커넥션 풀(Connection Pool)”** 에 보관해두고, 필요할 때마다 getConnection()으로 하나씩 꺼내 쓰는 구조입니다.

- JNDI (Java Naming and Directory Interface) 란?
    > 자바에서 “이름(Name)”으로 객체(Resource)를 찾아올 수 있는 디렉터리 서비스 API입니다.

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
    - 톰캣이 이 설정을 읽고 `DataSource` 객체를 생성한 뒤, “`jdbc/MyDB`” 이름으로 `JNDI` 환경에 등록(binded)합니다.

- /WEB-INF/`web.xml`
    ```xml
    <resource-ref>
        <description>MySQL Connection Pool</description>
        <res-ref-name>jdbc/MyDB</res-ref-name>
        <res-type>javax.sql.DataSource</res-type>
        <res-auth>Container</res-auth>
    </resource-ref>
    ```
    - `<resource-ref>` 태그는 서블릿 코드에서 `JNDI`로 참조할 외부 자원을 “선언(declare)”하는 부분입니다.
즉, 애플리케이션이 사용할 리소스의 이름(res-ref-name), 타입(res-type), 인증 방식(res-auth) 등을 미리 명시하여,
톰캣이 해당 이름을 JNDI 환경(java:comp/env/)에 매핑할 수 있도록 알려주는 역할을 합니다.

    - 이 선언 덕분에 서블릿 코드에서는 다음처럼 안전하게 JNDI Lookup을 수행할 수 있습니다:
        ```java
        Context ctx = new InitialContext();
        DataSource ds = (DataSource) ctx.lookup("java:comp/env/jdbc/MyDB");
        ```
        > 즉, `<resource-ref>`는 코드에서 사용할 리소스의 계약서(Interface 선언) 역할을 하고, 실제 연결 정보(driverClassName, url, username, password 등)는 `<Context>`의 `<Resource>` 항목에서 구체적으로 구현(define) 됩니다.

- 역할 정리

    | 요소               | 위치                          | 역할            | 톰캣에서의 의미                       |
    | ---------------- | --------------------------- | ------------- | ------------------------------ |
    | `<Resource>`     | `context.xml` 또는 `ROOT.xml` | **리소스 정의**    | “이 이름의 DataSource를 톰캣이 관리한다.”  |
    | `<resource-ref>` | `WEB-INF/web.xml`           | **리소스 참조 선언** | “이 웹앱이 그 DataSource를 사용할 것이다.” |

- 전체 흐름 요약

    | 단계 | 구성요소             | 하는 일                     |
    | -- | ---------------- | ------------------------ |
    | ①  | `<Resource>`     | 실제 DB 커넥션 풀을 정의하고 톰캣이 관리 |
    | ②  | `<resource-ref>` | 웹앱이 사용할 리소스 이름/타입을 선언    |
    | ③  | Java 코드          | `lookup()`으로 리소스 찾아서 사용  |



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
 * DB DataSource 헬퍼 (JNDI 기반, Lazy-init + Double-Checked Locking)
 *
 * 역할
 * - 톰캣(JNDI)에 등록된 커넥션 풀(javax.sql.DataSource)을 최초 1회만 조회(lookup)하고,
 *   이후에는 같은 인스턴스를 재사용한다(캐싱).
 *
 * 왜 필요한가
 * - 매 요청마다 InitialContext.lookup()을 호출하는 것은 불필요한 오버헤드가 될 수 있다.
 * - 애플리케이션 전역에서 동일한 DataSource를 안전하게 공유하려면 스레드-세이프한 캐시가 유용하다.
 *
 * 전제
 * - 톰캣의 Context 설정에 아래와 같이 Resource가 정의되어 있어야 한다.
 *   <Resource name="jdbc/MyDB" ... type="javax.sql.DataSource" ... />
 * - (선택) web.xml에 <resource-ref>로 res-ref-name/res-type 매핑을 선언하면
 *   컨테이너가 java:comp/env 네임스페이스에 안전하게 바인딩한다.
 *
 * 주의 사항
 * - 실제 커넥션(Connection) 객체는 여기서 만들지 않는다.
 *   DataSource는 '풀'의 핸들이고, Connection은 필요할 때마다 ds.getConnection()으로 빌려 쓰고 닫는다.
 * - DataSource 자체는 닫을 필요가 없다(컨테이너가 라이프사이클 관리).
 */
public class DB {

    /**
     * DataSource 캐시 필드.
     *
     * - volatile:
     *   더블 체크 락킹(DCL) 패턴에서 가시성/재정렬 문제를 방지하기 위해 필요.
     *   (JMM 상 안전한 DCL을 보장하기 위한 핵심 키워드)
     */
    private static volatile DataSource ds;

    /**
     * 애플리케이션 전역 DataSource 접근자.
     *
     * 동작
     * 1) 최초 호출 시에만 JNDI lookup 수행(느긋한 초기화, Lazy Initialization).
     * 2) 이후 호출은 캐시된 ds를 즉시 반환(오버헤드 최소화).
     *
     * 스레드-세이프
     * - DCL(Double-Checked Locking) + synchronized 블록으로 초기화 경쟁 방지.
     *
     * @return 톰캣이 관리하는 javax.sql.DataSource (커넥션 풀 핸들)
     * @throws RuntimeException 초기화 실패(예: 네이밍 불일치, 컨텍스트 미바인딩) 시 래핑하여 던짐
     */
    public static DataSource getDataSource() {
        // 1차 체크: 이미 초기화된 경우 동기화 없이 빠르게 반환
        if (ds == null) {
            synchronized (DB.class) {
                // 2차 체크: 여러 스레드가 동시 접근했더라도 최초 1회만 초기화 보장
                if (ds == null) {
                    try {
                        // JNDI 초기 컨텍스트
                        Context ic = new InitialContext();

                        /*
                         * java:comp/env/ 접두사
                         * - 웹 애플리케이션마다 분리된 "컴포넌트 전용" JNDI 네임스페이스.
                         * - <resource-ref>를 사용하면 res-ref-name으로 이 네임스페이스에 매핑된다.
                         * - 여기서는 "jdbc/MyDB"라는 이름으로 바인딩된 DataSource를 찾는다.
                         *
                         * Lookup 이름 정리
                         * - 애플리케이션 코드에서는 보통 "java:comp/env/jdbc/MyDB"로 조회.
                         * - 톰캣 Context의 <Resource name="jdbc/MyDB" .../> 와 일치해야 한다.
                         */
                        ds = (DataSource) ic.lookup("java:comp/env/jdbc/MyDB");

                        /*
                         * 여기서 DataSource 인스턴스는 '커넥션 풀 관리 객체'이지,
                         * 실제 DB 커넥션을 바로 만드는 것은 아니다.
                         * 실제 커넥션은 아래와 같이 필요 시마다 획득:
                         *
                         * try (Connection con = ds.getConnection()) {
                         *     // SQL 작업
                         * } // con.close() 호출로 커넥션 '반납' (풀로 복귀)
                         */

                    } catch (Exception e) {
                        /*
                         * 대표적인 실패 케이스
                         * - javax.naming.NameNotFoundException:
                         *   "jdbc/MyDB" 이름으로 바인딩된 리소스를 찾지 못했을 때.
                         *   → Context/ROOT.xml(or context.xml)의 <Resource name="jdbc/MyDB".../> 확인
                         *   → web.xml의 <resource-ref> res-ref-name 일치 여부 확인
                         *   → 톰캣 재기동 필요 여부 확인
                         *
                         * - NoInitialContextException:
                         *   컨테이너 외부(예: 단위 테스트)에서 실행했고 JNDI가 구성되지 않았을 때.
                         *
                         * 복구 전략
                         * - 배포 환경: 설정/이름 오타 수정 후 재배포
                         * - 테스트 환경: DataSource를 직접 주입(팩토리/DI), 또는 임베디드 컨테이너 사용
                         */
                        throw new RuntimeException(
                            "JNDI lookup failed for 'jdbc/MyDB'. " +
                            "Check <Resource name> and <resource-ref> naming/binding in Tomcat Context.",
                            e
                        );
                    }
                }
            }
        }
        return ds;
    }
}
```

## 👤 4. User Model & DAO

> **Model (데이터 객체)** = DB 테이블 1행(row)을 담는 클래스 = User.java

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
> **DAO (Data Access Object)** = SQL 실행 / DB 연동 전담 = UserDao.java

- `UserDao.java`

    ```java
    package localhost.myapp.dao;

    import localhost.myapp.DB;
    import localhost.myapp.model.User;

    import javax.sql.DataSource;
    import java.sql.*;

    public class UserDao {
        private final DataSource ds = DB.getDataSource();

        public boolean insert(User u) throws SQLException {
            String sql = "INSERT INTO user (id, password, email) VALUES (?, sha2(?, 256), ?)";
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
            String sql = "SELECT COUNT(*) FROM user WHERE id=? AND password=sha2(?, 256)";
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

## 🗒 5. Board Model & DAO

> **Model (데이터 객체)** = DB 테이블 1행(row)을 담는 클래스 = Board.java
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

> **DAO (Data Access Object)** = SQL 실행 / DB 연동 전담 = BoardDao.java
- `BoardDao.java`
    ```java
    package localhost.myapp.dao;

    import localhost.myapp.DB;
    import localhost.myapp.model.Board;

    import javax.sql.DataSource;
    import java.sql.*;
    import java.util.ArrayList;
    import java.util.List;

    /**
    * 게시판 CRUD.
    * - 목록 조회는 DESC 정렬 + LIMIT/OFFSET 로 간단 페이징 지원
    */
    public class BoardDao {
        private final DataSource ds = DB.getDataSource();

        public List<Board> findAll(int page, int size) throws SQLException {
            int limit = Math.max(1, Math.min(size, 100));
            int offset = Math.max(0, (page - 1) * limit);
            String sql = "SELECT idx, title, content, reg_date FROM board ORDER BY idx DESC LIMIT ? OFFSET ?";
            try (Connection con = ds.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setInt(1, limit);
                ps.setInt(2, offset);
                try (ResultSet rs = ps.executeQuery()) {
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