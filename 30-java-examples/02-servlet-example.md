# Java Servlet 작동방식


## 📘 학습 개요
Java Servlet 작동 방식을 알아보자.

- `VSCode` 확장 프로그램 설치
  - https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack

## 💡 주요 내용

- Servet 동작 구조 (Request → Response 흐름)

- 서블릿 매핑(Servlet URL Mapping)

- Servlet 웹 서버(Tomcat)에 반영

--- 

## 1. Servet 동작 구조 (Request → Response 흐름)

```
[브라우저] → HTTP 요청 → [Tomcat] → [Servlet 실행] → HTTP 응답 → [브라우저]
```
- `HttpServletRequest` → 요청 정보 (URL, 파라미터, 쿠키 등)
- `HttpServletResponse` → 응답 정보 (HTML 출력, 상태코드 등)

- 실제 코드 예시)

  ```java
  // 클라이언트가 "/hello" 경로로 요청을 보내면 이 서블릿이 실행됨
  @WebServlet("/hello")  
  public class HelloServlet extends HttpServlet {

      // GET 방식 요청이 들어왔을 때 실행되는 메서드 (브라우저에서 URL 입력하면 기본적으로 GET 요청)
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
              throws IOException {
          
          // 응답의 데이터 형식이 HTML이고, 인코딩은 UTF-8이라는 것을 브라우저에 알려줌
          resp.setContentType("text/html; charset=UTF-8");

          // 응답을 클라이언트(브라우저)에게 출력하는 출력 스트림을 가져와서, HTML 태그를 전송
          resp.getWriter().println("<h1>Hello Servlet!</h1>");
      }
  }
  ```

## 2. 🧩 Servlet URL 매핑

- web.xml을 이용한 매핑

  ```xml
  <!-- 1. Servlet 이름과 클래스(.class 파일)를 연결하는 설정 -->
  <servlet>
      <!-- 이 서블릿을 구별하기 위한 이름 -->
      <servlet-name>한글도됩니다</servlet-name>

      <!-- 실제 자바 서블릿 클래스 이름 (패키지가 없다면 클래스 이름만 작성) -->
      <!-- 예: 패키지가 있다면 com.example.HelloServlet_01 처럼 작성 -->
      <servlet-class>HelloServlet_01</servlet-class>
  </servlet>

  <!-- 2. 특정 URL 패턴을 위에서 정의한 서블릿과 연결하는 설정 -->
  <servlet-mapping>
      <!-- 어떤 서블릿과 연결할지 지정 (위에서 선언한 servlet-name과 같아야 함) -->
      <servlet-name>한글도됩니다</servlet-name>

      <!-- 클라이언트가 이 URL로 요청하면 해당 서블릿이 실행됨 -->
      <!-- 예: http://localhost:8080/프로젝트명/hello -->
      <!-- @Annotation 이랑 경로가 겹치면 Tomcat 서버 시작시 에러 -->
      <url-pattern>/hello.do</url-pattern>
  </servlet-mapping>
  ```

