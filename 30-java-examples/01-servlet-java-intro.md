# Java Servlet / JSP 소개

## 📘 학습 목표
**Java Servlet과 JSP의 개념, 역할, 동작 방식**을 이해한다.

---

## 💡 주요 내용
- Java Servlet vs JSP 비교
---

## 1. Java Servlet 란?

> **자바 기반의 서버 프로그램**  
> 클라이언트(브라우저)의 요청을 받아 Java 코드로 처리한 후, 결과를 HTML 형태로 응답하는 기술  

- ### 특징
  - `.java`로 작성되어 **순수 Java 코드 중심**
  - **HTTP 요청/응답 처리에 최적화**
  - Controller(로직 처리 역할)에 적합

- ### 예제 – HelloServlet
  ```java
  public class HelloServlet extends HttpServlet {

      // HTTP GET 요청이 들어왔을 때 호출되는 메서드
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
          // 응답의 콘텐츠 타입을 HTML로 설정하고 문자 인코딩은 UTF-8로 지정
          resp.setContentType("text/html; charset=UTF-8");

          // 클라이언트(브라우저)에게 데이터를 출력하기 위한 출력 스트림 얻기
          PrintWriter out = resp.getWriter();

          // 브라우저에 출력할 HTML 내용 작성
          out.println("<h1>Hello Servlet!</h1>");
      }
  }
  ```

---

## 2. JSP 란?

> **HTML 문서 안에서 Java 코드를 사용할 수 있는 기술**  
> 실제로 실행 시에는 JSP가 Servlet 코드로 변환된 후 실행되며, 주로 View(화면 출력)에 사용된다.  
> JSP는 Servlet의 HTML 출력 코드가 복잡해지는 문제를 개선하기 위해 만들어졌다.

- ### 특징
  - `.jsp` 확장자 사용
  - UI 중심 개발에 적합 (HTML + Java)
  - 화면(View) 영역에서 많이 사용됨

- ### 예제 – Hello JSP
  ```html
  <html>
  <body>
      <h1>Hello JSP!</h1> <!-- 화면에 제목 출력 -->

      <!-- JSP 표현식(Expression): 자바 코드를 실행하고 결과를 바로 출력 -->
      <p>현재 시간: <%= new java.util.Date() %></p> 
  </body>
  </html>
  ```

---

## 3. Java Servlet vs JSP 비교

| 비교 항목   | Java Servlet (서블릿)         | JSP                    |
|------------|---------------------------|-------------------------|
| 개발 방식   | Java 코드 중심              | HTML 중심 + Java 삽입    |
| 파일 확장자 | `.java`                  | `.jsp`                  |
| 역할        | 비즈니스 로직 / Controller | 화면 출력 / View         |
| 최초 실행속도 | 빠름 (Servlet은 처음부터 컴파일되어 있음)            | 최초 실행 시 Servlet으로 변환 후 실행 |
| 유지보수    | UI 수정 불편                | UI 개발 및 변경이 쉬움     |

---

## 4. Java Servlet & JSP 동작 흐름

### ✅ Java Servlet 처리 흐름
```
[브라우저 요청] → [Tomcat 서버] → Servlet 실행 → Java 코드 처리 → HTML 응답 생성 → [브라우저 출력]
```

### ✅ JSP 처리 흐름
```
[브라우저 요청] → [Tomcat 서버] → JSP를 Servlet(.java)으로 변환 → 컴파일(.class) → 실행 → HTML 응답 → [브라우저 출력]
```
> JSP를 Servlet(.java)으로 변환 → 컴파일(.class) 되는 과정을 **JSP Lifecycle**이라고 하며, 단 한 번 변환된 이후에는 재사용된다. 단, JSP 파일을 수정하면 다시 변환된다.

--- 

## 💡 **요약정리**  
> 1. Servlet은 **요청 처리(Controller)**, JSP는 **화면 출력(View)** 역할 담당 
> 2. JSP도 결국 **Servlet으로 변환되어 실행** 됩니다.
