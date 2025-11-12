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

- 어떤 URL이 어떤 동작을 할지 표로 먼저 확정

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

2. DTO ( Data Transfer Object )

    - `User.java` - user 테이블 row(행)

        ```java
        package localhost.myapp.user;

        public class User {
            public int idx;
            public String id;
            public String password;
            public String email;
            public String regDate;
        }
        ```

    - `Board.java` - board 테이블 row(행)
        ```java
        package localhost.myapp.board;

        public class Board {
            public int idx;
            public String title;
            public String content;
            public String reg_date;
        
            // getter/setter
            public int getIdx() {
                return idx;
            }
            public void setIdx(int idx) {
                this.idx = idx;
            }
        
            public String getTitle() {
                return title;
            }
            public void setTitle(String title) {
                this.title = title;
            }
        
            public String getContent() {
                return content;
            }
            public void setContent(String content) {
                this.content = content;
            }
        
            public String getReg_date() {
                return reg_date;
            }
            public void setReg_date(String reg_date) {
                this.reg_date = reg_date;
            }
        }
        ```

3. DAO ( Data Access Object ) 

    - `UserDao.java` - user 테이블 관련 SQL문을 실행하고 결과를 반환.

        ```java
        package localhost.myapp.user;

        import localhost.myapp.common.DB;

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
                            u.email = rs.getString("email");
                            u.regDate = rs.getString("reg_date");
                            return u;
                        }
                        return null;
                    }
                }
            }

            public User existsById(String id) throws SQLException {
                String sql = "SELECT idx FROM user WHERE id=?";
                try (Connection con = ds.getConnection();
                    PreparedStatement ps = con.prepareStatement(sql)) {
                    ps.setString(1, id);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            User u = new User();
                            u.idx = rs.getInt("idx");
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

    - `BoardDao.java` - board 테이블 관련 SQL문을 실행하고 결과를 반환.
        ```java
        package localhost.myapp.board;

        import localhost.myapp.common.DB;

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

## 3. Service 레이어(비즈니스 규칙)

- DAO 조합, 검증, 예외 변환

- 예) 아이디 중복 확인 → 저장 → 결과 반환

- `ServiceResult.java` - “결과 메시지”용 DTO ( 여러 서비스들에서 공통적으로 사용가능 )
    ```java
    package localhost.myapp.dto;

    public class ServiceResult {
        public boolean success;
        public String message;
    }
    ```

- `UserService.java`
    ```java
    package localhost.myapp.user;

    import java.sql.SQLException;

    import localhost.myapp.dto.ServiceResult;

    public class UserService {
        private final UserDao userDao = new UserDao();

        public ServiceResult register(String id, String password, String email) throws Exception {
            ServiceResult r = new ServiceResult();

            if (id == null || id.length() < 4) {
                r.success = false;
                r.message = "아이디는 4자 이상이어야 합니다.";
                return r;
            }
            if (password == null || password.length() < 4) {
                r.success = false;
                r.message = "비밀번호는 4자 이상 입력해야 합니다.";
                return r;
            }
            if (email == null || !email.contains("@")) {
                r.success = false;
                r.message = "이메일 형식이 올바르지 않습니다.";
                return r;
            }
            if (userDao.existsById(id) != null) {
                r.success = false;
                r.message = "이미 존재하는 아이디입니다.";
                return r;
            }

            User u = new User();
            u.id = id;
            u.password = password;
            u.email = email;

            try {
                boolean inserted = userDao.insert(u);
                r.success = inserted;
                r.message = inserted ? "회원가입 성공" : "회원가입 실패";
            } catch (SQLException e) {
                r.success = false;
                r.message = "데이터베이스 오류: " + e.getMessage();
                throw e; // 부모로 예외 전달
            }

            
            return r;
        }

        public ServiceResult login(String id, String password) throws Exception {
            ServiceResult r = new ServiceResult();
            
            try {
                boolean inserted = userDao.login(id, password);
                r.success = inserted;
                r.message = inserted ? "로그인 성공" : "로그인 실패";
            } catch (SQLException e) {
                r.success = false;
                r.message = "데이터베이스 오류: " + e.getMessage();
                throw e; // 부모로 예외 전달
            }

            
            return r;
        }
    }
    ```