- @WebServlet 어노테이션(Annotation)을 이용한 간편 매핑 (Servlet 3.0 이상, `web.xml` 없이)
  ```java
  @WebServlet("/hello.do")
  public class HelloServlet extends HttpServlet {
      ...
  }
  ```


  ### 1. `web.xml`을 이용한 매핑 예제

  - `HelloServlet_01.java` 파일 생성:

    ```bash
    touch /var/www/<subdomain>.localhost/WEB-INF/src/HelloServlet_01.java
    ```

  - `/WEB-INF/src/HelloServlet_01.java` 파일내용 입력:
    ```java
    import jakarta.servlet.http.*; // 서블릿 관련 HttpServlet, HttpServletRequest, HttpServletResponse 포함
    import java.io.IOException; // 입출력 작업 중 발생할 수 있는 예외 처리를 위해 필요한 클래스
    import java.io.PrintWriter; // PrintWriter 클래스를 사용하기 위해 java.io 패키지에서 불러옴

    public class HelloServlet_01 extends HttpServlet {

        // GET 요청이 들어왔을 때 실행되는 메서드 (예: 브라우저 주소창에서 접속했을 때)
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp)
                throws IOException {  // IOException은 클라이언트와의 입출력 과정에서 발생할 수 있는 예외

            // 클라이언트(브라우저)에게 응답 데이터를 출력하기 위한 문자 기반 출력 스트림 가져오기
            // resp.getWriter()는 HTTP 응답(Response)의 본문에 텍스트를 작성할 수 있는 PrintWriter 객체를 반환함
            PrintWriter out = resp.getWriter();

            // 응답 데이터를 HTML 형식으로 설정, 문자 인코딩은 UTF-8로 설정
            resp.setContentType("text/html; charset=UTF-8");

            // 클라이언트(브라우저)에게 HTML 내용 전송
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<meta charset='UTF-8'>");
            out.println("<title>CSS 적용 예제</title>");
            out.println("<style>");
            out.println("html { color-scheme: light dark; }");
            out.println("body { width: 50em; margin: 0 auto;");
            out.println("font-family: Tahoma, Verdana, Arial, sans-serif; }");
            out.println("</style>");
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>안녕, Servlet!</h1>");
            out.println("<h1>이 페이지는 web.xml에서 매핑되었습니다!</h1>");
            out.println("</body>");
            out.println("</html>");
        }
    }
    ```



  - `/WEB-INF/web.xml` 파일 열어서 → `<web-app>...</web-app>` 태그 안에 내용 추가

    ```xml
    <!-- 1. Servlet 이름과 클래스(.class 파일)를 연결하는 설정 -->
    <servlet>
        <!-- 이 서블릿을 구별하기 위한 이름 -->
        <servlet-name>첫번째서블릿이름</servlet-name>

        <!-- 실제 자바 서블릿 클래스 이름 (패키지가 없다면 클래스 이름만 작성) -->
        <!-- 예: 패키지가 있다면 com.example.HelloServlet_01 처럼 작성 -->
        <servlet-class>HelloServlet_01</servlet-class>
    </servlet>

    <!-- 2. 특정 URL 패턴을 위에서 정의한 서블릿과 연결하는 설정 -->
    <servlet-mapping>
        <!-- 어떤 서블릿과 연결할지 지정 (위에서 선언한 servlet-name과 같아야 함) -->
        <servlet-name>첫번째서블릿이름</servlet-name>

        <!-- 클라이언트가 이 URL로 요청하면 해당 서블릿이 실행됨 -->
        <!-- 예: http://localhost:8080/프로젝트명/hello_01 -->
        <!-- @Annotation 이랑 경로가 겹치면 Tomcat 서버 시작시 에러 -->
        <url-pattern>/hello.do</url-pattern>
    </servlet-mapping>
    ```

  ### 2. @WebServlet 어노테이션(Annotation)을 이용한 간편 매핑 예제

  - `HelloServlet2.java` 파일 생성:
    ```bash
    touch /var/www/<subdomain>.localhost/WEB-INF/src/HelloServlet_02.java
    ```  

  - `/WEB-INF/src/HelloServlet_02.java` 파일 찾아서 아래 내용 입력:
    ```java    
    import jakarta.servlet.http.*; // 서블릿 관련 HttpServlet, HttpServletRequest, HttpServletResponse 포함
    import java.io.IOException; // 입출력 작업 중 발생할 수 있는 예외 처리를 위해 필요한 클래스
    import java.io.PrintWriter; // PrintWriter 클래스를 사용하기 위해 java.io 패키지에서 불러옴
    import jakarta.servlet.annotation.*; // @WebServlet 같은 애노테이션 사용을 위해 필요

    // 이 서블릿을 "/hello_02" URL로 매핑 (브라우저에서 /hello_02 로 요청하면 이 클래스가 실행됨)
    @WebServlet("/hello_02")
    public class HelloServlet_02 extends HttpServlet {

        // GET 요청이 들어왔을 때 실행되는 메서드 (예: 브라우저 주소창에서 접속했을 때)
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp)
                throws IOException {  // IOException은 클라이언트와의 입출력 과정에서 발생할 수 있는 예외

            // 클라이언트(브라우저)에게 응답 데이터를 출력하기 위한 문자 기반 출력 스트림 가져오기
            // resp.getWriter()는 HTTP 응답(Response)의 본문에 텍스트를 작성할 수 있는 PrintWriter 객체를 반환함
            PrintWriter out = resp.getWriter();

            // 응답 데이터를 HTML 형식으로 설정, 문자 인코딩은 UTF-8로 설정
            resp.setContentType("text/html; charset=UTF-8");

            // 클라이언트(브라우저)에게 HTML 내용 전송
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<meta charset='UTF-8'>");
            out.println("<title>CSS 적용 예제</title>");
            out.println("<style>");
            out.println("html { color-scheme: light dark; }");
            out.println("body { width: 50em; margin: 0 auto;");
            out.println("font-family: Tahoma, Verdana, Arial, sans-serif; }");
            out.println("</style>");
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>안녕, Servlet!</h1>");
            out.println("<h1>이 페이지는 @Annotation으로 매핑되었습니다!</h1>");
            out.println("</body>");
            out.println("</html>");
        }
    }
    ```

