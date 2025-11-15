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

## 1. API Response 응답 클래스 생성

```java
package localhost.myapp.dto;

public class ApiResponse<T> {
    public boolean success; // 성공 여부
    public String message; // 메시지
    public T data; // 실제 데이터 (게시글, 목록 등)

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // 성공 응답 편의 메서드
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data);
    }

    // 메시지 포함 성공
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    // 실패 응답
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
```

## 🌐 2. UserAPI (회원가입/로그인)
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

## 🧾 3. BoardAPI (게시글 CRUD)
`BoardAPI.java`

```java
package localhost.myapp.api;
// API 서블릿 패키지.

import localhost.myapp.board.Board;
import localhost.myapp.board.BoardService;
import localhost.myapp.dto.ServiceResult;
import localhost.myapp.dto.ApiResponse;
// 게시판 도메인, 서비스, 공통 응답 DTO 를 import.

import com.google.gson.Gson;
import com.google.gson.JsonObject;
// JSON 처리를 위한 Gson.

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
// 서블릿 관련 클래스들.

import java.io.IOException;
import java.util.List;
// 예외와 목록(List) 사용.

/**
* /api/board/* REST 엔드포인트
* - GET /api/board?page=1&size=10 : 목록
* - GET /api/board/{idx} : 단건 조회
* - POST /api/board : 생성
* - PUT /api/board/{idx} : 수정
* - DELETE /api/board/{idx} : 삭제
*/
// 이 서블릿에서 처리하는 REST API 설명.

@WebServlet("/api/board/*")
// /api/board/ 로 시작하는 모든 요청 매핑.

public class BoardAPI extends HttpServlet {
    // HttpServlet 을 상속하는 게시판 API 서블릿.

    private final BoardService service = new BoardService();
    // 게시판 비즈니스 로직(목록, 조회, 생성, 수정, 삭제)을 담당하는 서비스.

    private final Gson gson = new Gson();
    // JSON 직렬화/역직렬화를 위한 Gson 인스턴스.

    private JsonObject readJson(HttpServletRequest req) throws IOException {
        // 요청 body 를 JsonObject 로 읽어오는 헬퍼 메서드.
        return gson.fromJson(req.getReader(), JsonObject.class);
        // req.getReader()로 body를 읽고 Gson으로 JSON 파싱.
    }

    private void setCors(HttpServletResponse resp) {
        // CORS 헤더를 설정해주는 메서드.
        resp.setHeader("Access-Control-Allow-Origin", "*");
        // 모든 Origin 허용.

        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        // Content-Type 헤더 허용.

        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        // 허용할 HTTP 메서드 목록.
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        // CORS preflight 요청(OPTIONS)을 처리.
        setCors(resp);
        // CORS 허용 헤더 설정.

        resp.setStatus(204);
        // 본문 없이 204 No Content 로 응답.
    }

    // ===== 공통 응답 출력 헬퍼들 =====

    private void writeJson(HttpServletResponse resp, int status, boolean success, String msg, Object data)
            throws IOException {
        // ApiResponse 형태로 응답 JSON 을 출력하는 공통 메서드.
        resp.setStatus(status);
        // HTTP 상태 코드 설정.

        ApiResponse<Object> body = new ApiResponse<>(success, msg, data);
        // success, message, data 를 갖는 ApiResponse 객체 생성.

        resp.getWriter().write(gson.toJson(body));
        // Gson 을 사용해 JSON 문자열로 변환 후, 클라이언트에 쓰기.
    }

    private void ok(HttpServletResponse resp, Object data) throws IOException {
        // 200 OK + 성공 true + data 포함 응답.
        writeJson(resp, 200, true, null, data);
    }

    private void created(HttpServletResponse resp, Object data) throws IOException {
        // 201 Created + 성공 true + data 포함 응답.
        writeJson(resp, 201, true, null, data);
    }

    private void badRequest(HttpServletResponse resp, String msg) throws IOException {
        // 400 Bad Request + 실패 false + 메시지 포함 응답.
        writeJson(resp, 400, false, msg, null);
    }

    private void notFound(HttpServletResponse resp, String msg) throws IOException {
        // 404 Not Found + 실패 false + 메시지 포함 응답.
        writeJson(resp, 404, false, msg, null);
    }

    private void serverError(HttpServletResponse resp, String msg) throws IOException {
        // 500 Internal Server Error + 실패 false + 메시지 포함 응답.
        writeJson(resp, 500, false, msg, null);
    }

    /** 목록 / 단건 조회 */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // GET /api/board 또는 GET /api/board/{idx} 요청 처리.

        setCors(resp);
        // CORS 허용 헤더 설정.

        resp.setContentType("application/json; charset=UTF-8");
        // 응답 Content-Type 을 JSON + UTF-8 로 설정.

        try {
            String path = req.getPathInfo();
            // /api/board/* 에서 * 부분 경로를 가져옴.
            // 예: /api/board → null 또는 "/"
            // /api/board/3 → "/3"

            if (path == null || "/".equals(path)) {
                // path 가 없거나 "/" 이면 목록 조회로 간주.
                int page = parseInt(req.getParameter("page"), 1);
                // page 파라미터 읽기, 없으면 1.

                int size = parseInt(req.getParameter("size"), 10);
                // size 파라미터 읽기, 없으면 10.

                List<Board> list = service.list(page, size);
                // 서비스 레이어에서 게시글 목록 조회.

                ok(resp, list);
                // 200 OK + { success: true, data: list } 형태로 응답.
                return;
            }

            int idx = Integer.parseInt(path.substring(1));
            // "/3" → "3" 으로 잘라서 정수로 변환 (게시글 번호).

            Board b = service.get(idx);
            // 서비스 레이어에서 idx 에 해당하는 게시글 조회.

            if (b == null) {
                // 게시글이 없으면 404 Not Found 응답.
                notFound(resp, "게시글을 찾을 수 없습니다.");
                return;
            }

            ok(resp, b);
            // 200 OK + { success: true, data: 게시글 } 응답.

        } catch (Exception e) {
            // 예외 발생 시 서버 오류 응답.
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    /** 게시글 생성 */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // POST /api/board : 새 게시글 생성.

        setCors(resp);
        // CORS 허용.

        resp.setContentType("application/json; charset=UTF-8");
        // JSON 응답 설정.

        try {
            JsonObject json = readJson(req);
            // 요청 body를 JSON으로 파싱.

            if (json == null || !json.has("title") || !json.has("content")) {
                // 필수 필드(title, content)가 없으면 잘못된 요청.
                badRequest(resp, "필수 필드(title, content)가 없습니다.");
                return;
            }

            String title = json.get("title").getAsString();
            // JSON에서 title 추출.

            String content = json.get("content").getAsString();
            // JSON에서 content 추출.

            ServiceResult r = service.create(title, content);
            // 서비스 레이어를 통해 게시글 생성 로직 수행.

            if (r.success) {
                // 생성 성공 시 201 Created + 데이터로 ServiceResult 전달.
                created(resp, r);
            } else {
                // 실패 시 400 Bad Request + 오류 메시지.
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            // 예외 발생 시 서버 오류 응답.
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    /** 게시글 수정 */
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // PUT /api/board/{idx} : 기존 게시글 수정.

        setCors(resp);
        // CORS 허용.

        resp.setContentType("application/json; charset=UTF-8");
        // JSON 응답 설정.

        try {
            String path = req.getPathInfo();
            // /api/board/* 중 * 부분 (예: "/3").

            if (path == null || path.length() < 2) {
                // "/{숫자}" 가 아닌 경우 잘못된 경로.
                badRequest(resp, "잘못된 요청 경로입니다.");
                return;
            }

            int idx = Integer.parseInt(path.substring(1));
            // "/3" → "3" → 정수 3.

            JsonObject json = readJson(req);
            // 요청 body 를 JSON 으로 파싱.

            if (json == null || !json.has("title") || !json.has("content")) {
                // 필수 필드 누락 시.
                badRequest(resp, "필수 필드(title, content)가 없습니다.");
                return;
            }

            String title = json.get("title").getAsString();
            // 수정할 제목.

            String content = json.get("content").getAsString();
            // 수정할 내용.

            ServiceResult r = service.update(idx, title, content);
            // 서비스 레이어를 통해 해당 게시글 수정 수행.

            if (r.success) {
                // 수정 성공: 200 OK + ServiceResult 응답.
                ok(resp, r);
            } else {
                // 수정 실패: 400 Bad Request + 메시지.
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            // 예외 발생 시 서버 오류.
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    /** 게시글 삭제 */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // DELETE /api/board/{idx} : 게시글 삭제.

        setCors(resp);
        // CORS 허용.

        resp.setContentType("application/json; charset=UTF-8");
        // JSON 응답 설정.

        try {
            String path = req.getPathInfo();
            // /api/board/* 중 * 부분.

            if (path == null || path.length() < 2) {
                // "/{숫자}" 가 아닌 경우.
                badRequest(resp, "잘못된 요청 경로입니다.");
                return;
            }

            int idx = Integer.parseInt(path.substring(1));
            // "/3" → 3.

            ServiceResult r = service.delete(idx);
            // 서비스 레이어를 통해 삭제 로직 수행.

            if (r.success) {
                // 삭제 성공: 200 OK + ServiceResult.
                ok(resp, r);
            } else {
                // 삭제 실패: 400 Bad Request + 메시지.
                badRequest(resp, r.message);
            }

        } catch (Exception e) {
            // 예외 발생 시 서버 오류.
            e.printStackTrace();
            serverError(resp, "서버 오류: " + e.getMessage());
        }
    }

    private int parseInt(String s, int def) {
        // 문자열을 int 로 변환하고, 실패하면 기본값을 반환하는 유틸.
        try {
            return Integer.parseInt(s);
            // 정상 변환 시 그대로 반환.
        } catch (Exception ignore) {
            // NumberFormatException, null 등의 예외는 무시.
            return def;
            // 예외 발생 시 기본값 반환.
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