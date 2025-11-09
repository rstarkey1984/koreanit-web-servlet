# JSP 작동방식

## 📘 학습 개요
JSP는 작동 방식을 알아보자.

- `VSCode` 확장 프로그램 설치
  - https://marketplace.visualstudio.com/items?itemName=samuel-weinhardt.vscode-jsp-lang


## 💡 주요 내용

- Tomcat 에서 JSP 요청 처리 흐름

- JSP 기본구조 및 문법

- JSP EL(Expression Language) 소개

- JSP 간단 예제 실습 

- JSTL (JavaServer Pages Standard Tag Library)

---
## 1. Tomcat ( Servlet Container ) 에서 JSP 요청 처리 흐름

| 단계                     | 설명                                        |
| ---------------------- | ----------------------------------------- |
| 1️⃣ 클라이언트 요청           | 사용자가 `http://localhost:8081/index.jsp` 요청 |
| 2️⃣ JSP 파일 확인          | 해당 JSP가 이미 서블릿으로 변환되었는지 검사                |
| 3️⃣ *JSP → Servlet 변환* | `.jsp` → `.java` (Servlet 파일 생성)          |
| 4️⃣ *Servlet 컴파일*      | `.java` → `.class` (자바 바이트코드 컴파일)         |
| 5️⃣ 클래스 로딩 & 실행        | 서블릿 클래스 로딩 후, service() 메서드 실행            |
| 6️⃣ HTML 응답            | 서블릿이 HTML 문자열을 만들어 브라우저에 전송               |

## 2. JSP 기본구조 및 문법

- 기본구조
  ```jsp
  <%@ page contentType="text/html; charset=UTF-8" language="java" %>
  <!DOCTYPE html>
  <html>
  <head>
      <title>JSP Example</title>
  </head>
  <body>
      <%-- JSP 코드와 HTML 함께 사용 가능 --%>
      <h1>Hello JSP!</h1>
  </body>
  </html>
  ```

- 문법
1. `<%@ ... %>` **JSP 지시자(Directive)**
    > JSP 페이지 전체 설정 (page, include, taglib 등)        
    ```jsp
    <%@ page contentType="text/html; charset=UTF-8" %> // 페이지 설정
    <%@ iclude file="header.jsp" %> // 다른 JSP/HTML 포함하기
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %> // JSTL 같은 태그라이브러리 사용 
    ```

2. `<% ... %>` **스크립틀릿(Scriptlet)**
    > JSP 안에서 Java 코드 실행  
    ```jsp
    <%
      String name = request.getParameter("name");
      if (name == null) name = "Guest";
    %>
    ```

3. `<%= ... %>` **표현식(Expression)** 
    > Java 변수나 값을 출력
    ```jsp
    <p>안녕하세요, <%= name %>님!</p>
    <p>1 + 2 = <%= 1 + 2 %></p>
    ```

4. `<%! ... %>` **선언문(Declaration)**
    > 변수 또는 메서드를 선언 (전역처럼 사용)
    ```jsp
    <%! 
      int count = 0;
      public String hello() {
          return "Hello JSP!";
      }
    %>
    <p><%= hello() %></p>
    ```    

## 2. JSP 기본 내장 객체 (Implicit Objects - 9개)
> JSP 파일에서 import 없이 바로 사용 가능한 객체들

| 객체            | 타입                    | 역할                                  |
| ------------- | --------------------- | ----------------------------------- |
| `request`     | `HttpServletRequest`  | 클라이언트 요청 정보 (파라미터, 헤더 등)            |
| `response`    | `HttpServletResponse` | 클라이언트에게 응답 출력 (헤더, 쿠키 등)            |
| `session`     | `HttpSession`         | 사용자 세션 저장 공간                        |
| `application` | `ServletContext`      | 웹 애플리케이션 전체에서 공유되는 영역               |
| `out`         | `JspWriter`           | HTML 응답에 출력하는 스트림 (`out.println()`) |
| `pageContext` | `PageContext`         | JSP 전체를 관리하는 핵심 객체 (모든 객체 접근 가능)    |
| `page`        | `Object`              | 현재 JSP 페이지 자체 (`this`)              |
| `config`      | `ServletConfig`       | 서블릿 초기화 파라미터, 설정 정보                 |
| `exception`   | `Throwable`           | 예외 처리용 객체 (`errorPage`에서만 사용 가능)    |

## 3. JSP 기본 스코프(Scope) 4가지

| 스코프         | 유지시간                    | 저장 위치                        | EL에서 접근                   |
| ----------- | ----------------------- | ---------------------------- | ------------------------- |
| Page        | 현재 JSP 페이지에서만 유지        | `pageContext.setAttribute()` | `${pageScope.key}`        |
| Request     | 요청이 끝날 때까지 (forward 포함) | `request.setAttribute()`     | `${requestScope.key}`     |
| Session     | 브라우저가 닫히거나 타임아웃까지       | `session.setAttribute()`     | `${sessionScope.key}`     |
| Application | 서버가 켜져 있는 동안            | `application.setAttribute()` | `${applicationScope.key}` |

 > `Scope` 를 적지 않으면 자동으로 가장 가까운 영역부터 찾는다 (page → request → session → application 순).