## 3. Servlet 웹 서버(Tomcat)에 반영
> Java 소스 파일(.java)을 클래스 파일(.class)로 컴파일하는 과정, 그리고 서블릿 실행을 위해 클래스 파일을 특정 위치(웹 애플리케이션 구조)에 배치하는 과정입니다.

1. VSCode Remote Explorer 에서 `/var/www/<톰캣작업폴더>` 접속.

2. VSCode 에서 `WEB-INF` 폴더 우클릭 후 `Open in Intergrated Terminal` 클릭.

3. 배포 스크립트 파일 생성
    ```
    touch tomcat_deploy.sh
    ```   

4. 실행권한 주기
    ```
    chmod +x tomcat_deploy.sh
    ```

5. 배포 스크립트 파일 작성
    ```bash
    #!/bin/bash

    # Java 소스 파일을 컴파일하는 명령어
    # -encoding UTF-8      : 소스 파일 인코딩을 UTF-8로 지정
    # -cp                  : 클래스패스(classpath) 설정 (서블릿 API와 라이브러리, 클래스 위치)
    # -d                   : 컴파일된 .class 파일이 저장될 출력 디렉터리 지정
    # $(find ...)          : src 디렉터리에서 모든 .java 파일을 찾아 컴파일 대상으로 전달
    javac -encoding UTF-8 \
      -cp /usr/share/tomcat10/lib/servlet-api.jar:WEB-INF/classes:WEB-INF/lib/* \
      -d /var/www/jsp.servlet.localhost/WEB-INF/classes \
      $(find /var/www/jsp.servlet.localhost/WEB-INF/src/ -name "*.java")

    # Tomcat 서버 재시작
    # 새로운 .class 파일을 반영하기 위해 Tomcat을 다시 시작
    sudo systemctl restart tomcat10
    ```

6. 스크립트 실행
    ```bash
    tomcat_deplay
    ```


## 4. `VSCode` 에서 배포 스크립트 사용하기

1. `VSCode` 전용 빌드/자동화 정의 파일 만들기

    - `.vscode` 로 이동
      ```bash
      cd .vscode
      ```

    - tasks.json 파일 생성
      ```
      touch tasks.json
      ```

    - `/var/www/<subdomain>.localhost/.vscode/tasks.json` 편집
      ```json
      {
        // VS Code Task 설정 파일 버전 (2.0 이후부터는 이 형태 사용)
        "version": "2.0.0",

        "tasks": [
          {
            // VS Code에서 표시되는 작업 이름
            "label": "Deploy to Tomcat",

            // 어떤 방식으로 실행할지 (shell = 터미널에서 쉘 명령 실행)
            "type": "shell",

            // 실행할 실제 명령어 (bash 스크립트 실행)
            "command": "./tomcat_deploy.sh",

            // 명령이 실행되는 작업 디렉터리 설정
            // 즉, 이 경로에서 ./tomcat_deploy.sh가 실행됨
            "options": {
              "cwd": "${workspaceFolder}/WEB-INF/"
            },

            // 이 작업을 빌드 그룹에 포함시키며, 기본 빌드 작업으로 설정
            // → Ctrl + Shift + B 로 실행 가능
            "group": {
              "kind": "build",
              "isDefault": true
            }
          }
        ]
      }
      ```

