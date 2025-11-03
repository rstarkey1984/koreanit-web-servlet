# Java Servlet 작동방식


## 📘 학습 개요
Java Servlet 작동 방식을 알아보자.

- `VSCode` 확장 프로그램 설치
  - https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack

## 💡 주요 내용

- Tomcat 에서 Java Servlet 요청 처리 흐름

- 서블릿 매핑(Servlet URL Mapping)

- Java Servlet 페이지 웹 어플리케이션에 배포

--- 


## 1. Tomcat ( Servlet Container ) 에서 Java Servlet 요청 처리 흐름 

> Tomcat(Servlet Container)에서 특히 docBase 기반의 Web Application 구조를 중심으로 정리하면 아래와 같습니다.

- `[tomcat]/conf/server.xml` 파일내용

  ```xml
  <Connector port="8080" protocol="HTTP/1.1" ... />
  ...
  <Host name="jsp.servlet.localhost">            
      <Context path="/" docBase="/var/www/jsp.servlet.localhost" />
  </Host>
  ...
  ```

  | 단계                | 동작 내용                                                |
  | ----------------- | ---------------------------------------------------- |
  | 1️⃣ 클라이언트 요청      | 브라우저에서 `http://jsp.servlet.localhost:8080/hello` 요청        |
  | 2️⃣ Tomcat이 요청 수신 | `server.xml`의 `<Connector>`를 통해 8080 포트를 감시      |
  | 3️⃣ Context 찾기    | URL의 `/` → `/var/www/jsp.servlet.localhost` 프로젝트를 찾음
  | 4️⃣ Servlet 매핑 확인 | `/hello` 요청이 `web.xml` 혹은 `@WebServlet("/hello")`과 연결됨 |
  | 5️⃣ Servlet 실행    | - 최초 요청 시 `init()` 실행 후 메모리 로드                       |
  |                   | - 이후 매 요청마다 `service()` → `doGet()` 또는 `doPost()` 실행 |
  | 6️⃣ 응답 반환         | HTML, JSON 등을 만들어 `HttpServletResponse`로 클라이언트에 보냄   |
  | 7️⃣ 브라우저 출력       | 응답 데이터를 화면으로 렌더링                                     |


## 🧩 Servlet URL 매핑

- web.xml을 이용한 매핑

  ```xml
  <!-- 1. Servlet 이름과 클래스(.class 파일)를 연결하는 설정 -->
  <servlet>
      <!-- 이 서블릿을 구별하기 위한 이름 -->
      <servlet-name>HelloServlet_01</servlet-name>

      <!-- 실제 자바 서블릿 클래스 이름 (패키지가 없다면 클래스 이름만 작성) -->
      <!-- 예: 패키지가 있다면 com.example.HelloServlet_01 처럼 작성 -->
      <servlet-class>HelloServlet_01</servlet-class>
  </servlet>

  <!-- 2. 특정 URL 패턴을 위에서 정의한 서블릿과 연결하는 설정 -->
  <servlet-mapping>
      <!-- 어떤 서블릿과 연결할지 지정 (위에서 선언한 servlet-name과 같아야 함) -->
      <servlet-name>HelloServlet_01</servlet-name>

      <!-- 클라이언트가 이 URL로 요청하면 해당 서블릿이 실행됨 -->
      <!-- 예: http://localhost:8080/프로젝트명/hello_01 -->
      <!-- @Annotation 이랑 경로가 겹치면 web.xml 이 우선적으로 적용됨. -->
      <url-pattern>/hello</url-pattern>
  </servlet-mapping>
  ```

- @WebServlet 어노테이션(Annotation)을 이용한 간편 매핑 (Servlet 3.0 이상, `web.xml` 없이)
  ```java
  @WebServlet("/hello")
  public class HelloServlet extends HttpServlet {
      ...
  }
  ```

## 2. `web.xml`을 이용한 매핑 예제

- `HelloServlet_01.java` 파일 생성:

  ```bash
  touch /var/www/jsp.servlet.localhost/WEB-INF/src/HelloServlet_01.java
  ```

- `VSCode`로 웹 어플리케이션 폴더 열기:

  ```bash
  code /var/www/jsp.servlet.localhost/
  ```

