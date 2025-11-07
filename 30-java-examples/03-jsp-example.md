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
| 1️⃣ 클라이언트 요청           | 사용자가 `http://localhost:8080/index.jsp` 요청 |
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

  - JSP 문법

    | 문법           | 정확한 이름                 | 역할                                      |
    | ------------ | ---------------------- | --------------------------------------- |
    | `<%@ ... %>` | **JSP 지시자(Directive)** | JSP 페이지 전체 설정 (page, include, taglib 등) |
    | `<% ... %>`  | **스크립틀릿(Scriptlet)**   | JSP 안에서 Java 코드 실행                      |
    | `<%= ... %>` | **표현식(Expression)**    | Java 변수나 값을 출력                          |
    | `<%! ... %>` | **선언문(Declaration)**   | 변수 또는 메서드를 선언 (전역처럼 사용)                 |

    1. 지시자 예시)
        ```jsp
        <%@ page contentType="text/html; charset=UTF-8" %> // 페이지 설정
        <%@ iclude file="header.jsp" %> // 다른 JSP/HTML 포함하기
        <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %> // JSTL 같은 태그라이브러리 사용 
        ```

    2. 선언문 예시)
        ```jsp
        <%! 
        int count = 0;
            public String greet() {
                return "Hello, JSP!";
            }
        %>
        ```      

## 2. JSP EL(Expression Language) 소개
> EL은 JSP에서 ${} 문법을 사용해 간단히 값을 출력하거나 가져오는 표현식 언어입니다.

- EL 사용 방식
  ```
  <h1>Hello, ${name}</h1>
  ```

- EL로 접근 가능한 기본 객체들
  | 표현                          | 의미                           | 예시          |
  | --------------------------- | ---------------------------- | ----------- |
  | `${param.name}`             | request.getParameter("name") | URL/Form 값  |
  | `${paramValues.hobby}`      | 같은 이름의 여러 파라미터               | checkbox 값들 |
  | `${requestScope.user}`      | request.setAttribute("user") | 요청 범위       |
  | `${sessionScope.user}`      | session.setAttribute("user") | 세션 범위       |
  | `${applicationScope.count}` | application(전역)              | 방문자 수       |
  | `${cookie.user.value}`      | 쿠키 값                         | 저장된 ID 조회   |
  | `${header["User-Agent"]}`   | 요청 헤더                        | 브라우저 정보     |
  
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
  3. `request`, `session`에 저장된 데이터를 화면에 보여줄 때

- 예제 (간단 JSP)

  ```jsp
  <%@ page contentType="text/html; charset=UTF-8" %>
  <%
      request.setAttribute("name", "홍길동");
      session.setAttribute("age", 25);
  %>
  <!DOCTYPE html>
  <html>
  <body>
      <p>이름: ${requestScope.name}</p>
      <p>나이: ${sessionScope.age}</p>

      <c:if test="${sessionScope.age >= 20}">
          <p>성인입니다.</p>
      </c:if>
  </body>
  </html>

## 3. JSP 에서 자동으로 import 하는 것들
  | 객체 이름         | 타입                    | 설명                                |
  | ------------- | --------------------- | --------------------------------- |
  | `request`     | `HttpServletRequest`  | 클라이언트 요청 정보                       |
  | `response`    | `HttpServletResponse` | 응답 정보                             |
  | `session`     | `HttpSession`         | 사용자 세션                            |
  | `application` | `ServletContext`      | 웹 애플리케이션 전체 범위                    |
  | `out`         | `JspWriter`           | HTML 출력 스트림                       |
  | `pageContext` | `PageContext`         | JSP 전체 정보 담음                      |
  | `config`      | `ServletConfig`       | 서블릿 설정 정보                         |
  | `page`        | `Object`              | 현재 JSP 자신                         |
  | `exception`   | `Throwable`           | 에러 발생 시 사용 (`errorPage`에서만 사용 가능) |


## 4. JSP 간단 예제 실습 

- `hello.jsp` 파일을 만들어서 아래 내용 입력.

  ```jsp
  <%@ page contentType="text/html; charset=UTF-8" language="java" %>
  <%  
      // ================================  
      // 🟡 Scriptlet 영역 (JSP 내 Java 코드 실행 영역)  
      // ================================

      // request 객체로부터 "name"이라는 파라미터 값을 가져옴 (?name=값)
      String name = request.getParameter("name");

      // name 값이 없거나 공백이면 기본값 "손님"으로 설정
      if (name == null || name.trim().equals("")) {
          name = "손님";
      }
  %>

  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Hello JSP</title>
  </head>
  <body style="text-align:center;">

      <!-- JSP 표현식(Expression): <%= %>를 사용하여 변수 값 출력 -->
      <h1>Hello, <%= name %> 님!</h1>

      <!-- 사용자에게 이름을 입력받는 HTML 폼 -->
      <!-- GET 방식으로 요청하면 URL에 ?name=입력값 형태로 전달됨 -->
      <form method="get">
          <input type="text" name="name" placeholder="이름을 입력하세요">
          <button type="submit">전송</button>
      </form>

  </body>
  </html>
  ```

## 5. JSTL (JavaServer Pages Standard Tag Library)
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

  4. JSTL 예제 ( 예제/jstl-test.jsp )
      

## 🧩 실습 / 과제

1. 예제 폴더에 있는 jsp-info.jsp 를 http://java.localhost/ex/jsp-info.jsp 화면에 출력하고 코드 리뷰 같이 진행

2. 예제 폴더에 있는 jstl-test.jsp 를 http://java.localhost/ex/jstl-test.jsp 화면에 출력하고 코드 리뷰 같이 진행 