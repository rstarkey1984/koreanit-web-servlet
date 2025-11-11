# 웹 어플리케이션 서버 구성하기 ( Tomcat )

## 📘 학습 개요

서버에서 Tomcat 가 어떤 역할을 하는지 알아본다.

## 💡 주요 내용
- Tomcat 소개 및 설치
---

## 1. Tomcat 이란?

> Tomcat은 Apache Software Foundation에서 만든 **Java 기반의 웹 애플리케이션 서버(Web Application Server, WAS)** 입니다. Servlet, JSP, Spring 같은 Java 기반 웹 애플리케이션을 실행할 수 있도록 도와주는 서버입니다. 정적 파일만 제공하는 웹 서버(Nginx, Apache HTTPD)와 달리, Tomcat은 JSP/Servlet을 처리하고 동적 웹 페이지를 생성하는 역할을 합니다.

## 2. Tomcat 의 역할

| 역할                    | 설명|
| --------------------- | ---------------------------------- |
| **WAS (웹 애플리케이션 서버)** | 단순히 HTML 파일만 서비스하는 것이 아니라, <br>JSP/Servlet 같은 동적 웹페이지를 실행하고 결과를 HTML로 변환해 전송 |
| **Servlet 컨테이너**      | 사용자가 요청한 Servlet/JSP를 실행하고 필요한 객체 생성, 메모리 관리 등을 담당                       |
| **HTTP 서버 기능**        | 기본적으로 웹 서버처럼 80/8080 포트로 클라이언트 요청을 받고 응답 가능                              |
| **SSL/HTTPS 지원**        | 보안 통신을 위한 HTTPS 구성도 가능                   |
| **웹 애플리케이션 배포**         | `WAR 파일` 형태로 Java 웹 애플리케이션을 배포 가능        |
| **Session & Thread 관리** | 사용자별 세션 관리, 요청마다 스레드를 생성해 처리             |

## 3. Tomcat이 필요한 이유

- HTML 파일만 제공하는 Nginx,Apache 같은 웹 서버만으로는 JSP/Servlet 실행 불가능

- Java 기반 웹 애플리케이션은 JVM 환경 + Servlet 처리 엔진이 필요 → Tomcat이 제공

- Spring Boot에서도 내장 Tomcat을 기본적으로 사용

## 4. Ubuntu 24.04에서 Tomcat 설치( apt ):

1. APT 패키지 목록에서 "tomcat"이라는 키워드가 포함된 패키지를 검색
    ```bash
    sudo apt-cache search tomcat
    ```

2. apt 로 톰캣 설치
    ```bash
    sudo apt install -y tomcat10 tomcat10-*
    ```

3. 톰캣 구동중인지 확인
    ```bash
    sudo systemctl status tomcat10
    ```

4. 파일 소유자 변경
    ```bash
    sudo chown <user> /etc/tomcat10/server.xml
    ```
    ```bash
    sudo chown <user> /etc/tomcat10/tomcat-users.xml
    ```