- `/WEB-INF/src/HelloServlet_01.java` 파일내용 입력:
  ```java
  import jakarta.servlet.http.*; // 서블릿 관련 HttpServlet, HttpServletRequest, HttpServletResponse 포함
  import java.io.IOException; // 입출력 작업 중 발생할 수 있는 예외 처리를 위해 필요한 클래스
  import java.io.PrintWriter;

  public class HelloServlet_01 extends HttpServlet {

      // GET 요청이 들어왔을 때 실행되는 메서드 (예: 브라우저 주소창에서 접속했을 때)
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp)
              throws IOException {  // IOException은 클라이언트와의 입출력 과정에서 발생할 수 있는 예외

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
          out.println("<h1>이 페이지는 web.xml에서 매핑되었습니다.</h1>");
          out.println("</body>");
          out.println("</html>");
      }
  }
  ```



- `/WEB-INF/web.xml` 파일 열어서 → `<web-app>...</web-app>` 태그 안에 내용 추가
  ```bash
  code /var/www/jsp.servlet.localhost/WEB-INF/web.xml
  ```
  ```xml
  <!-- 1. Servlet 이름과 클래스(.class 파일)를 연결하는 설정 -->
  <servlet>
      <!-- 이 서블릿을 구별하기 위한 이름 -->
      <servlet-name>첫번째서블릿페이지</servlet-name>

      <!-- 실제 자바 서블릿 클래스 이름 (패키지가 없다면 클래스 이름만 작성) -->
      <!-- 예: 패키지가 있다면 com.example.HelloServlet_01 처럼 작성 -->
      <servlet-class>HelloServlet_01</servlet-class>
  </servlet>

  <!-- 2. 특정 URL 패턴을 위에서 정의한 서블릿과 연결하는 설정 -->
  <servlet-mapping>
      <!-- 어떤 서블릿과 연결할지 지정 (위에서 선언한 servlet-name과 같아야 함) -->
      <servlet-name>첫번째서블릿페이지</servlet-name>

      <!-- 클라이언트가 이 URL로 요청하면 해당 서블릿이 실행됨 -->
      <!-- 예: http://localhost:8080/프로젝트명/hello_01 -->
      <!-- @Annotation 이랑 경로가 겹치면 web.xml 이 우선적으로 적용됨. -->
      <url-pattern>/hello_01</url-pattern>
  </servlet-mapping>
  ```

## 3. @WebServlet 어노테이션(Annotation)을 이용한 간편 매핑 예제

- `HelloServlet2.java` 파일 생성:
  ```bash
  touch /var/www/jsp.servlet.localhost/WEB-INF/src/HelloServlet_02.java
  ```

- `VSCode`로 웹 어플리케이션 폴더 열기:

  ```bash
  code /var/www/jsp.servlet.localhost/
  ```

- `/WEB-INF/src/HelloServlet_02.java` 파일 찾아서 아래 내용 입력:
  ```java
  
  import jakarta.servlet.http.*; // 서블릿 관련 HttpServlet, HttpServletRequest, HttpServletResponse 포함
  import java.io.IOException; // 입출력 작업 중 발생할 수 있는 예외 처리를 위해 필요한 클래스
  import java.io.PrintWriter;
  import jakarta.servlet.annotation.*; // @WebServlet 같은 애노테이션 사용을 위해 필요

  // 이 서블릿을 "/hello_02" URL로 매핑 (브라우저에서 /hello_02 로 요청하면 이 클래스가 실행됨)
  @WebServlet("/hello_02")
  public class HelloServlet_02 extends HttpServlet {

      // GET 요청이 들어왔을 때 실행되는 메서드 (예: 브라우저 주소창에서 접속했을 때)
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp)
              throws IOException {  // IOException은 클라이언트와의 입출력 과정에서 발생할 수 있는 예외

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
          out.println("<h1>이 페이지는 @Annotation으로 매핑되었습니다.</h1>");
          out.println("</body>");
          out.println("</html>");
      }
  }
  ```



## 4. 수동 컴파일 + 웹 어플리케이션 폴더에 직접 배포하기

> Java 소스 파일(.java)을 클래스 파일(.class)로 컴파일하는 과정,
그리고 서블릿 실행을 위해 클래스 파일을 특정 위치(웹 애플리케이션 구조)에 배치하는 과정입니다.

