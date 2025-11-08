# JSP/Servlet을 같이 사용하는 방법

## 📘 학습 개요
Form 데이터 전송 → Servlet 처리 → JSP 출력 흐름을 실습 예제로 구현한다.


## 💡 주요 내용

- JSP/Servlet이 함께 쓰이는 이유

- JSP & Servlet 로직 구현 

---
## 1. JSP/Servlet이 함께 쓰이는 이유

| 이유      | 설명                                    |
| ------- | ------------------------------------- |
| 역할 분리   | JSP는 화면(UI), Servlet은 로직 처리 → 유지보수 쉬움 |
| 코드 재사용성 | Servlet에서 데이터 처리 후 JSP에서 출력만 담당       |
| 확장성     | 대형 프로젝트로 발전할 수 있는 구조                  |


## 2. JSP & Servlet 로직 구현

- 프로젝트 구성
    ```
    / (웹 루트)
        ├─ index.jsp                          ← 첫 진입 페이지       
        └─ WEB-INF/                           ← 외부에서 직접 접근 불가 (보안용)
            ├─ web.xml                        ← 서블릿/필터/리스너 매핑
            ├─ view/                          ← JSP(View) 모음
            │   └─ user/
            │       ├─ register.jsp
            │       └─ welcome.jsp
            ├─ src/                           ← Java 소스(Controller)
            │   └─ localhost.myapp.user/      ← 패키지: controller 역할(서블릿)
            │       └─ RegisterServlet.java
            ├─ classes/                       ← 컴파일 산출물(.class) — javac -d 가 배치
            │   └─ (패키지 구조대로 생성됨)
            └─ lib/                           ← JDBC 드라이버 등 서드파티 JAR
    ```

1. `RegisterServlet.java` 
    ```java
    package localhost.myapp.user;

    import jakarta.servlet.ServletException;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.*;
    import java.io.IOException;

    @WebServlet("/user/register")
    public class RegisterServlet extends HttpServlet {

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
            req.setCharacterEncoding("UTF-8");

            req.getRequestDispatcher("/WEB-INF/view/user/register.jsp").forward(req, resp);
        }

        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
            req.setCharacterEncoding("UTF-8");

            String email = req.getParameter("email");
            String username = req.getParameter("username");
            String age = req.getParameter("age");        

            // (DB 저장 로직 가능) - 지금은 단순히 값만 JSP로 전달
            // ...
            // ...
            // ...
            // (DB 저장 로직 끝)

            req.setAttribute("email", email);
            req.setAttribute("username", username);
            req.setAttribute("age", age);

            req.getRequestDispatcher("/WEB-INF/view/user/welcome.jsp").forward(req, resp);
        }
    }
    ```


2. `/WEB-INF/view/user/register.jsp` 파일 
    ```html
    <%@ page contentType="text/html; charset=UTF-8" %>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>회원 가입 페이지</title>
        <!-- css 태그 -->
        <style> 
            html { color-scheme: light dark; }
            body { width: 30em; margin: 0 auto;
            font-family: Tahoma, Verdana, Arial, sans-serif; }
        </style>
    </head>
    <body>
        <h2>회원 정보 입력</h2>
        <form action="/user/register" method="post">
            <p>이메일: <input type="text" name="email"></p>
            <p>이름: <input type="text" name="username"></p>
            <p>나이: <input type="text" name="age"></p>
            <p><button type="submit">등록하기</button></p>
        </form>
    </body>
    </html>
    ```


3. `/WEB-INF/view/user/welcome.jsp` 파일 작성
    ```html
    <%@ page contentType="text/html; charset=UTF-8" %>
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <title>회원가입 성공</title>
        <style> 
            html { color-scheme: light dark; }
            body { width: 30em; margin: 0 auto;
            font-family: Tahoma, Verdana, Arial, sans-serif; }
        </style>
    </head>
    <body>
    <div class="container">
        <h1>🎉 회원가입을 축하합니다!</h1>
        <p><b>${username}</b>님, 회원가입이 성공적으로 완료되었습니다.</p>

        <div class="info-box">
            <p><strong>이메일:</strong> <%=request.getAttribute("email")%></p>
            <p><strong>이름:</strong>  ${username}</p>
            <p><strong>나이:</strong>  ${age}</p>
        </div>

        <a href="/user/register" class="btn-home">다시하기</a>
    </div>
    </body>
    </html>
    ```


6. `Ctrl` + `Sfhit` + `B` 로 빌드 후 Tomcat 재시작

7. http://java.localhost/user/register 에서 동작 확인

