# Servlet API 로 CRUD 구현하기

## 📘 학습 개요
Servlet API 에서 CRUD 구현하기 with MySQL

> **CRUD란?** Create(생성), Read(조회), Update(수정), Delete(삭제)의 약자로, 데이터베이스를 다루는 기본 4가지 기능을 의미합니다. 웹 백엔드 개발의 핵심 패턴이며, 이번 과정의 중심 주제입니다.

## 💡 주요 내용

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
## CRUD 란?
> CRUD는 Create, Read, Update, Delete 의 약자입니다.

| 구분    | 의미              | 설명                   | HTTP 메서드         | SQL 명령어 |
| ----- | --------------- | -------------------- | ---------------- | --- |
| **C** | **Create (생성)** | 새로운 데이터를 **추가**하는 기능 | `POST`           | `INSERT` |
| **R** | **Read (조회)**   | 저장된 데이터를 **읽어오는** 기능 | `GET`            | `SELECT` |
| **U** | **Update (수정)** | 기존 데이터를 **변경하는** 기능  | `PUT` 또는 `PATCH` | `UPDATE` |
| **D** | **Delete (삭제)** | 데이터를 **지우는** 기능      | `DELETE`         | `DELETE` |


## 🌐 6. UserAPI (회원가입/로그인)
- `UserAPI.java`

    ```java
    package localhost.myapp.api;

    import localhost.myapp.user.UserService;
    import localhost.myapp.dto.ServiceResult;

    import com.google.gson.Gson;
    import com.google.gson.JsonObject;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.*;

    import java.io.IOException;

    /**
    * /api/user/*
    * - POST /api/user/register : 회원가입
    * - POST /api/user/login    : 로그인
    */
    @WebServlet("/api/user/*")
    public class UserAPI extends HttpServlet {
        private final Gson gson = new Gson();
        private final UserService userService = new UserService();

        private JsonObject readJson(HttpServletRequest req) throws IOException {
            return gson.fromJson(req.getReader(), JsonObject.class);
        }

        // CORS (필요 시 필터로 분리 권장)
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
                if (path == null) {
                    writeJson(resp, 404, false, "요청 경로를 확인하세요.");
                    return;
                }

                JsonObject json = readJson(req);
                if (json == null) {
                    writeJson(resp, 400, false, "잘못된 요청 형식입니다.");
                    return;
                }

                switch (path) {
                    case "/register": {
                        if (!json.has("id") || !json.has("password") || !json.has("email")) {
                            writeJson(resp, 400, false, "필수 필드(id, password, email)가 없습니다.");
                            return;
                        }

                        String id = json.get("id").getAsString();
                        String password = json.get("password").getAsString();
                        String email = json.get("email").getAsString();

                        ServiceResult r = userService.register(id, password, email);
                        // 생성 성공은 201
                        resp.setStatus(r.success ? 201 : 400);
                        resp.getWriter().write(gson.toJson(r));
                        break;
                    }

                    case "/login": {
                        if (!json.has("id") || !json.has("password")) {
                            writeJson(resp, 400, false, "필수 필드(id, password)가 없습니다.");
                            return;
                        }

                        String id = json.get("id").getAsString();
                        String password = json.get("password").getAsString();

                        ServiceResult r = userService.login(id, password);
                        // 성공 200 / 실패 400 (인증 실패를 401로 바꾸고 싶으면 여기서 조정)
                        resp.setStatus(r.success ? 200 : 400);
                        resp.getWriter().write(gson.toJson(r));
                        break;
                    }

                    default:
                        writeJson(resp, 404, false, "지원하지 않는 경로입니다.");
                }
            } catch (Exception e) {
                e.printStackTrace();
                writeJson(resp, 500, false, "서버 오류: " + e.getMessage());
            }
        }

        private void writeJson(HttpServletResponse resp, int status, boolean success, String msg) throws IOException {
            resp.setStatus(status);
            ServiceResult r = new ServiceResult();
            r.success = success;
            r.message = msg;
            resp.getWriter().write(gson.toJson(r));
        }
    }
    ```