- `BoardService.java`
    ```java
    package localhost.myapp.board;

    import localhost.myapp.dto.ServiceResult;
    import java.sql.SQLException;
    import java.util.List;
    
    /**
     * 비즈니스 규칙/검증을 담당하는 서비스 레이어.
     * - Controller(Servlet) ↔ Service ↔ DAO 구조
     * - Read: 원본 타입 반환(List<Board>, Board)
     * - Write(C/U/D): ServiceResult 반환(일관된 성공/실패 + 메시지)
     */
    public class BoardService {
        private final BoardDao dao;
    
        public BoardService() {
            this.dao = new BoardDao();
        }
    
        // 테스트/주입용
        public BoardService(BoardDao dao) {
            this.dao = dao;
        }
    
        /** 목록 페이징 (Read는 데이터 그대로 반환) */
        public List<Board> list(int page, int size) throws SQLException {
            if (page < 1)
                page = 1;
            if (size < 1)
                size = 10;
            return dao.findAll(page, size);
        }
    
        /** 단건 조회 (없으면 null) */
        public Board get(int idx) throws SQLException {
            if (idx <= 0)
                return null;
            return dao.findById(idx);
        }
    
        /** 생성 (ServiceResult로 성공/실패 메시지 반환) */
        public ServiceResult create(String title, String content) {
            try {
                validate(title, content);
                Board b = new Board();
                b.title = title.trim();
                b.content = content.trim();
    
                boolean ok = dao.insert(b);
                return ok ? ok("게시글이 등록되었습니다.")
                        : fail("등록 실패");
            } catch (IllegalArgumentException e) {
                return fail(e.getMessage());
            } catch (SQLException e) {
                return fail("DB 오류: " + e.getMessage());
            }
        }
    
        /** 수정 */
        public ServiceResult update(int idx, String title, String content) {
            try {
                if (idx <= 0)
                    return fail("잘못된 ID");
                validate(title, content);
    
                Board b = new Board();
                b.idx = idx;
                b.title = title.trim();
                b.content = content.trim();
    
                boolean ok = dao.update(b);
                return ok ? ok("수정되었습니다.")
                        : fail("수정 실패");
            } catch (IllegalArgumentException e) {
                return fail(e.getMessage());
            } catch (SQLException e) {
                return fail("DB 오류: " + e.getMessage());
            }
        }
    
        /** 삭제 */
        public ServiceResult delete(int idx) {
            try {
                if (idx <= 0)
                    return fail("잘못된 ID");
                boolean ok = dao.delete(idx);
                return ok ? ok("삭제되었습니다.")
                        : fail("삭제 실패");
            } catch (SQLException e) {
                return fail("DB 오류: " + e.getMessage());
            }
        }
    
        /** 공통 검증 */
        private void validate(String title, String content) {
            if (title == null || content == null) {
                throw new IllegalArgumentException("title/content required");
            }
            String t = title.trim();
            String c = content.trim();
            if (t.isEmpty() || c.isEmpty()) {
                throw new IllegalArgumentException("title/content required");
            }
            if (t.length() > 200) {
                throw new IllegalArgumentException("title too long");
            }
        }
    
        /** 내부 헬퍼: 성공 응답 */
        private ServiceResult ok(String msg) {
            ServiceResult r = new ServiceResult();
            r.success = true;
            r.message = msg;
            return r;
        }
    
        /** 내부 헬퍼: 실패 응답 */
        private ServiceResult fail(String msg) {
            ServiceResult r = new ServiceResult();
            r.success = false;
            r.message = msg;
            return r;
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

    @WebServlet("/user/*")
    public class UserController extends HttpServlet {

        private final UserService service = new UserService();

        // pathInfo 정규화: null -> "/", 끝 슬래시 제거(루트 "/"는 유지)
        private String normPath(HttpServletRequest req) {
            String p = req.getPathInfo();
            if (p == null || p.isEmpty()) return "/";
            if (p.length() > 1 && p.endsWith("/")) return p.substring(0, p.length() - 1);
            return p;
        }

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

            String path = normPath(req);     

            System.out.println(path);

            switch (path) {
                case "/login":
                    req.getRequestDispatcher("/WEB-INF/view/user/login.jsp").forward(req, resp);
                    break;
                case "/login_ok":
                    req.getRequestDispatcher("/WEB-INF/view/user/login_ok.jsp").forward(req, resp);
                    break;
                case "/register":
                    req.getRequestDispatcher("/WEB-INF/view/user/register.jsp").forward(req, resp);
                    break;
                case "/register_ok":
                    req.getRequestDispatcher("/WEB-INF/view/user/register_ok.jsp").forward(req, resp);
                    break;
                case "/logout":
                    HttpSession session = req.getSession(false);
                    if (session != null) {
                        session.invalidate();  // 세션 완전 종료
                    }
                    resp.sendRedirect(req.getContextPath() + "/user/login");
                    break;
                case "/":
                    // 기본 페이지가 필요하면 여기서 redirect
                    resp.sendRedirect(req.getContextPath() + "/user/login");
                    break;
                default:
                    resp.sendError(HttpServletResponse.SC_NOT_FOUND, "페이지를 찾을 수 없습니다.");
            }

        }

        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

            String path = normPath(req);
            HttpSession session = req.getSession();

            String id = req.getParameter("id");
            String password = req.getParameter("password");

            switch (path) {
                case "/login":

                    try {

                        ServiceResult r = service.login(id, password);

                        if (r.success) {
                            session.setAttribute("id", id);
                            resp.sendRedirect(req.getContextPath() + "/user/login_ok");
                        } else {
                            session.setAttribute("flash_error", r.message);
                            resp.sendRedirect(req.getContextPath() + "/user/login");
                        }

                    } catch (Exception e) {
                        log("register failed", e);
                        session.setAttribute("flash_error", "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                        resp.sendRedirect(req.getContextPath() + "/user/login"); 
                    }

                    break;

                case "/register":

                    String email = req.getParameter("email");                

                    try {

                        ServiceResult r = service.register(id, password, email);

                        if (r.success) {
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

                default:
                    System.out.println("잘못된 요청입니다");
                    resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "잘못된 요청입니다.");
            }

        }

        
    }
    ```

