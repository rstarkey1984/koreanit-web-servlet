# Java Servlet / JSP 소개

## 📘 학습 목표
**Java Servlet과 JSP의 개념, 역할, 동작 방식**을 이해한다.

---

## 💡 주요 내용
- Java Servlet vs JSP 비교
---

## 1. Java Servlet 란?

> **Java로 만든 웹 서버 프로그램입니다**  
> 클라이언트(브라우저)의 요청을 받아 Java 코드로 처리한 후, 결과를 HTML 형태로 응답하는 기술  

- ### 특징
  - `.java`로 작성되어 **순수 Java 코드 중심**
  - **HTTP 요청/응답 처리에 최적화**
  - Controller(로직 처리 역할)에 적합

- ### 예제 – HelloServlet.java
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

- ### 예제 – hello.jsp
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

## 3. Java Servlet VS JSP 단순 비교

| 비교 항목   | Java Servlet (서블릿)         | JSP                    |
|------------|---------------------------|-------------------------|
| 개발 방식   | Java 코드 중심              | HTML 중심 + Java 삽입    |
| 파일 확장자 | `.java`                  | `.jsp`                  |
| 역할        | 비즈니스 로직 처리 | 화면(View) 출력용         |
| 유지보수    | UI 수정 불편                | UI 개발 및 변경이 쉬움     |

---

## 4. Java Servlet VS JSP 실행 구조

| 구분                        | **Servlet 실행 과정**                                          | **JSP 실행 과정**                                         |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| **1. 브라우저 요청**            | 클라이언트가 `.do`, `.servlet` 등 URL로 요청                         | 클라이언트가 `.jsp` 파일로 요청                                  |
| **2. 톰캣이 요청 분석**          | web.xml 또는 @WebServlet을 보고 어떤 Servlet 클래스 호출할지 결정          | 요청받은 JSP 파일을 확인                                       |
| **3. 변환 단계**              | 변환 ❌ 이미 Java (.java) 형태로 작성했음 | JSP → Java Servlet(.java) 파일로 변환됨                     |
| **4. 컴파일 단계**             | 컴파일 ❌ 이미 Java (.class) 형태로 컴파일 했음     | 변환된 .java 파일을 컴파일하여 .class 생성                         |
| **5. 실행 (Servlet 객체 생성)** | Servlet 객체 생성 → init() 실행 → service() 실행 (doGet/doPost 호출) | 변환된 JSP Servlet 객체 생성 → init() → service() 실행         |
| **6. Java 코드 처리**         | doGet/doPost() 안에서 Java 코드로 로직 수행                          | JSP 내부의 스크립틀릿(<% %>) 또는 EL, JSTL이 Java 코드로 이미 변환되어 실행 |
| **7. HTML 응답 생성**         | PrintWriter로 `out.println("<html>...</html>")` 직접 작성       | HTML 그대로 있고 Java가 필요한 부분만 코드로 끼워넣음 (자동 출력)            |
| **8. 브라우저로 응답 반환**        | HTML 문자열 전송                                                | HTML 문자열 전송                                           |


--- 

## 💡 **요약정리**  
> Servlet은 **요청 처리(Controller)**, JSP는 **화면 출력(View)** 역할 담당 

> JSP도 결국 **Servlet으로 변환되어 실행** 됩니다.