2. `Ctrl` + `Shift` + `P` 를 눌러서 `default build task` 입력 후 선택

    ![default-build-task](https://lh3.googleusercontent.com/d/1-cQdx3eIBA6iYFcB04xpSbWU0vG15Dfs)

3. servlet build & restart 선택

    ![servlet-build-restart](https://lh3.googleusercontent.com/d/1Gd7LT6216PYWctP5vOqa-QWTuVuUeFCa)

4. `Ctrl` + `Shift` + `B` 를 누르면 빌드가 되고, `VSCode` 아래쪽 패널 터미널 탭에서 `tasks.json` 파일에서 작성한 스크립트가 실행이 됩니다.

    ![servlet-build-restart](https://lh3.googleusercontent.com/d/1Ufm3dTPHp1n-ZomOAYgsNSTH-ZfnZRb8)

  - Tomcat 이 정상적으로 동작하지 않을때 서버 로그 확인

    ```bash
    log-tomcat
    ```

## 5. Tomcat 재시작 시 세션 초기화 문제 
> Tomcat는 기본적으로 “메모리 세션” 이라서 프로세스를 재시작하면 세션이 사라집니다. 재시작 이후에도 유지하려면 세션을 파일에 저장하거나, 외부 저장소(예: Redis)로 세션을 빼야 합니다. 

1. 톰캣의 파일 기반 세션 저장 켜기 - `/etc/tomcat10/server.xml` 파일을 열어서 아래 내용 수정

    - 기존 Context 태그
      ```xml       
      <Context path="" docBase="/var/www/<subdomain>.localhost" />
      ```

    - 수정된 Context 태그
      ```xml       
      <Context path="" docBase="/var/www/<subdomain>.localhost">
          <!--           
          ▼ 세션 저장 설정 (StandardManager 기본값 사용)
          - Tomcat이 종료될 때 현재 세션 정보를 파일로 저장하고,
            다시 시작하면 SESSIONS.ser 파일에서 세션을 복원합니다.
          - kill -9 등 강제 종료 시 저장되지 않음
          -->
          <Manager pathname="SESSIONS.ser" />
      </Context>
      ```

    - `<Manager>` 기본 동작
      ```xml
      <!--
        StandardManager 기본 설정 설명:
        - pathname            : 기본값은 null → 파일 저장 안 함 (값을 주면 SESSIONS.ser로 저장/복원)
        - className           : 기본값 org.apache.catalina.session.StandardManager 
        - maxActiveSessions   : 기본값 -1 → 세션 개수 제한 없음
        - processExpiresFrequency : 기본값 6 → 만료된 세션 정리 작업을 요청 6번마다 수행
        - sessionIdLength     : 기본값 16 → 세션 ID 길이 (byte 단위 → 보통 32자리 문자열)
      -->
      <Manager
          className="org.apache.catalina.session.StandardManager"
          maxActiveSessions="-1"
          processExpiresFrequency="6"
          sessionIdLength="16"
      />
      ```

  2. 적용하기 위해 재시작
      ```
      restart-tomcat
      ```
    

## 🧩 실습 / 과제
1. `log-tomcat` 을 터미널에서 띄워서 로그 확인하기.

2. 예제 폴더에 있는 LifeCycleServlet.java 를 http://java.localhost/ex/life 화면에 출력하고 코드 리뷰 같이 진행