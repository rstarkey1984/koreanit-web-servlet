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
    /var/www/jsp.localhost/
                    ├── /WEB-INF/src/user/
                    │                 └── RegisterServlet.java ← Servlet (Controller)
                    └── user/
                         ├── register.jsp ← 회원가입 폼 (View)
                         └── welcome.jsp ← 가입 후 결과 페이지 (View)
                    
    ```


1. 프로젝트 안에 디렉터리 및 파일 생성

    ```bash
    mkdir -p /var/www/jsp.servlet.localhost/user/ && mkdir -p /var/www/jsp.servlet.localhost/WEB-INF/src/user
    ```

    ```bash
    touch /var/www/jsp.servlet.localhost/user/register.jsp && touch /var/www/jsp.servlet.localhost/user/welcome.jsp && touch /var/www/jsp.servlet.localhost/WEB-INF/src/user/RegisterServlet.java
    ```

2. `VSCode` 로 프로젝트 열기
     ```bash
    code /var/www/jsp.servlet.localhost/
    ```

3. `/user/register.jsp` 파일 작성
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

4. `/src/user/RegisterServlet.java` 파일 작성
    ```java
    package user;

    import jakarta.servlet.ServletException;
    import jakarta.servlet.annotation.WebServlet;
    import jakarta.servlet.http.*;
    import java.io.IOException;

    @WebServlet("/user/register")
    public class RegisterServlet extends HttpServlet {
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

            req.getRequestDispatcher("/user/welcome.jsp").forward(req, resp);
        }
    }
    ```

5. `/user/welcome.jsp` 파일 작성
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

        <a href="/user/register.jsp" class="btn-home">다시하기</a>
    </div>
    </body>
    </html>
    ```

    > ${}는 JSP에서 데이터를 출력하기 위한 EL(Expression Language) 문법으로, request나 session에 저장한 값을 매우 쉽게 가져올 수 있게 해준다.

    | 표현                           | 설명                       | 예시                             |
    | ---------------------------- | ------------------------ | ------------------------------ |
    | `${param.name}`              | GET/POST로 전송된 파라미터 값     | `?name=hong` → `${param.name}` |
    | `${requestScope.key}`        | request.setAttribute() 값 | `${requestScope.username}`     |
    | `${sessionScope.key}`        | session에 저장된 값           | `${sessionScope.userId}`       |
    | `${applicationScope.key}`    | ServletContext에 저장된 값    | `${applicationScope.count}`    |
    | `${cookie.cookieName.value}` | 쿠키 값 접근                  | `${cookie.userId.value}`       |
    | `${header["User-Agent"]}`    | 요청 헤더 값                  | 브라우저 정보 출력                     |
    | `${paramValues.hobby[0]}`    | 동일 name 파라미터 배열          | 체크박스 값                         |


6. `Ctrl` + `Sfhit` + `B` 로 빌드 후 Tomcat 재시작

7. http://jsp.servlet.localhost/user/register.jsp 에서 동작 확인

