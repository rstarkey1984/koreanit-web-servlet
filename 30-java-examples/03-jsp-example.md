# JSP 작동방식

## 📘 학습 개요
JSP는 작동 방식을 알아보자.

- `VSCode` 확장 프로그램 설치
  - https://marketplace.visualstudio.com/items?itemName=samuel-weinhardt.vscode-jsp-lang


## 💡 주요 내용

- Tomcat 에서 JSP 요청 처리 흐름

- JSP 기초 문법

- JSP 코드 실습

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


## 2. JSP 기초 문법
| 문법                    | 형태                 | 설명                         |
| --------------------- | ------------------ | -------------------------- |
| **지시자 (Directive)**   | `<%@ ... %>`       | JSP 페이지 설정 (import, 인코딩 등) |
| **스크립틀릿 (Scriptlet)** | `<% Java 코드 %>`    | JSP 안에서 일반 Java 코드 작성      |
| **표현식 (Expression)**  | `<%= 값 또는 변수 %>`   | 결과 값을 화면에 출력               |
| **선언문 (Declaration)** | `<%! 변수 또는 메서드 %>` | 전역 변수 및 메서드 선언             |
| **주석 (JSP 주석)**       | `<%-- 주석 --%>`     | 클라이언트에 보이지 않는 주석           |
| **HTML 주석**           | `<!-- 주석 -->`      | HTML 소스에서 보이는 주석           |

## 3. JSP 간단 예제 실습

- `helloJSP.jsp` 파일 생성:

  ```bash
  touch /var/www/jsp.servlet.localhost/helloJSP.jsp  
  ```

- `VSCode`로 파일 열기:

  ```bash
  code /var/www/jsp.servlet.localhost/helloJSP.jsp
  ```

- `helloJSP.jsp` 파일 찾아서 아래 내용 입력:
  ```jsp
  <%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
  <%@ page import="java.util.Date, java.text.SimpleDateFormat, java.util.Random" %>
  <%-- 스크립틀릿: 자바 코드 작성 --%>
  <%
      String name = request.getParameter("name") == null ? "손님" : name;

      Random random = new Random();
      int num = random.nextInt(101); // 0 이상 101 미만 → 0~100    
      
  %>
  <!DOCTYPE html>
  <html>
  <head>
      <title>JSP 예제</title>
      <!-- css 태그 -->
      <style> 
          html { color-scheme: light dark; }
          body { width: 60em; margin: 0 auto;
          font-family: Tahoma, Verdana, Arial, sans-serif; }
      </style>
  </head>
  <body>

      <h2>JSP 기본 문법 예제</h2>

      <p><%= greet(name) %></p>

      <p>현재 시간: <%= new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) %></p>
      <p><%= name %>님의 주사위 값은 : [ <%= num %> ] 입니다. <a href="">새로고침</a></p> 

      <%-- 선언문: 함수 정의 --%>
      <%! 
          public String greet(String user) {
              return "안녕하세요, " + user + "님!";
          }
      %>

      
  </body>
  </html>
  ```
 

## 🧩 실습 / 과제
- 브라우저에서 JSP로 작성된 페이지 호출하기 http://jsp.servlet.localhost/helloJSP.jsp?name=%EC%95%84%EB%AC%B4%EA%B0%9C