## 5. View (JSP/HTML)

- 입력폼, 목록/상세 페이지, 에러 메시지 표기

- CSS `/assets/css` 로, Javascript 는 `/assets/js` 로 각각 분리.

- `view/user` 폴더 참고
    - `regist.jsp`

    - `regist_ok.jsp`

    - `login.jsp`

    - `login_ok.jsp`



## 🧩 실습 / 과제
- 게시판 관련 BoardController 와 View 만들기

    라우팅 예시)

    | 구분          | HTTP 메서드 | 경로(URI)         | 설명          | View 파일                         | 비고                   |
    | ----------- | -------- | --------------- | ----------- | ------------------------------- | -------------------- |
    | **목록 페이지**  | GET      | `/board/list`   | 게시글 목록 화면   | `/WEB-INF/view/board/list.jsp`  | DB 목록 조회 후 forward   |
    | **상세 페이지**  | GET      | `/board/view`   | 게시글 상세 보기   | `/WEB-INF/view/board/view.jsp`  | `?idx=3` 형태로 접근      |
    | **글쓰기 페이지** | GET      | `/board/write`  | 게시글 작성 폼 표시 | `/WEB-INF/view/board/write.jsp` | 단순 화면 (폼)            |
    | **글쓰기 처리**  | POST     | `/board/write`  | 게시글 등록 처리   | redirect `/board/list`          | form 데이터 → DB insert |
    | **수정 페이지**  | GET      | `/board/edit`   | 게시글 수정 폼 표시 | `/WEB-INF/view/board/edit.jsp`  | 기존 데이터 불러오기          |
    | **수정 처리**   | POST     | `/board/edit`   | 게시글 수정 처리   | redirect `/board/view?idx=3`    | DB update            |
    | **삭제 처리**   | POST     | `/board/delete` | 게시글 삭제 처리   | redirect `/board/list`          | DB delete            |