5. Tomcat10 기본 디렉터리 구조 (Ubuntu 24.04, apt 설치 기준)

    | 경로                             | 역할                                                        |
    | ------------------------------ | --------------------------------------------------------- |
    | **/var/lib/tomcat10/webapps/** | 실제 웹 애플리케이션이 배포되는 위치 (WAR 파일 넣는 곳)                      |
    | **/etc/tomcat10/**             | 설정 파일 (`server.xml`, `tomcat-users.xml`, `context.xml` 등) |
    | **/usr/share/tomcat10/**       | Tomcat 실행 스크립트 및 기본 리소스 (웹 루트 아님)                         |
    | **/var/log/tomcat10/**         | Tomcat 로그 파일 위치                                           |
    | **/var/cache/tomcat10/**       | 캐시 파일 저장 위치                                               |


5. 관리자 아이디/패스워드 생성 ( 선택 )
    - `/etc/tomcat10/tomcat-users.xml` 파일에 `<tomcat-users>...</tomcat-users>` 태그 안에 아래 내용을 추가합니다.
        ```xml
        <role rolename="manager-gui"/>
        <role rolename="manager-status"/>
        <role rolename="admin-gui"/>
        <user username="admin" password="1234" roles="manager-gui,manager-status,admin-gui"/>
        ```

        또는,
        ```bash
        sudo sed -i '/<\/tomcat-users>/i\<role rolename="manager-gui"/>\n<role rolename="manager-status"/>\n<role rolename="admin-gui"/>\n<user username="admin" password="1234" roles="manager-gui,manager-status,admin-gui"/>' /etc/tomcat10/tomcat-users.xml
        ```

## 5. 웹 어플리케이션 디렉터리 생성 및 설정 

- Tomcat은 다음과 같은 디렉터리 구조를 가지면 정상적인 Web Application으로 인식합니다:
    ```
    webapp-root/
    ├─ index.html (또는 default 문서)
    └─ WEB-INF/
       ├─ web.xml         ← Web App 설정 (서블릿 매핑 등) 
       ├─ classes/        ← 컴파일된 .class 파일 
       ├─ lib/            ← JDBC, JSTL 등 .jar 라이브러리
       └─ (기타 설정 파일)
    ```

- 각 디렉터리의 역할
    | 디렉터리/파일             | 내용                                    | 접근 가능 여부         |
    | ------------------- | ------------------------------------- | ---------------- |
    | `/` (루트)            | HTML, JSP 등 웹에서 보이는 파일                | ✅ 브라우저에서 접근 가능   |
    | `/WEB-INF/`         | 설정 및 보안 디렉터리                          | ❌ 외부 접근 차단       |
    
    


- 필수 디렉터리 및 파일 생성:
    1. 웹 루트 작업 폴더 생성

        ```bash
        sudo mkdir -p /var/www/<mysubdomain>.localhost
        ```
    2. 권한 변경

        ```bash
        sudo chown <user>:<group> /var/www/<mysubdomain>.localhost
        ```
    3. classes 디렉터리 생성

        ```bash
        mkdir -p /var/www/<mysubdomain>.localhost/WEB-INF/classes
        ```
    4. lib 디렉터리 생성 

        ```bash
        mkdir -p /var/www/<mysubdomain>.localhost/WEB-INF/lib
        ```
    5. src 디렉터리 생성

        ```bash
        mkdir -p /var/www/<mysubdomain>.localhost/WEB-INF/src
        ```
    6. web.xml 파일 생성 
        ```bash
        touch /var/www/<mysubdomain>.localhost/WEB-INF/web.xml
        ```
    7. index.html 파일 생성

        ```bash
        touch /var/www/<mysubdomain>.localhost/index.html  
        ```

- `web.xml` 파일 내용 편집:    
    
    ```xml
    <web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
                            https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
        version="6.0">

    <!-- ====================== 문자 인코딩 필터 등록 ======================= -->
    <!-- 모든 요청/응답에 기본 문자셋(UTF-8)을 적용하여 한글 깨짐 방지 -->
    <filter>
        <!-- 필터의 이름 -->
        <filter-name>addDefaultCharset</filter-name>

        <!-- 실제 필터 클래스 (Tomcat에서 제공하는 기본 필터) -->
        <filter-class>org.apache.catalina.filters.AddDefaultCharsetFilter</filter-class>

        <!-- 초기 설정값: 기본 인코딩을 UTF-8로 정의 -->
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
    </filter>

    <!-- 위 필터를 어떤 요청에 적용할 것인지 설정 -->
    <filter-mapping>
        <!-- 적용할 필터 이름 (위에서 정의한 이름과 동일해야 함) -->
        <filter-name>addDefaultCharset</filter-name>

        <!-- 전체 요청에 적용 (모든 URL에 대해 UTF-8 인코딩 사용) -->
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!-- ===================== 민감 폴더 접근 차단 설정 ===================== -->
    <!-- 웹브라우저로 아래 경로(.vscode, .git, .idea 등)에 직접 접근하지 못하도록 차단 -->
    <security-constraint>
        <web-resource-collection>
            <!-- 이 보안 규칙의 이름(식별용) -->
            <web-resource-name>Block Hidden Configs</web-resource-name>

            <!-- VS Code 설정 폴더 접근 차단 -->
            <url-pattern>/.vscode/*</url-pattern>

            <!-- Git 폴더 내용(URL로 접근 가능하면 민감 정보 노출됨 → 차단) -->
            <url-pattern>/.git/*</url-pattern>

            <!-- IntelliJ IDEA 설정 폴더 차단 -->
            <url-pattern>/.idea/*</url-pattern>
        </web-resource-collection>

        <!-- <auth-constraint />에 값이 없으면, “모든 사용자 접근 불가(403 Forbidden)” 효과 -->
        <!-- 즉, 로그인한 사용자도 해당 경로에는 접근할 수 없음 -->
        <auth-constraint />
    </security-constraint>

    </web-app>
    ```

- Java servlet 프로젝트에 대한 `VSCode` 설정 파일 만들기

    1. .vscode 설정 폴더 생성 
        ```bash
        mkdir -p /var/www/<subdomain>.localhost/.vscode
        ```

    2. .vscode 설정 파일 생성
        ```bash
        touch /var/www/<subdomain>.localhost/.vscode/settings.json
        ```

    3. `settings.json` 내용 입력

        ```json
        {
        "java.project.sourcePaths": [
            "WEB-INF/src"
        ],
        "java.project.referencedLibraries": [
            "WEB-INF/lib/*.jar",
            "/usr/share/tomcat10/lib/servlet-api.jar"
        ],
        "java.project.outputPath": "WEB-INF/classes"
        }
        ```

- Tomcata + Servret 작업 디렉터리 완성된 전체 구조 

    ```
    /var/www/<webapp-root>
                ├── index.html
                └── WEB-INF/
                    ├── web.xml                # Web Application 설정 파일
                    ├── classes/               # 컴파일된 .class 파일 저장
                    ├── lib/                   # 추가 라이브러리(JAR 파일) 저장
                    └── src/                   # (Optional) .java 소스 파일 저장용
    ```


## 6. 가상호스트 설정  

>Tomcat에서 가상호스트(Virtual Host) 구조로 웹 애플리케이션을 운영할 때, `<Host>`
`appBase`, `<Context path=""/>`에 따른 `docBase` 의 역할과 관리 방법을 정확히 이해하면 훨씬 안정적이고 체계적으로 운영할 수 있습니다.

-  `/etc/tomcat10/server.xml`에서 Host 추가 ( 예: `<subdomain>.localhost` 도메인 )
    > `*.localhost` 도메인은 OS(운영체제)와 브라우저가 전부 자동으로 `127.0.0.1`로 처리되고 "내 컴퓨터 자신"을 가리키는 네트워크 주소입니다.

- 아래 내용을 `<Engine>...</Engine>` 안에 추가

    ```xml
    <Host name="<subdomain>.localhost">        
        <Context path="" docBase="/var/www/<subdomain>.localhost" reloadable="true">
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
    </Host>
    ```

    | 항목                | 의미 | 사용 목적     |
    | ----------------- | ------------------ | --- |
    | `<Host` **name**   | 가상호스트 이름    |  HTTP 요청의 Host 헤더값이 이 이름일 때만 이 Host가 사용됨 |
    | `<Host` **appBase**   | 기본 디렉터리 |  Tomcat 이 자동으로 감시·배포하는 내부 관리용 디렉터리. |
    | `<Context` **path**       | `path=""` 만이 정식 루트 컨텍스트로 인식<br>예) path=""<br>예) path="shop"<br>예) path="admin" | 한 서버에 여러 개의 웹앱이 있을 때, 각각을 다른 URL 경로로 접근할 수 있게 해줌.<br>예) http://localhost:8080/ <br>예) http://localhost:8080/shop - 쇼핑몰 서비스 <br> 예) http://localhost:8080/admin - 관리자 페이지 |
    | `<Context` **docBase**       | 실제 파일이 있는 위치 | 작업폴더를 외부 경로나 특정 위치에 둘 때 직접 지정 |

- Tomcat 서버 재시작:
    ```bash
    sudo systemctl restart tomcat
    ```

- 브라우저에서 http://`<subdomain>`.localhost:8081/ 열기
    - 흰색 빈 페이지가 뜨면 정상. 404 에러 페이지가 뜬다면 문제 있음.
    

- `/var/www/<subdomain>.localhost/index.html` 페이지 작성 

    - `index.html` 내용 편집

        ```html
        <!DOCTYPE html> <!-- 브라우저가 최신 웹 표준에 맞춰 작동하도록 사용함 -->
        <html>
        <head> <!-- HTML 문서의 정보를 담는 부분으로, 웹 페이지 자체에 표시되지는 않습니다. -->
            <title>페이지 제목입니다.</title> <!-- 페이지 제목 --> 
            
            <!-- css 태그 -->
            <style> 
                html { color-scheme: light dark; }
                body { width: 35em; margin: 0 auto;
                font-family: Tahoma, Verdana, Arial, sans-serif; }
            </style>

        </head>
        <body>
            <h1>Hello, Tomcat!</h1>
            <p>이 페이지는 Tomcat에서 /var/www/&lt;subdomain&gt;.localhost/index.html 파일을 불러오고 있습니다.</p>
            <p>현재시간 : <span id="date_text"></span><button id="myButton">클릭</button></p>
            
            
            <!-- javascript 태그 -->
            <script> 
                document.getElementById("myButton").addEventListener("click", function() {
                var date_text = new Date().toLocaleString('ko-KR');
                document.getElementById("myButton").innerHTML = date_text;
                });
            </script>

        </body>
        </html>
        ```

    4. 브라우저에서 http://`<subdomain>`.localhost:8081 열기


## 8. Nginx 를 리버스 프록시 서버로 사용하기
> 클라이언트(브라우저)의 요청을 직접 웹 애플리케이션 서버(Spring, Node, Tomcat 등)에 보내는 대신, Nginx가 요청을 먼저 받고 대신 전달해주는 방식입니다.

- 리버스 프록시 서버 사용시 장점
    1. 정적 파일 처리 속도가 매우 빠르다.
    2. 부하 분산 (Load Balancing) - 즉 여러 개의 WAS 서버로 요청을 자동 분배할 수 있음.
    3. HTTPS(SSL) 처리 담당 - 관리하기가 편함.

- Nginx 설정파일 생성 및 권한 변경 후 링크 생성:      

    1. 파일 생성
        ```bash
        sudo touch /etc/nginx/sites-available/java.localhost
        ```

    2. 권한 변경
        ```bash
        sudo chown ubuntu /etc/nginx/sites-available/java.localhost
        ```

    3. 디렉터리 이동
        ```bash
        cd /etc/nginx/sites-enabled/
        ```

    4. 링크파일 상대경로로 생성
        ```bash
        sudo ln -s ../sites-available/java.localhost
        ```

    > `localhost` 도메인은 OS(운영체제)와 브라우저가 전부 자동으로 `127.0.0.1`로 처리되고 "내 컴퓨터 자신"을 가리키는 네트워크 주소입니다.  
    
- `/sites-available/java.localhost` 파일에 아래 내용을 입력:
    ```nginx
    server {
        listen 80;                     # IPv4 기준으로 80번 포트(HTTP 요청)를 수신
        listen [::]:80;                # IPv6 환경에서도 80번 포트 요청을 수신

        server_name java.localhost;    # Host 헤더가 'java.localhost'일 때 이 서버 블록으로 연결

        charset utf-8;                 # 응답에 기본 문자 인코딩을 UTF-8로 설정 (Content-Type 기반)

        location / {                # /api로 시작하는 모든 요청을 처리하는 블록

            proxy_pass http://127.0.0.1:8081/;  # 요청을 내부의 Tomcat 또는 다른 서버(127.0.0.1:8081)로 전달

            # 업스트림 호스트 선택용 (Tomcat 가상호스트 매칭)
            proxy_set_header Host jsp.servlet.localhost;

            # 리다이렉트/링크용
            proxy_set_header X-Forwarded-Host $host;        # java.localhost
            proxy_set_header X-Forwarded-Proto $scheme;     # http 또는 https
            proxy_set_header X-Forwarded-Port $server_port; # 80 또는 443
            
            # 클라이언트 실제 아이피를 톰캣이 받을수 있음
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        }
    }
    ``` 
- 

- `systemctl` 쓸때 앞으로 패스워드 묻지 않도록 설정: ( `<user>` 부분 수정해야됨 )

    ```bash
    echo "<user> ALL=(root) NOPASSWD: /usr/bin/systemctl" | sudo tee /etc/sudoers.d/systemctl-nopasswd
    ```

- Nginx 재시작
    ```bash
    sudo systemctl restart nginx
    ```
    > `systemctl` 는 `systemd` 로 서비스(Tomcat, Nginx 등)를 제어하기 위한 명령어 도구 입니다.

- http://java.localhost 페이지 확인


## 💡 **요약정리**  
> Tomcat 은 Java 기반 웹 애플리케이션을 실행하는 WAS(Web Application Server) 입니다.

> Nginx 를 리버스 프록시로 활용하면 정적파일(html, css, javascript, image 등)은 Nginx 에서 응답하고 데이터 처리가 필요한 경우 /api 경로 등으로 Tomcat 을 활용할수 있습니다.