- JSP에서 설정 예:

  ```jsp
  request.setAttribute("msg", "Hello");  
  session.setAttribute("user", "Tom");
  ```

- JSP/EL에서 사용:
  ```jsp
  ${requestScope.msg}  
  ${sessionScope.user}
  ```


## 4. JSP EL(Expression Language) 소개
> EL은 JSP에서 ${} 문법을 사용해 간단히 값을 출력하거나 가져오는 표현식 언어입니다. 기존의 <%= ... %> 같은 스크립틀릿(scriptlet)을 대체하면서 JSP를 더 깔끔하고 가독성 좋게 만드는 역할

- EL로 접근 가능한 기본 객체들
  | EL 객체              | 설명                         | 예시                              |
  | ------------------ | -------------------------- | ------------------------------- |
  | `pageScope`        | 현재 JSP 페이지 범위 변수           | `${pageScope.value}`            |
  | `requestScope`     | Request 범위 변수              | `${requestScope.msg}`           |
  | `sessionScope`     | 세션 범위 변수                   | `${sessionScope.user}`          |
  | `applicationScope` | 애플리케이션 범위 변수               | `${applicationScope.count}`     |
  | `param`            | 요청 파라미터 (단일 값)             | `${param.name}`                 |
  | `paramValues`      | 요청 파라미터 배열                 | `${paramValues.hobby[0]}`       |
  | `header`           | HTTP 헤더                    | `${header["User-Agent"]}`       |
  | `headerValues`     | 여러 개 헤더 값                  | `${headerValues.accept[0]}`     |
  | `cookie`           | 쿠키 값 접근                    | `${cookie.loginId.value}`       |
  | `initParam`        | web.xml의 `<context-param>` | `${initParam.adminEmail}`       |
  | `pageContext`      | 동일 JSP 내 `pageContext` 객체  | `${pageContext.request.method}` |


 
  
- EL에서 자주 쓰는 기능

  - 값 출력

    ```jsp
    ${user.name}       // user.getName()
    ${product.price}
    ${param.id}        // request.getParameter("id")
    ```

  - null 또는 빈 값 체크 (empty)
    ```jsp
    ${empty param.name} // name 파라미터가 없거나, 빈 값이면 true, 값이 있으면 false

    ${!empty sessionScope.user} // 값이 존재하면 true
    ```

  - 산술 / 논리 연산도 가능
    ```jsp
    ${price * 0.1}          // 10% 계산
    ${age >= 20}            // true / false
    ${score > 90 ? 'A' : 'B'} // 삼항 연산도 가능
    ```

  - 객체와 List/Map도 접근 가능
    ```jsp
    ${user.address.city}   // 객체: user.getAddress().getCity()
    ${list[0].name}        // 리스트: 리스트의 첫번째 객체
    ${map["key"]}          // Map: Map의 value 사용
    ```

- EL은 어디에 가장 많이 쓰일까?

  1. HTML 안에서 데이터 출력할 때

  2. `request`, `session`에 저장된 데이터를 화면에 보여줄 때


## 5. JSP 간단 예제 실습 

- `test.jsp`

  ```jsp
  <%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" import="java.time.LocalTime" %>

  <%-- 
      JSP 선언문 (Declaration)
      - JSP가 서블릿 클래스로 변환될 때 멤버 변수/메소드로 들어감
  --%>
  <%! 
      int visitCount = 0;

      public String greetingMessage(String name) {
          return "Hello, " + name + "!";
      }
  %>

  <%
      // 스크립틀릿 (Scriptlet) — Java 코드 작성 가능
      visitCount++;

      String name = request.getParameter("name");
      if (name == null || name.trim().equals("")) {
          name = "Guest";
      }

      // 현재 시간
      LocalTime time = LocalTime.now();
  %>

  <!DOCTYPE html>
  <html>
  <head>
      <title>JSP 문법 예제</title>
  </head>
  <body>
      <h2>JSP 기본 문법 (JSTL 없이)</h2>

      <p><strong>1. 표현식(Expression):</strong>  
        이름: <%= name %></p>

      <p><strong>2. 선언문 함수 결과:</strong>  
        <%= greetingMessage(name) %></p>

      <p><strong>3. 현재 시간 (import 사용):</strong>  
        <%= time %></p>

      <p><strong>4. 방문 횟수 (전역 변수):</strong>  
        <%= visitCount %> 번째 방문입니다.</p>

      <%-- EL(Expression Language) 사용 --%>
      <p><strong>5. EL 사용:</strong></p>
      <% request.setAttribute("userName", name); %>
      <ul>
          <li>request에 저장된 이름 → ${userName}</li>
          <li>요청 파라미터 name → ${param.name}</li>
          <li>빈 값 또는 null인지 체크 → ${empty param.name}</li>
      </ul>

      <%-- 입력 폼 (name 파라미터 전달용) --%>
      <form method="get" action="test.jsp">
          <input type="text" name="name" placeholder="이름 입력">
          <button type="submit">전송</button>
      </form>
  </body>
  </html>
  ```

