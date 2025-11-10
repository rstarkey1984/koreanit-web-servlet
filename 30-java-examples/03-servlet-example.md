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

  - `HelloServlet_01.java` 파일
    ```java
    package localhost.myapp.ex;

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
        <servlet-class>java.localhost.ex.HelloServlet_01</servlet-class>
    </servlet>

    <!-- 2. 특정 URL 패턴을 위에서 정의한 서블릿과 연결하는 설정 -->
    <servlet-mapping>
        <!-- 어떤 서블릿과 연결할지 지정 (위에서 선언한 servlet-name과 같아야 함) -->
        <servlet-name>첫번째서블릿이름</servlet-name>

        <!-- 클라이언트가 이 URL로 요청하면 해당 서블릿이 실행됨 -->
        <!-- 예: http://localhost:8080/프로젝트명/hello_01 -->
        <!-- @Annotation 이랑 경로가 겹치면 Tomcat 서버 시작시 에러 -->
        <url-pattern>/ex/hello_01</url-pattern>
    </servlet-mapping>
    ```

  ### 2. @WebServlet 어노테이션(Annotation)을 이용한 간편 매핑 예제

  - `HelloServlet_02.java` 파일

    ```java    
    package localhost.myapp.ex;

    import jakarta.servlet.http.*; // 서블릿 관련 HttpServlet, HttpServletRequest, HttpServletResponse 포함
    import java.io.IOException; // 입출력 작업 중 발생할 수 있는 예외 처리를 위해 필요한 클래스
    import java.io.PrintWriter; // PrintWriter 클래스를 사용하기 위해 java.io 패키지에서 불러옴
    import jakarta.servlet.annotation.*; // @WebServlet 같은 애노테이션 사용을 위해 필요

    // 이 서블릿을 "/ex/hello_02" URL로 매핑 (브라우저에서 /ex/hello_02 로 요청하면 이 클래스가 실행됨)
    @WebServlet("/ex/hello_02")
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

    # 오류나면 멈추고, 없는 변수 쓰면 에러, 파이프 중간 실패도 감지
    set -euo pipefail

    # 프로젝트 경로
    PROJECT_HOME="/var/www/<subdomain>.localhost"

    # 이전 클래스 파일 삭제
    rm -rf "$PROJECT_HOME/WEB-INF/classes"

    # 새 클래스 디렉터리 생성
    mkdir -p "$PROJECT_HOME/WEB-INF/classes"

    # Java 파일 컴파일
    javac -encoding UTF-8 \
      -cp /usr/share/tomcat10/lib/servlet-api.jar:"$PROJECT_HOME/WEB-INF/classes":"$PROJECT_HOME/WEB-INF/lib/*" \
      -d "$PROJECT_HOME/WEB-INF/classes" \
      $(find "$PROJECT_HOME/WEB-INF/src/" -name "*.java")

    # Tomcat 서버 재시작
    sudo systemctl restart tomcat10

    ```

