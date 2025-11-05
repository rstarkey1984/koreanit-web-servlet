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
    sudo chown <user>:tomcat /etc/tomcat10/server.xml
    ```
    ```bash
    sudo chown <user>:tomcat /etc/tomcat10/tomcat-users.xml
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

- 완성된 전체 구조 

    ```
    /var/www/<subdomain>.localhost
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
    <Host name="<subdomain>.localhost" appBase="webapps/<subdomain>.localhost">        
        <Context path="" docBase="/var/www/<subdomain>.localhost" />
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

- 브라우저에서 http://`<subdomain>`.localhost:8080/ 열기
    - 흰색 빈 페이지가 뜨면 정상. 404 에러 페이지가 뜬다면 문제 있음.
    

- `http://<subdomain>.localhost:8080/index.html` 페이지 작성 

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
            <p>이 페이지는 Tomcat에서 /var/www/<subdomain>/index.html 파일을 불러오고 있습니다.</p>
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

    4. 브라우저에서 http://<subdomain>.localhost:8080 열기

## 7. Nginx 를 리버스 프록시 서버로 사용하기
> 클라이언트(브라우저)의 요청을 직접 웹 애플리케이션 서버(Spring, Node, Tomcat 등)에 보내는 대신, Nginx가 요청을 먼저 받고 대신 전달해주는 방식입니다.

- 리버스 프록시 서버 사용시 장점
    1. 정적 파일 처리 속도가 매우 빠르다.
    2. 부하 분산 (Load Balancing) - 즉 여러 개의 WAS 서버로 요청을 자동 분배할 수 있음.
    3. HTTPS(SSL) 처리 담당 - 관리하기가 편함.

- Nginx 설정파일 생성 후 ubuntu 사용자에게 파일 수정 권한 변경:
      

    ```bash
    sudo touch /etc/nginx/sites-available/<subdomain>.localhost && sudo chown ubuntu:ubuntu /etc/nginx/sites-available/<subdomain>.localhost
    ```

    > `localhost` 도메인은 OS(운영체제)와 브라우저가 전부 자동으로 `127.0.0.1`로 처리되고 "내 컴퓨터 자신"을 가리키는 네트워크 주소입니다.  

- `VSCode` 로 `Nginx` 설정 디렉터리 열기:
    
    ```bash
    code /etc/nginx/
    ```

- `/sites-available/<subdomain>.localhost` 파일에 아래 내용을 입력:
    ```nginx
    server {
        listen 80; # IPv4에서 포트 80으로 요청을 수신
        listen [::]:80; # IPv6에서 포트 80으로 요청을 수신

        server_name <subdomain>.localhost; # 도메인을 <subdomain>.localhost 로 지정

        charset utf-8; # 클라이언트에 전달되는 콘텐츠의 기본 문자 인코딩을 UTF-8로 설정

        location / {
            proxy_pass http://127.0.0.1:8080;   # Tomcat 서버
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ``` 
- 실제로 nginx 에서 참조하는 설정파일 경로는 `/etc/nginx/sites-enabled/` 이므로 링크 파일 생성      
    ```bash
    sudo ln -s /etc/nginx/sites-available/<subdomain>.localhost /etc/nginx/sites-enabled/
    ```
    > /etc/nginx/sites-available와 /etc/nginx/sites-enabled 구조를 사용하는 이유는 여러 도메인/사이트를 운영할 때 유지보수에 용이하기 때문에 Debian 계열 Nginx 배포판의 특징입니다.

- Nginx 재시작
    ```bash
    sudo systemctl restart nginx
    ```
    > `systemctl` 는 `systemd` 로 서비스(Tomcat, Nginx 등)를 제어하기 위한 명령어 도구 입니다.

- http://<subdomain>.localhost 페이지 확인


## 💡 **요약정리**  
> Tomcat 은 Java 기반 웹 애플리케이션을 실행하는 WAS(Web Application Server) 입니다.

## 🧩 실습 / 과제
- http://java.localhost 접속시 http://<subdomain>.localhost:8080 주소로 요청 되도록 nginx 설정하기