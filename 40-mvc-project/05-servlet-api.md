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
// 이 클래스가 속한 패키지 선언. API 관련 코드를 모아둔 패키지.

import localhost.myapp.user.UserService; 
// 사용자 로직(회원가입/로그인)을 처리하는 서비스 클래스 import.
import localhost.myapp.dto.ServiceResult; 
// 성공/실패 여부를 공통적으로 전달하기 위한 DTO 클래스 import.

import com.google.gson.Gson;
import com.google.gson.JsonObject;
// JSON 파싱/생성을 위해 Gson 라이브러리 import.

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
// Servlet API 사용을 위한 import.

import java.io.IOException;
// 입출력 예외 처리를 위한 import.

/**
* /api/user/*  
* - POST /api/user/register : 회원가입  
* - POST /api/user/login    : 로그인
*/
// API 엔드포인트 설명 주석.

@WebServlet("/api/user/*")
// /api/user/ 로 시작하는 모든 요청을 이 서블릿이 처리하도록 설정.

public class UserAPI extends HttpServlet {
// HttpServlet 상속하여 doPost, doOptions 등을 오버라이딩.

    private final Gson gson = new Gson();
    // JSON 변환을 위해 Gson 인스턴스를 생성.

    private final UserService userService = new UserService();
    // 비즈니스 로직을 담당하는 UserService 사용.

    private JsonObject readJson(HttpServletRequest req) throws IOException {
        // 요청 body(JSON)를 읽어 JsonObject 로 변환하는 메서드.
        return gson.fromJson(req.getReader(), JsonObject.class);
        // req.getReader() → HTTP body 읽기, gson.fromJson → JSON 파싱.
    }

    // CORS 허용 설정
    private void setCors(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        // 어떤 도메인이든 요청 허용.

        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        // 요청에서 Content-Type 헤더 허용.

        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        // 브라우저가 보낼 수 있는 HTTP 메서드 제한.
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        // 브라우저의 CORS preflight 요청(OPTIONS)을 처리.
        setCors(resp);
        // CORS 헤더 설정.

        resp.setStatus(204);
        // OPTIONS 응답은 body 없이 204 No Content 가 적절.
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // POST 요청 처리. 회원가입/로그인 모두 POST.

        setCors(resp);
        // CORS 헤더 설정.

        resp.setContentType("application/json; charset=UTF-8");
        // 응답이 JSON이며 UTF-8 인코딩 사용한다고 명시.

        try {
            String path = req.getPathInfo();
            // /api/user/* 에서 /* 부분만 추출 (/register 또는 /login)

            if (path == null) {
                // 경로가 없는 경우 → 잘못된 요청
                writeJson(resp, 404, false, "요청 경로를 확인하세요.");
                return;
            }

            JsonObject json = readJson(req);
            // 요청 body(JSON)를 파싱하여 JsonObject 로 변환.

            if (json == null) {
                // JSON 형식이 아니거나 body 가 없는 경우
                writeJson(resp, 400, false, "잘못된 요청 형식입니다.");
                return;
            }

            // 요청 경로에 따라 분기 처리
            switch (path) {

                // ====== 회원가입 (/register) ======
                case "/register": {

                    // 필수 항목 존재 여부 확인
                    if (!json.has("id") || !json.has("password") || !json.has("email")) {
                        writeJson(resp, 400, false, "필수 필드(id, password, email)가 없습니다.");
                        return;
                    }

                    // JSON 내부 값 꺼내기
                    String id = json.get("id").getAsString();
                    String password = json.get("password").getAsString();
                    String email = json.get("email").getAsString();

                    // 실제 회원가입 처리 (서비스 레이어 호출)
                    ServiceResult r = userService.register(id, password, email);

                    // 성공 시 201 Created, 실패 시 400 Bad Request
                    resp.setStatus(r.success ? 201 : 400);

                    // JSON 응답 전송
                    resp.getWriter().write(gson.toJson(r));
                    break;
                }

                // ====== 로그인 (/login) ======
                case "/login": {

                    // 필수 항목 체크
                    if (!json.has("id") || !json.has("password")) {
                        writeJson(resp, 400, false, "필수 필드(id, password)가 없습니다.");
                        return;
                    }

                    // JSON 값 추출
                    String id = json.get("id").getAsString();
                    String password = json.get("password").getAsString();

                    // 로그인 처리
                    ServiceResult r = userService.login(id, password);

                    // 성공이면 200 OK, 실패는 400
                    // (원하면 401 Unauthorized 로 바꿀 수 있음)
                    resp.setStatus(r.success ? 200 : 400);

                    // JSON 응답
                    resp.getWriter().write(gson.toJson(r));
                    break;
                }

                // ====== 해당하지 않는 경로 ======
                default:
                    writeJson(resp, 404, false, "지원하지 않는 경로입니다.");
            }

        } catch (Exception e) {
            // 서버 내부 오류 발생 시 처리
            e.printStackTrace();
            writeJson(resp, 500, false, "서버 오류: " + e.getMessage());
        }
    }

