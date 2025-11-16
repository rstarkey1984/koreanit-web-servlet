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

## 🌐 1. UserAPI (회원가입/로그인)
`UserAPI.java`

```java
package localhost.myapp.api;
// API 서블릿들을 모아둔 패키지.

import localhost.myapp.user.UserService;
import localhost.myapp.dto.ServiceResult;
// 사용자 비즈니스 로직(UserService), 공통 응답 DTO(ServiceResult) import.

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
// JSON 변환을 위한 Gson 라이브러리.
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
// 서블릿 애노테이션과 HttpServlet, HttpServletRequest/Response 사용.

import java.io.IOException;
// 입출력 예외 처리를 위한 import.

/**
 * /api/user/*
 * - POST /api/user/register : 회원가입
 * - POST /api/user/login : 로그인
 * - POST /api/user/logout : 로그아웃
 */
@WebServlet("/api/user/*")
public class UserAPI extends HttpServlet {
    // HttpServlet 을 상속하여 HTTP 요청을 처리하는 UserAPI 클래스.

    private final Gson gson = new Gson();
    // JSON 직렬화/역직렬화를 위한 Gson 인스턴스.

    private final UserService userService = new UserService();
    // 비즈니스 로직(회원가입, 로그인 등)을 담당하는 UserService.

    /**
     * 요청 바디를 JSON 으로 읽어서
     * - 성공 시: success=true, data 에 JsonObject 저장
     * - 실패 시: success=false, message 에 에러 메시지
     */
    private ServiceResult readJson(HttpServletRequest req) throws IOException {

        // 1. Content-Type 검사
        String contentType = req.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("application/json")) {
            return ServiceResult.fail("Content-Type 은 application/json 이어야 합니다.");
        }

        try {
            JsonElement elem = JsonParser.parseReader(req.getReader());

            // 2. body 비어 있음
            if (elem == null || elem.isJsonNull()) {
                return ServiceResult.fail("요청 body 가 비어 있습니다.");
            }

            // 3. JSON 객체가 아님 (배열/값 등)
            if (!elem.isJsonObject()) {
                return ServiceResult.fail("JSON 객체 형식의 body 가 필요합니다. (예: {\"id\":\"user\"})");
            }

            // 4. 성공 → data 에 JsonObject 넣어서 반환
            return ServiceResult.ok(elem.getAsJsonObject());

        } catch (JsonParseException e) {
            // 5. JSON 문법 에러
            return ServiceResult.fail("잘못된 JSON 형식입니다.");
        }
    }

    // ===== CORS 설정 메서드 =====
    private void setCors(HttpServletResponse resp) {
        // 브라우저에서 다른 Origin 에서 호출할 수 있도록 CORS 허용.
        resp.setHeader("Access-Control-Allow-Origin", "*");
        // 모든 Origin 허용 (*).

        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        // 요청에 포함될 수 있는 헤더 중 Content-Type 을 허용.

        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        // 허용할 HTTP 메서드 목록 지정.
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        // CORS preflight 요청(OPTIONS 메서드)을 처리.
        setCors(resp);
        // CORS 허용 헤더 설정.

        resp.setStatus(204);
        // 응답 본문 없는 성공 응답 204 No Content.
    }

    // ===== 공통 응답 JSON 출력 메서드들 =====

    private void writeJson(HttpServletResponse resp, int status, ServiceResult body)
            throws IOException {
        // HTTP 상태코드와 ServiceResult 구조로 JSON 응답을 내려주는 공통 메서드.
        resp.setStatus(status);
        // HTTP 상태 코드 설정.

        resp.setContentType("application/json; charset=UTF-8");
        // 응답 Content-Type 설정.

        resp.getWriter().write(gson.toJson(body));
        // Gson으로 JSON 문자열로 변환하여 클라이언트에 전송.
    }

    private void ok(HttpServletResponse resp, ServiceResult body) throws IOException {
        // 200 OK + ServiceResult 그대로 응답.
        writeJson(resp, 200, body);
    }

    private void created(HttpServletResponse resp, ServiceResult body) throws IOException {
        // 201 Created + ServiceResult 그대로 응답.
        writeJson(resp, 201, body);
    }

    private void badRequest(HttpServletResponse resp, String msg) throws IOException {
        // 400 Bad Request + 실패 응답.
        writeJson(resp, 400, ServiceResult.fail(msg));
    }

    private void unauthorized(HttpServletResponse resp, String msg) throws IOException {
        // 401 Unauthorized + 실패 응답.
        writeJson(resp, 401, ServiceResult.fail(msg));
    }

    private void notFound(HttpServletResponse resp, String msg) throws IOException {
        // 404 Not Found + 실패 응답.
        writeJson(resp, 404, ServiceResult.fail(msg));
    }

    private void serverError(HttpServletResponse resp, String msg) throws IOException {
        // 500 Internal Server Error + 실패 응답.
        writeJson(resp, 500, ServiceResult.fail(msg));
    }

    // ===== POST (회원가입, 로그인, 로그아웃 공통 처리) =====
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // POST /api/user/* 요청 처리 (회원가입, 로그인, 로그아웃).
        setCors(resp);
        // CORS 허용 헤더 설정.

        resp.setContentType("application/json; charset=UTF-8");
        // 응답 Content-Type 을 JSON + UTF-8 로 설정.

        try {
            String path = req.getPathInfo();
            // /api/user/* 에서 * 부분만 가져옴.
            // 예: /api/user/register → "/register"
            // /api/user/login → "/login"
            // /api/user/logout → "/logout"

            if (path == null) {
                // 경로 정보가 없는 경우 잘못된 요청으로 처리.
                badRequest(resp, "요청 경로를 확인하세요.");
                return;
            }

            // 1) 로그아웃은 body 없이 처리 (JSON 파싱 X)
            if ("/logout".equals(path)) {
                // 세션이 존재할 때만 가져오기 (새로 만들지 않음)
                HttpSession session = req.getSession(false);
                if (session != null) {
                    session.invalidate(); // 세션 완전 종료
                }

                // 로그아웃 성공 응답
                ok(resp, ServiceResult.ok("로그아웃 되었습니다."));
                return;
            }

            // 로그아웃이 아니라면 JSON body 파싱
            ServiceResult jr = readJson(req);
            if (!jr.success) {
                badRequest(resp, jr.message);
                return;
            }
            JsonObject json = (JsonObject) jr.data;

            switch (path) {
                case "/register": {
                    // 회원가입 처리.

                    if (!json.has("id") || !json.has("password") || !json.has("email")) {
                        // 필수 필드 유무 검사.
                        badRequest(resp, "필수 필드(id, password, email)가 없습니다.");
                        return;
                    }

                    String id = json.get("id").getAsString();
                    String password = json.get("password").getAsString();
                    String email = json.get("email").getAsString();

                    ServiceResult r = userService.register(id, password, email);

                    if (r.success) {
                        // 성공 시 201 Created + ServiceResult 전체 전송
                        HttpSession session = req.getSession(); // 여기서만 세션 생성/사용
                        session.setAttribute("id", id);
                        created(resp, r);
                    } else {
                        // 실패 시 400 Bad Request + message 사용.
                        badRequest(resp, r.message);
                    }
                    break;
                }

                case "/login": {
                    // 로그인 처리.

                    if (!json.has("id") || !json.has("password")) {
                        badRequest(resp, "필수 필드(id, password)가 없습니다.");
                        return;
                    }

                    String id = json.get("id").getAsString();
                    String password = json.get("password").getAsString();

                    ServiceResult r = userService.login(id, password);

                    if (r.success) {
                        // 로그인 성공: 200 OK + ServiceResult 그대로 응답.
                        HttpSession session = req.getSession(); // 여기서 세션 생성/사용
                        session.setAttribute("id", id);
                        ok(resp, r);
                    } else {
                        // 로그인 실패: 401 Unauthorized 로 응답.
                        unauthorized(resp, r.message);
                    }
                    break;
                }

                default:
                    // 정의되지 않은 경로로 요청 시.
                    notFound(resp, "지원하지 않는 경로입니다.");
            }

        } catch (Exception e) {
            // 예외 발생 시 서버 오류 처리.
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }
}
```