## 6. JSTL (JavaServer Pages Standard Tag Library)
> JSTL은 JSP에서 자바 코드(scriptlet)를 쓰지 않고도, 조건문/반복문/출력 등을 처리할 수 있게 해주는 표준 태그 라이브러리입니다.

  1. JSTL을 쓰기 위해 라이브러리 추가 ( `WEB-INF/lib` 디렉터리 에서 다운로드 )

      ```bash
      wget https://repo1.maven.org/maven2/jakarta/servlet/jsp/jstl/jakarta.servlet.jsp.jstl-api/3.0.0/jakarta.servlet.jsp.jstl-api-3.0.0.jar
      ```

      ```bash
      wget https://repo1.maven.org/maven2/org/glassfish/web/jakarta.servlet.jsp.jstl/3.0.0/jakarta.servlet.jsp.jstl-3.0.0.jar
      ```

  2. JSP 상단에 Taglib 선언
      ```jsp
      <%@ taglib prefix="c" uri="jakarta.tags.core" %>
      ```

  3. JSTL 핵심 기능 4가지  
      | 기능  | 태그                                        | 설명               |
      | --- | ----------------------------------------- | ---------------- |
      | 출력  | `<c:out>`                                 | 변수 출력, XSS 방지 지원 |
      | 조건문 | `<c:if>`                                  | if문              |
      | 분기  | `<c:choose>`, `<c:when>`, `<c:otherwise>` | if-else 다중 조건    |
      | 반복문 | `<c:forEach>`                             | for 반복문          |

  4. `/ex/jstl-test.jsp` ( JSTL 사용 예제 )
      ```jsp
      <%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
      <%@ taglib prefix="c" uri="jakarta.tags.core" %>

      <%-- ✨ 컨트롤러 역할 (스클립틀릿 최소화 + EL/JSTL 출력) --%>
      <%
          request.setCharacterEncoding("UTF-8"); // POST 한글 처리

          // 폼 데이터 받기
          String name = request.getParameter("name");
          String color = request.getParameter("color");
          String[] hobbies = request.getParameterValues("hobby");

          // request는 이번 요청에서만 사용
          if (name   != null) request.setAttribute("name",   name);
          if (color  != null) request.setAttribute("color",  color);
          if (hobbies!= null) request.setAttribute("hobbies", hobbies);

          // session은 브라우저 유지되는 동안 저장
          if (name != null && !name.isBlank())   session.setAttribute("sessName", name);
          if (color!= null && !color.isBlank())  session.setAttribute("sessColor", color);
          if (hobbies != null)                  session.setAttribute("sessHobbies", hobbies);
      %>

      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <title>✨ JSTL Profile Demo</title>
          <style>
              body { font-family: 'Segoe UI', sans-serif; margin: 30px; color: #333; }
              .card { border: 1px solid #ccc; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
              .row  { margin-bottom: 10px; }
              .pill { background: #eee; padding: 4px 8px; border-radius: 999px; margin-right: 6px; display: inline-block;}
          </style>
      </head>
      <body>

      <h1>⭐ JSTL Request / Session Demo</h1>
      <p>폼에 값을 입력하면 <b>JSTL + EL</b>만으로 출력됩니다. (스크립틀릿 X)</p>

      <div class="card">
          <form method="post">
              <div class="row">
                  이름: <input type="text" name="name" value="${param.name != null ? param.name : sessionScope.sessName}">
              </div>
              <div class="row">
                  좋아하는 색: <input type="text" name="color" placeholder="blue" value="${param.color != null ? param.color : sessionScope.sessColor}">
              </div>
              <div class="row">
                  취미:
                  <label><input type="checkbox" name="hobby" value="game"> 게임</label>
                  <label><input type="checkbox" name="hobby" value="music"> 음악</label>
                  <label><input type="checkbox" name="hobby" value="movie"> 영화</label>
              </div>
              <button type="submit">저장</button>
          </form>
      </div>

      <c:if test="${not empty name or not empty sessionScope.sessName}">
      <div class="card">
          <h2>✅ 이번 요청(request) 값</h2>
          <p><b>name:</b> ${name}</p>
          <p><b>color:</b> ${color}</p>
          <p><b>hobby:</b>
              <c:choose>
                  <c:when test="${not empty hobbies}">
                      <c:forEach var="h" items="${hobbies}">
                          <span class="pill">${h}</span>
                      </c:forEach>
                  </c:when>
                  <c:otherwise>없음</c:otherwise>
              </c:choose>
          </p>
      </div>

      <div class="card">
          <h2>📌 세션(session) 저장 값</h2>
          <p><b>sessName:</b> ${sessionScope.sessName}</p>
          <p><b>sessColor:</b> ${sessionScope.sessColor}</p>
          <p><b>sessHobby:</b>
              <c:forEach var="h" items="${sessionScope.sessHobbies}">
                  <span class="pill">${h}</span>
              </c:forEach>
          </p>
      </div>
      </c:if>

      </body>
      </html>
      ```

## 🧩 실습 / 과제

1. 예제 폴더에 있는 jsp-info.jsp 를 http://java.localhost/ex/jsp-info.jsp 화면에 출력하고 코드 리뷰 같이 진행