- Javac 명령어로 컴파일 해서 /WEB-INF/classes 폴더에 넣기
  ``` bash
  javac -cp /opt/tomcat/latest/lib/servlet-api.jar: -d /var/www/jsp.servlet.localhost/WEB-INF/classes $(find /var/www/jsp.servlet.localhost/WEB-INF/src/ -name "*.java")
  ```
  | 명령어/옵션                                   | 의미                                           |
  | ---------------------------------------- | -------------------------------------------- |
  | `javac`                                  | 자바 소스 파일(.java)을 컴파일하는 명령어                   |
  | `-cp <경로>`                               | 클래스패스(Classpath). 외부 라이브러리 또는 필요한 클래스 위치를 설정 |
  | `/opt/tomcat/latest/lib/servlet-api.jar` | Tomcat의 Servlet API 라이브러리 (서블릿 개발 시 필수)      |
  | `-d <경로>`                                | 컴파일된 `.class` 파일을 저장할 디렉터리 지정                |
  | `$(find <경로> -name "*.java")`            | 지정된 경로에서 모든 `.java` 파일을 찾아서 컴파일 대상으로 전달      |

- Tomcat 서버 재시작 ( .class 파일이 변경되면 필요 )

  ```bash
  sudo service tomcat restart
  ```

## 5. `VSCode` 에서 빌드 & Tomcat 재시작

1. `VSCode` 전용 빌드/자동화 정의 파일 만들기 ( 아래내용을 복사해서 실행 ):

    ```bash
    mkdir -p /var/www/jsp.servlet.localhost/.vscode && cat << 'EOF' > /var/www/jsp.servlet.localhost/.vscode/tasks.json
    {
      "version": "2.0.0",
      "tasks": [
        {
          "label": "clean & compile",
          "type": "shell",
          "command": "bash",
          "args": [
            "-lc",
            "rm -rf /var/www/jsp.servlet.localhost/WEB-INF/classes && mkdir -p /var/www/jsp.servlet.localhost/WEB-INF/classes && javac -encoding UTF-8 -cp /opt/tomcat/latest/lib/servlet-api.jar:WEB-INF/classes:WEB-INF/lib/* -d /var/www/jsp.servlet.localhost/WEB-INF/classes $(find /var/www/jsp.servlet.localhost/WEB-INF/src/ -name \"*.java\")"
          ],
          "problemMatcher": {
            "owner": "java",
            "fileLocation": [
              "absolute"
            ],
            "pattern": {
              "regexp": "^(.*):(\\d+): (error|warning): (.*)$",
              "file": 1,
              "line": 2,
              "severity": 3,
              "message": 4
            }
          },
          "group": "build"
        },
        {
          "label": "restart tomcat",
          "type": "shell",
          "command": "bash",
          "args": [
            "-lc",
            "sudo systemctl restart tomcat"
          ]
        },
        {
          "label": "servlet build & restart",
          "dependsOn": [
            "clean & compile",
            "restart tomcat"
          ],
          "dependsOrder": "sequence",
          "group": {
            "kind": "build",
            "isDefault": true
          },
          "problemMatcher": []
        }
      ]
    }
    EOF
    ```

2. `VSCode` 에서 파일 내용 확인
    ```bash
    code /var/www/jsp.servlet.localhost/.vscode/tasks.json
    ```

3. `Ctrl` + `Shift` + `P` 를 눌러서 default build task 입력 후 선택

    ![default-build-task](https://lh3.googleusercontent.com/d/1-cQdx3eIBA6iYFcB04xpSbWU0vG15Dfs)

4. servlet build & restart 선택

    ![servlet-build-restart](https://lh3.googleusercontent.com/d/1Gd7LT6216PYWctP5vOqa-QWTuVuUeFCa)

5. `Ctrl` + `Shift` + `B` 를 누르면 빌드가 되고, VSCode 아래쪽 패널 터미널 탭에서 `tasks.json` 파일에서 작성한 스크립트가 실행이 됩니다.

    ![servlet-build-restart](https://lh3.googleusercontent.com/d/1D13-HaqOrBDFz_RXGuqq4_8VslDoVXuT?)

## 6. Tomcat 이 정상적으로 동작하지 않을때 서버 로그 확인
```bash
tail -n 30 -f /opt/tomcat/latest/logs/catalina.out
```

## 🧩 실습 / 과제
- 브라우저에서 `web.xml` 매핑으로 작성된 페이지 호출하기 http://jsp.servlet.localhost:8080/hello_01

- 브라우저에서 `@Annotation` 작성된 페이지 호출하기 http://jsp.servlet.localhost:8080/hello_02