## 🧾 2. BoardAPI (게시글 CRUD)
`BoardAPI.java`

```java
package localhost.myapp.api;

import java.io.IOException;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import localhost.myapp.board.Board;
import localhost.myapp.board.BoardService;
import localhost.myapp.dto.ServiceResult;

/**
 * /api/board/*
 *
 * - GET /api/board : 게시글 목록 (page, size)
 * - GET /api/board/{idx} : 게시글 상세
 * - POST /api/board : 게시글 작성
 * - PUT /api/board/{idx} : 게시글 수정 (본인 글만)
 * - DELETE /api/board/{idx} : 게시글 삭제 (본인 글만)
 *
 * 모든 응답은 ServiceResult JSON 구조를 사용한다.
 */
@WebServlet("/api/board/*")
public class BoardAPI extends HttpServlet {

    /** 게시판 비즈니스 로직 */
    private final BoardService service = new BoardService();

    /** JSON 변환기 */
    private final Gson gson = new Gson();

    /**
     * 요청 바디를 JSON으로 읽고, 성공/실패를 ServiceResult로 감싸서 반환
     * - 성공 시: success=true, data에 JsonObject 저장
     * - 실패 시: success=false, message에 오류 설명
     */
    private ServiceResult readJson(HttpServletRequest req) throws IOException {

        // 1. Content-Type 검사
        String contentType = req.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("application/json")) {
            return ServiceResult.fail("Content-Type 은 application/json 이어야 합니다.");
            // 호출한 쪽에서 jr.success 보고 400으로 응답할 것
        }

        try {
            JsonElement elem = JsonParser.parseReader(req.getReader());

            // 2. body 비어 있음
            if (elem == null || elem.isJsonNull()) {
                return ServiceResult.fail("요청 body 가 비어 있습니다.");
            }

            // 3. JSON 객체가 아님 (배열/값 등)
            if (!elem.isJsonObject()) {
                return ServiceResult.fail("JSON 객체 형식의 body 가 필요합니다. (예: {\"id\":\"user\"})");
            }

            // 4. 성공 → data에 JsonObject 넣어서 반환
            JsonObject obj = elem.getAsJsonObject();
            return ServiceResult.ok(obj);

        } catch (JsonParseException e) {
            // 5. JSON 문법 에러
            return ServiceResult.fail("잘못된 JSON 형식입니다.");
        }
    }

    /** CORS 헤더 설정 */
    private void setCors(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    }

    /** OPTIONS 요청(CORS preflight) 처리 */
    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        setCors(resp);
        resp.setStatus(204); // No Content
    }

    // ===== 응답 공통 처리 메서드들 =====

    /** 상태코드 + JSON 응답 출력 */
    private void writeJson(HttpServletResponse resp, int status, ServiceResult body)
            throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json; charset=UTF-8");
        resp.getWriter().write(gson.toJson(body));
    }

    /** 200 OK + data 응답 */
    private void ok(HttpServletResponse resp, Object data) throws IOException {
        writeJson(resp, 200, ServiceResult.ok(data));
    }

    /** 201 Created 응답 */
    private void created(HttpServletResponse resp, ServiceResult result) throws IOException {
        writeJson(resp, 201, result);
    }

    /** 400 Bad Request */
    private void badRequest(HttpServletResponse resp, String msg) throws IOException {
        writeJson(resp, 400, ServiceResult.fail(msg));
    }

    /** 404 Not Found */
    private void notFound(HttpServletResponse resp, String msg) throws IOException {
        writeJson(resp, 404, ServiceResult.fail(msg));
    }

    /** 500 Internal Server Error */
    private void serverError(HttpServletResponse resp, String msg) throws IOException {
        writeJson(resp, 500, ServiceResult.fail(msg));
    }

    // ============================================================
    // GET (목록/단건 조회)
    // ============================================================

    /**
     * GET /api/board → 게시글 목록
     * GET /api/board/{idx} → 게시글 상세
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCors(resp);

        try {
            String path = req.getPathInfo(); // "/3" or null

            // ===== 목록 조회 =====
            if (path == null || "/".equals(path)) {
                int page = parseInt(req.getParameter("page"), 1);
                int size = parseInt(req.getParameter("size"), 10);

                List<Board> list = service.list(page, size);
                ok(resp, list); // List<Board>를 data로 감싸서 응답
                return;
            }

            // ===== 단일 조회 =====
            int idx = Integer.parseInt(path.substring(1));
            Board b = service.get(idx);

            if (b == null) {
                notFound(resp, "게시글을 찾을 수 없습니다.");
                return;
            }

            ok(resp, b);

        } catch (Exception e) {
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    // ============================================================
    // POST (게시글 생성)
    // ============================================================

    /**
     * POST /api/board
     * Body: { title, content }
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCors(resp);

        try {
            ServiceResult jr = readJson(req);
            if (!jr.success) {
                badRequest(resp, jr.message);
                return;
            }

            JsonObject json = (JsonObject) jr.data;

            // 필수값 검증
            if (json == null || !json.has("title") || !json.has("content")) {
                badRequest(resp, "필수 필드(title, content)가 없습니다.");
                return;
            }

            HttpSession session = req.getSession(); // 로그인 세션
            String fk_user_id = (String) session.getAttribute("id"); // 작성자 ID

            String title = json.get("title").getAsString();
            String content = json.get("content").getAsString();

            // 게시글 생성 (ServiceResult.idx 에 새 idx 들어감)
            ServiceResult r = service.create(title, content, fk_user_id);

            if (r.success) {
                created(resp, r); // status 201 + body: ServiceResult( message + idx )
            } else {
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    // ============================================================
    // PUT (게시글 수정)
    // ============================================================

    /**
     * PUT /api/board/{idx}
     * Body: { title, content }
     * - 본인 게시글만 수정 가능
     */
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCors(resp);

        try {
            String path = req.getPathInfo();

            if (path == null || path.length() < 2) {
                badRequest(resp, "잘못된 요청 경로입니다.");
                return;
            }

            int idx = Integer.parseInt(path.substring(1));
            ServiceResult jr = readJson(req);
            if (!jr.success) {
                badRequest(resp, jr.message);
                return;
            }
            JsonObject json = (JsonObject) jr.data;

            if (json == null || !json.has("title") || !json.has("content")) {
                badRequest(resp, "필수 필드(title, content)가 없습니다.");
                return;
            }

            HttpSession session = req.getSession();
            String fk_user_id = (String) session.getAttribute("id");

            String title = json.get("title").getAsString();
            String content = json.get("content").getAsString();

            // 수정 로직 (본인 여부는 service.update 내부에서 검사)
            ServiceResult r = service.update(idx, title, content, fk_user_id);

            if (r.success) {
                writeJson(resp, 200, r); // 메시지: "수정되었습니다", data: null
            } else {
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    // ============================================================
    // DELETE (게시글 삭제)
    // ============================================================

    /**
     * DELETE /api/board/{idx}
     * - 본인 게시글만 삭제 가능
     */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCors(resp);

        try {
            String path = req.getPathInfo();

            if (path == null || path.length() < 2) {
                badRequest(resp, "잘못된 요청 경로입니다.");
                return;
            }

            HttpSession session = req.getSession();
            String fk_user_id = (String) session.getAttribute("id");

            int idx = Integer.parseInt(path.substring(1));

            // 삭제 로직 (본인 여부는 service.delete 내부에서 검사)
            ServiceResult r = service.delete(idx, fk_user_id);

            if (r.success) {
                writeJson(resp, 200, r);
            } else {
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    /** 문자열 숫자 파싱 유틸 (파싱 실패 시 기본값 반환) */
    private int parseInt(String s, int def) {
        try {
            return Integer.parseInt(s);
        } catch (Exception ignore) {
            return def;
        }
    }
}
```