    // JSON 형태의 공통 응답을 만들어주는 메서드
    private void writeJson(HttpServletResponse resp, int status, boolean success, String msg) throws IOException {
        resp.setStatus(status);
        // HTTP 상태 코드 설정.

        ServiceResult r = new ServiceResult();
        // 공통 응답 객체 생성.

        r.success = success;
        r.message = msg;
        // 결과 정보 채우기.

        resp.getWriter().write(gson.toJson(r));
        // JSON 으로 직렬화하여 전송.
    }
}
```

## 🧾 2. BoardAPI (게시글 CRUD)
`BoardAPI.java`

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

    // ===== 공통 응답 출력 =====

    private void writeJson(HttpServletResponse resp, int status, ServiceResult<?> body)
            throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json; charset=UTF-8");
        resp.getWriter().write(gson.toJson(body));
    }

    private void ok(HttpServletResponse resp, Object data) throws IOException {
        writeJson(resp, 200, ServiceResult.ok(data));
    }

    private void created(HttpServletResponse resp, ServiceResult<?> result) throws IOException {
        writeJson(resp, 201, result);
    }

    private void badRequest(HttpServletResponse resp, String msg) throws IOException {
        writeJson(resp, 400, ServiceResult.fail(msg));
    }

    private void notFound(HttpServletResponse resp, String msg) throws IOException {
        writeJson(resp, 404, ServiceResult.fail(msg));
    }

    private void serverError(HttpServletResponse resp, String msg) throws IOException {
        writeJson(resp, 500, ServiceResult.fail(msg));
    }

    /** 목록 / 단건 조회 */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCors(resp);

        try {
            String path = req.getPathInfo();

            if (path == null || "/".equals(path)) {
                int page = parseInt(req.getParameter("page"), 1);
                int size = parseInt(req.getParameter("size"), 10);

                List<Board> list = service.list(page, size);
                ok(resp, list); // ServiceResult<List<Board>> 로 감싸서 응답
                return;
            }

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

    /** 게시글 생성 */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCors(resp);

        try {
            JsonObject json = readJson(req);

            if (json == null || !json.has("title") || !json.has("content")) {
                badRequest(resp, "필수 필드(title, content)가 없습니다.");
                return;
            }

            String title = json.get("title").getAsString();
            String content = json.get("content").getAsString();

            ServiceResult<Integer> r = service.create(title, content);

            if (r.success) {
                // r.data = 새로 생성된 idx
                created(resp, r);
            } else {
                // 실패 시 400 + 실패 메시지
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    /** 게시글 수정 */
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
            JsonObject json = readJson(req);

            if (json == null || !json.has("title") || !json.has("content")) {
                badRequest(resp, "필수 필드(title, content)가 없습니다.");
                return;
            }

            String title = json.get("title").getAsString();
            String content = json.get("content").getAsString();

            ServiceResult<Void> r = service.update(idx, title, content);

            if (r.success) {
                writeJson(resp, 200, r); // message: "수정되었습니다", data: null
            } else {
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    /** 게시글 삭제 */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCors(resp);

        try {
            String path = req.getPathInfo();

            if (path == null || path.length() < 2) {
                badRequest(resp, "잘못된 요청 경로입니다.");
                return;
            }

            int idx = Integer.parseInt(path.substring(1));

            ServiceResult<Void> r = service.delete(idx);

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
    "id": "kim4",
    "password": "1234",
    "email": "a@b.com"
    }

    ### 로그인
    POST {{host}}/api/user/login
    Host: {{hostname}}
    Content-Type: application/json

    {
    "id": "kim4",
    "password": "1234"
    }

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