6. 스크립트 실행
    - `/var/www/jsp.servlet.localhost/WEB-INF` 경로에서
    
      ```bash
      ./tomcat_deplay
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

## 5. Tomcat GET 요청 파라미터 한글 깨짐 문제 해결

- Tomcat `server.xml`에서 `<Connector` ... `여기에 아래내용 추가` ... `/>`

  ```xml
  URIEncoding="UTF-8"
  useBodyEncodingForURI="true"
  ```
- 예시
  ```xml
  <Connector port="8081" protocol="HTTP/1.1"
                connectionTimeout="20000"
                redirectPort="8443"
                maxParameterCount="1000"
                URIEncoding="UTF-8"
                useBodyEncodingForURI="true"
                />
  ```

  | 설정                             | 역할                                                    | 기본값        | 꼭 필요한 상황                               |
  | ------------------------------ | ----------------------------------------------------- | ---------- | -------------------------------------- |
  | `URIEncoding="UTF-8"`          | **URL(QueryString, GET 파라미터) 인코딩 방식 지정**              | ISO-8859-1 | **GET 요청에 한글 포함될 때 필수**                |
  | `useBodyEncodingForURI="true"` | `request.setCharacterEncoding()` 설정을 **URL 인코딩에도 적용** | false      | **POST + GET 모두 통일해서 UTF-8 처리하고 싶을 때** |

## 6. Tomcat이 가장 권장하는 “표준적이고 안전한 방식” 으로 `<Context>` 설정하기 
> Context 정의는 server.xml 안에 직접 넣지 말고, 별도 XML 파일(conf/Catalina/[Host]/[Context].xml)에 두는 것을 권장한다. 즉, **ROOT.xml 방식이 Tomcat이 가장 권장하는 “표준적이고 안전한 방식”** 입니다.

- ROOT.xml이 중요한 이유

  | 기능              | 설명                                                |
  | --------------- | ------------------------------------------------- |
  | **기본 웹앱 지정**    | `/` 경로(루트 URL)에 해당하는 애플리케이션을 설정                   |
  | **배포 독립성**      | `server.xml` 수정 없이 앱을 추가/변경 가능                    |
  | **JNDI 리소스 연결** | DB 커넥션풀, 메일 세션 등 자원을 선언                           |
  | **세션 저장소 지정**   | `<Manager pathname="SESSIONS.ser" />` 등 세션 직렬화 설정 |
  | **보안/리로드 설정**   | `<Context reloadable="true" />` 같은 개발 편의 옵션 지정 가능 |


1. 디렉터리 권한 변경 ( 도메인이 다를경우 확인필요 )

    ```bash
    chmod 755 /etc/tomcat10/Catalina/jsp.servlet.localhost
    ```

2. `cd` 로 해당 디렉터리로 이동

    ```bash
    cd /etc/tomcat10/Catalina/jsp.servlet.localhost
    ```

3. touch 로 `ROOT.xml` 파일 생성
    ```bash
    sudo touch ROOT.xml
    ```


4. `ROOT.xml` 파일 소유자 변경
    ```bash
    sudo chown ubuntu:tomcat ROOT.xml
    ```

5. `VSCode` 에서 `ROOT.xml` 열어서 아래 내용 입력 ( `/var/www/jsp.servlet.localhost` 작업 경로가 다르면 수정필요 )
    > Tomcat는 기본적으로 “메모리 세션” 이라서 프로세스를 재시작하면 세션이 사라집니다. 재시작 이후에도 유지하려면 세션을 파일에 저장하거나, 외부 저장소(예: Redis)로 세션을 빼야 합니다.
    ```xml
    <!-- 웹 애플리케이션 설정 -->   
    <Context path="" docBase="/var/www/jsp.servlet.localhost" reloadable="true">
      <!-- path="" : URL 경로 (빈 값이면 docBase 파일위치 루트에서 접근) -->
      <!-- docBase="" : 실제 웹 애플리케이션 파일 위치 -->
      <!-- reloadable="true" : 클래스나 JAR 파일 변경 시 자동으로 애플리케이션 리로드 -->

      <!-- 세션을 파일로 저장하도록 설정하는 부분 (StandardManager 기본값 사용)
      - SESSIONS.ser 파일로 저장됨 
      - Tomcat이 종료될 때 현재 세션 정보를 파일로 저장하고,
      - 다시 시작하면 SESSIONS.ser 파일에서 세션을 복원합니다.
      - kill -9 등 강제 종료 시 저장되지 않음 -->
      <Manager pathname="SESSIONS.ser" />               
    </Context>     
    ```

6. 기존의 `server.xml` 내용 아래처럼 변경 ( 도메인이 다를 경우 확인 )
    ```xml
    <Host name="jsp.servlet.localhost" appBase="webapps/jsp.servlet.localhost" unpackWARs="false" autoDeploy="false"/>
    ```

7. 적용하기 위해 재시작

    ```bash 
    restart-tomcat
    ```

## 🧩 실습 / 과제
1. 예제 폴더에 있는 LifeCycleServlet.java 를 http://java.localhost/ex/life 화면에 출력하기.