## 📡 4. Servlet API + CRUD 엔드포인트 요약

| 구분     | 기능        | HTTP 메서드 | URL                         | 요청 Body(JSON)                                          | 비고                                |
| ------ | --------- | -------- | --------------------------- | ------------------------------------------------------ | --------------------------------- |
| 👤 사용자 | 회원가입      | `POST`   | `/api/user/register`        | `{ "id":"kim", "password":"1234", "email":"a@b.com" }` | 회원 정보 저장                          |
| 👤 사용자 | 로그인       | `POST`   | `/api/user/login`           | `{ "id":"kim", "password":"1234" }`                    | 로그인 성공 여부 반환                      |
| 📰 게시판 | 게시글 목록 조회 | `GET`    | `/api/board?page=1&size=10` | -                                                      | 페이징 지원 (`page`, `size` 기본값 1, 10) |
| 📰 게시판 | 게시글 단건 조회 | `GET`    | `/api/board/{idx}`          | -                                                      | 게시글 번호(`idx`)로 조회                 |
| 📰 게시판 | 게시글 작성    | `POST`   | `/api/board`                | `{ "title":"제목", "content":"내용" }`                     | 새 게시글 등록                          |
| 📰 게시판 | 게시글 수정    | `PUT`    | `/api/board/{idx}`          | `{ "title":"수정", "content":"내용2" }`                    | 지정된 `idx` 게시글 수정                  |
| 📰 게시판 | 게시글 삭제    | `DELETE` | `/api/board/{idx}`          | -                                                      | 지정된 `idx` 게시글 삭제                  |