## 🧾 7. BoardAPI (게시글 CRUD)
- `BoardAPI.java`

    ```java
    package localhost.myapp.api;

    import localhost.myapp.board.Board;
    import localhost.myapp.board.BoardService;
    import localhost.myapp.dto.ServiceResult;

    import com.google.gson.Gson;
    import com.google.gson.JsonObject;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.*;

    import java.io.IOException;
    import java.util.List;

    /**
    * /api/board/* REST 엔드포인트
    * - GET /api/board?page=1&size=10 : 목록
    * - GET /api/board/{idx}          : 단건 조회
    * - POST /api/board               : 생성
    * - PUT /api/board/{idx}          : 수정
    * - DELETE /api/board/{idx}       : 삭제
    */
    @WebServlet("/api/board/*")
    public class BoardAPI extends HttpServlet {
        private final BoardService service = new BoardService();
        private final Gson gson = new Gson();

        private JsonObject readJson(HttpServletRequest req) throws IOException {
            return gson.fromJson(req.getReader(), JsonObject.class);
        }

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

        /** 목록 / 단건 조회 */
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                String path = req.getPathInfo();

                if (path == null || "/".equals(path)) {
                    int page = parseInt(req.getParameter("page"), 1);
                    int size = parseInt(req.getParameter("size"), 10);
                    List<Board> list = service.list(page, size);
                    resp.getWriter().write(gson.toJson(list));
                    return;
                }

                int idx = Integer.parseInt(path.substring(1));
                Board b = service.get(idx);
                if (b == null) {
                    writeJson(resp, 404, false, "게시글을 찾을 수 없습니다.");
                    return;
                }
                resp.getWriter().write(gson.toJson(b));
            } catch (Exception e) {
                e.printStackTrace();
                writeJson(resp, 500, false, "서버 오류: " + e.getMessage());
            }
        }

        /** 게시글 생성 */
        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                JsonObject json = readJson(req);
                if (json == null || !json.has("title") || !json.has("content")) {
                    writeJson(resp, 400, false, "잘못된 요청 형식입니다.");
                    return;
                }

                String title = json.get("title").getAsString();
                String content = json.get("content").getAsString();

                ServiceResult r = service.create(title, content);
                resp.setStatus(r.success ? 201 : 400);
                resp.getWriter().write(gson.toJson(r));
            } catch (Exception e) {
                e.printStackTrace();
                writeJson(resp, 500, false, "서버 오류: " + e.getMessage());
            }
        }

        /** 게시글 수정 */
        @Override
        protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                String path = req.getPathInfo();
                if (path == null || path.length() < 2) {
                    writeJson(resp, 400, false, "잘못된 요청 경로입니다.");
                    return;
                }

                int idx = Integer.parseInt(path.substring(1));
                JsonObject json = readJson(req);
                if (json == null || !json.has("title") || !json.has("content")) {
                    writeJson(resp, 400, false, "잘못된 요청 형식입니다.");
                    return;
                }

                String title = json.get("title").getAsString();
                String content = json.get("content").getAsString();

                ServiceResult r = service.update(idx, title, content);
                resp.setStatus(r.success ? 200 : 400);
                resp.getWriter().write(gson.toJson(r));
            } catch (Exception e) {
                e.printStackTrace();
                writeJson(resp, 500, false, "서버 오류: " + e.getMessage());
            }
        }

        /** 게시글 삭제 */
        @Override
        protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            setCors(resp);
            resp.setContentType("application/json; charset=UTF-8");
            try {
                String path = req.getPathInfo();
                if (path == null || path.length() < 2) {
                    writeJson(resp, 400, false, "잘못된 요청 경로입니다.");
                    return;
                }

                int idx = Integer.parseInt(path.substring(1));
                ServiceResult r = service.delete(idx);
                resp.setStatus(r.success ? 200 : 400);
                resp.getWriter().write(gson.toJson(r));
            } catch (Exception e) {
                e.printStackTrace();
                writeJson(resp, 500, false, "서버 오류: " + e.getMessage());
            }
        }

        private void writeJson(HttpServletResponse resp, int status, boolean success, String msg) throws IOException {
            resp.setStatus(status);
            ServiceResult r = new ServiceResult();
            r.success = success;
            r.message = msg;
            resp.getWriter().write(gson.toJson(r));
        }

        private int parseInt(String s, int def) {
            try { return Integer.parseInt(s); } catch (Exception ignore) { return def; }
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
    "id": "kim4",
    "password": "1234",
    "email": "a@b.com"
}'
```

2️⃣ 로그인
```bash
curl -X POST http://java.localhost/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "id": "kim4",
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