## 💬 5. 요청 예시 ( CURL 테스트용 )

### ⚙️ 참고

- `-X` : HTTP 메서드 지정

- `-H` : 요청 헤더 설정

- `-d` : 요청 바디(JSON) 데이터

- "" → URL에 ?나 &가 포함될 때는 반드시 묶어줘야 함

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



## 🧩 실습 / 과제
- `CURL` 로 /api/ 페이지 요청해보기

- API 테스트 및 개발용 확장 프로그램 [다운로드](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)



- `api-test.http`
    ```
    @host = http://127.0.0.1
    @hostname = java.localhost

    ### 회원가입
    POST {{host}}/api/user/register
    Host: {{hostname}}
    Content-Type: application/json

    {
        "id": "idtest",
        "password": "1234",
        "email": "a@b.com"
    }

    ### 로그인
    POST {{host}}/api/user/login
    Host: {{hostname}}
    Content-Type: application/json

    {
        "id": "idtest",
        "password": "1234"
    }

    ### 로그아웃
    POST {{host}}/api/user/logout
    Host: {{hostname}}
    Content-Type: application/json

    ### 게시판 목록 조회
    GET {{host}}/api/board?page=1&size=10
    Host: {{hostname}}

    ### 게시판 상세 조회
    GET {{host}}/api/board/1
    Host: {{hostname}}

    ### 게시판 글 작성
    POST {{host}}/api/board
    Host: {{hostname}}
    Content-Type: application/json

    {
        "title": "첫 번째 글",
        "content": "게시판 내용입니다."
    }

    ### 게시판 글 수정
    PUT {{host}}/api/board/1
    Host: {{hostname}}
    Content-Type: application/json

    {
        "title": "수정된 제목",
        "content": "수정된 내용입니다."
    }

    ### 게시판 글 삭제
    DELETE {{host}}/api/board/1
    Host: {{hostname}}
    ```