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


## 4. Ubuntu 24.04에서 Tomcat 설치( apt 사용 ):

1. Tomcat 10.1 버전 다운로드:

    > wget 명령어를 사용하여 Tomcat 10.1.48 버전의 설치 파일(apache-tomcat-10.1.48.tar.gz)을 Apache 공식 서버(dlcdn.apache.org)에서 현재 디렉토리로 다운로드한다.
    ```bash
    cd /tmp && wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.48/bin/apache-tomcat-10.1.48.tar.gz
    ```

2. 압축 해제:

    > 다운로드한 Tomcat 압축 파일(apache-tomcat-10.1.48.tar.gz)을 /opt/tomcat 디렉토리에 풀어준다.
    ```bash
    sudo tar -xzf apache-tomcat-10.1.48.tar.gz -C /opt/tomcat
    ```

3. 심볼릭 링크 생성:
    > Tomcat 설치 경로를 간단히 접근할 수 있도록 /opt/tomcat/apache-tomcat-10.1.48 → /opt/tomcat/latest 로 심볼릭 링크 생성
    ```bash
    sudo ln -s /opt/tomcat/apache-tomcat-10.1.48 /opt/tomcat/latest
    ```

4. 권한 설정 변경:
    ```bash
    sudo chmod -R 755 /opt/tomcat && sudo chmod +x /opt/tomcat/latest/bin/*.sh
    ```

5. Tomcat 서비스 등록 ( `systemd`를 이용하여 부팅 시 자동 실행 )
    > `systemd`는 리눅스에서 서버나 프로그램 같은 서비스를 자동으로 시작·중지하고, 부팅 시 실행되도록 관리해주는 시스템 및 서비스 관리 도구입니다.

    - /etc/systemd/system/tomcat.service 파일 생성:
        ```bash
        sudo bash -c 'cat > /etc/systemd/system/tomcat.service <<"EOF"
        [Unit]
        Description=Apache Tomcat 10 Web Application Container
        After=network.target

        [Service]
        Type=forking
        User=ubuntu
        Group=ubuntu
        Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
        Environment="CATALINA_BASE=/opt/tomcat/latest"
        Environment="CATALINA_HOME=/opt/tomcat/latest"
        Environment="CATALINA_PID=/opt/tomcat/latest/temp/tomcat.pid"
        Environment="CATALINA_OPTS=-Xms512M -Xmx1024M -server -XX:+UseParallelGC"
        ExecStart=/opt/tomcat/latest/bin/startup.sh
        ExecStop=/opt/tomcat/latest/bin/shutdown.sh
        Restart=on-failure

        [Install]
        WantedBy=multi-user.target
        EOF'
        ```

    - 서비스 활성화 & 시작:
        > `systemctl` 는 `systemd`로 서비스(Tomcat, Nginx 등)를 제어하기 위한 명령어 도구 입니다.

        > systemctl이 사용하는 서비스 설정 파일(.service) 변경 사항 반영
        ```bash        
        sudo systemctl daemon-reload        
        ```

        > 부팅 시 Tomcat이 자동으로 실행되도록 설정 (자동 시작 등록)
        ```bash
        sudo systemctl enable tomcat
        ```

        > 지금 즉시 Tomcat 서비스를 시작
        ```bash
        sudo systemctl start tomcat
        ```

        > Tomcat 서비스가 제대로 실행 중인지 상태 확인
        ```bash
        sudo systemctl status tomcat
        ```

    - Tomcat 서버가 정상적으로 실행중인지 브라우저를 열어서 확인하기 http://localhost:8080

    - 관리자 아이디/패스워드 생성
        - `/opt/tomcat/latest/conf/tomcat-users.xml` 파일에 `<tomcat-users>...</tomcat-users>` 태그 안에 아래 내용을 추가합니다.
            ```xml
            <role rolename="manager-gui"/>
            <role rolename="manager-status"/>
            <role rolename="admin-gui"/>
            <user username="admin" password="1234" roles="manager-gui,manager-status,admin-gui"/>
            ```

            또는,
            ```bash
            sudo sed -i '/<\/tomcat-users>/i\<role rolename="manager-gui"/>\n<role rolename="manager-status"/>\n<role rolename="admin-gui"/>\n<user username="admin" password="1234" roles="manager-gui,manager-status,admin-gui"/>' /opt/tomcat/latest/conf/tomcat-users.xml
            ```

        - `/opt/tomcat/latest/conf/tomcat-users.xml` 파일 보기
            ```bash
            code /opt/tomcat/latest/conf/tomcat-users.xml
            ```

## 5. 웹 어플리케이션 디렉터리 생성 및 설정 

- Tomcat은 다음과 같은 디렉터리 구조를 가지면 정상적인 Web Application으로 인식합니다:
    ```
    webapp-root/
    ├─ index.html (또는 default 문서)
    ├─ <기타 HTML/JSP/이미지 파일들>
    ├─ WEB-INF/
    │  ├─ web.xml         ← 웹 애플리케이션 설정 파일 (필수)
    │  ├─ classes/        ← 컴파일된 .class 파일 (Servlet, Filter 등)
    │  ├─ lib/            ← JDBC, JSTL 등 .jar 라이브러리
    │  └─ (기타 설정 파일)
    └─ META-INF/          (선택) 주로 JAR/WAR에서 사용
    ```

- 각 디렉터리의 역할
    | 디렉터리/파일             | 내용                                    | 접근 가능 여부         |
    | ------------------- | ------------------------------------- | ---------------- |
    | `/` (루트)            | HTML, JSP 등 웹에서 보이는 파일                | ✅ 브라우저에서 접근 가능   |
    | `/WEB-INF/`         | 설정 및 보안 디렉터리                          | ❌ 외부 접근 차단       |
    | `/WEB-INF/web.xml`  | Web App 설정 (서블릿 매핑 등)                 | Tomcat이 내부적으로 읽음 |
    | `/WEB-INF/classes/` | 자바 클래스 파일 (`.class`, properties 파일 등) | 클래스 로딩 경로        |
    | `/WEB-INF/lib/`     | `.jar` 라이브러리 저장 위치                    | 자동 classpath 포함  |
    | `/META-INF/`        | 주로 WAR/JAR 용 메타정보 (`MANIFEST.MF`)     | 선택적              |


- 필수 디렉터리 및 파일 생성:
    ```bash
    sudo mkdir -p /var/www/jsp.servlet.localhost && sudo chown ubuntu:ubuntu /var/www/jsp.servlet.localhost && mkdir -p /var/www/jsp.servlet.localhost/WEB-INF/classes && mkdir -p /var/www/jsp.servlet.localhost/WEB-INF/lib && mkdir -p /var/www/jsp.servlet.localhost/WEB-INF/src && touch /var/www/jsp.servlet.localhost/index.html  
    ```

- `web.xml` 파일 생성:    
    ```bash
    cat > /var/www/jsp.servlet.localhost/WEB-INF/web.xml << 'EOF'
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

    EOF
    ```

- Java servlet 프로젝트에 대한 `VSCode` 설정 파일 만들기
    - `.vscode/settings.json` 파일생성:

        ```bash
        mkdir -p /var/www/jsp.servlet.localhost/.vscode && printf '{\n  "java.project.sourcePaths": [\n    "WEB-INF/src"\n  ],\n  "java.project.referencedLibraries": [\n    "/opt/tomcat/latest/lib/servlet-api.jar"\n  ]\n}\n' > /var/www/jsp.servlet.localhost/.vscode/settings.json
        ```

- Tomcat 기본 예제 페이지 복사
    ```bash
    sudo cp -rpf /opt/tomcat/latest/webapps/examples /var/www/jsp.servlet.localhost/test
    ```

- 완성된 전체 구조 (정상 작동하는 형태)

    ```
    /var/www/jsp.servlet.localhost
    ├── index.html
    ├── test/                      # 테스트용 폴더 (원하면 삭제해도 무방)
    └── WEB-INF/
        ├── web.xml                # Web Application 설정 파일
        ├── classes/               # 컴파일된 .class 파일 저장
        ├── lib/                   # 추가 라이브러리(JAR 파일) 저장
        └── src/                   # (Optional) .java 소스 파일 저장용
    ```


## 6. 가상호스트 설정  

>Tomcat에서 가상호스트(Virtual Host) 구조로 웹 애플리케이션을 운영할 때, `<Host>`
`appBase`, `<Context path=""/>`에 따른 `docBase` 의 역할과 관리 방법을 정확히 이해하면 훨씬 안정적이고 체계적으로 운영할 수 있습니다.






-  `server.xml`에서 Host 추가 ( 예: `jsp.servlet.localhost` 도메인 )
    > `*.localhost` 도메인은 OS(운영체제)와 브라우저가 전부 자동으로 `127.0.0.1`로 처리되고 "내 컴퓨터 자신"을 가리키는 네트워크 주소입니다.

- VScode 로 `server.xml` 파일 열기:

    ```bash
    code /opt/tomcat/latest/conf/server.xml
    ```

- 아래 내용을 `<Engine>...</Engine>` 안에 추가

    ```xml
    <Host name="jsp.servlet.localhost" appBase="webapps/jsp.servlet.localhost">
        <Context docBase="/var/www/jsp.servlet.localhost" />
    </Host>
    ```

    | 항목                | 의미 | 사용 목적     |
    | ----------------- | ------------------ | --- |
    | `<host` **name**   | 가상호스트 이름    |  HTTP 요청의 Host 헤더값을 기준으로 어떤 가상호스트로 연결할지 결정한다 |
    | `<host` **appBase**   | 기본 디렉터리 |  Tomcat 이 자동으로 감시·배포하는 내부 관리용 디렉터리. |
    | `<Context` **docBase**       | 실제 파일이 있는 위치 | 작업폴더를 외부 경로나 특정 위치에 둘 때 직접 지정 |

- appBase 폴더 만들기
    ```bash
    mkdir -p /opt/tomcat/latest/webapps/jsp.servlet.localhost
    ```

- Tomcat 서버 재시작:
    ```bash
    sudo systemctl restart tomcat
    ```

- 브라우저에서 http://jsp.servlet.localhost:8080/ 열기
    - 흰색 빈 페이지가 뜨면 정상. 404 에러 페이지가 뜬다면 문제 있음.

- 브라우저에서 http://jsp.servlet.localhost:8080/test/ 열기    

    ![jsp/sevlet 예제 페이지](https://lh3.googleusercontent.com/d/1OP6O2fWPF2kV7NzHTfAMEYs_EdtE-cmk?)


    

- `index.html` 페이지 작성 

    - `VSCode`로 프로젝트 디렉터리 열기 
        ```bash
        code /var/www/jsp.servlet.localhost/
        ```

    - `jsp.servlet.localhost/index.html` 내용 편집

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
            <p>이 페이지는 Tomcat에서 /opt/tomcat/latest/webapps/jsp.servlet.localhost/ROOT/index.html 파일을 불러오고 있습니다.</p>
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

    4. 브라우저에서 http://jsp.servlet.localhost:8080 열기

## 7. Nginx 를 리버스 프록시 서버로 사용하기
> 클라이언트(브라우저)의 요청을 직접 웹 애플리케이션 서버(Spring, Node, Tomcat 등)에 보내는 대신, Nginx가 요청을 먼저 받고 대신 전달해주는 방식입니다.

- 리버스 프록시 서버 사용시 장점
    1. 정적 파일 처리 속도가 매우 빠르다.
    2. 부하 분산 (Load Balancing) - 즉 여러 개의 WAS 서버로 요청을 자동 분배할 수 있음.
    3. HTTPS(SSL) 처리 담당 - 관리하기가 편함.

- Nginx 설정파일 생성 후 ubuntu 사용자에게 파일 수정 권한 변경:
      

    ```bash
    sudo touch /etc/nginx/sites-available/jsp.servlet.localhost && sudo chown ubuntu:ubuntu /etc/nginx/sites-available/jsp.servlet.localhost
    ```

    > `localhost` 도메인은 OS(운영체제)와 브라우저가 전부 자동으로 `127.0.0.1`로 처리되고 "내 컴퓨터 자신"을 가리키는 네트워크 주소입니다.  

- Vscode 에서 생성된 `localhost` 파일 열기:
    
    ```bash
    code /etc/nginx/sites-available/jsp.servlet.localhost
    ```

- `/etc/nginx/sites-available/localhost` 파일에 아래 내용을 입력:
    ```nginx
    server {
        listen 80; # IPv4에서 포트 80으로 요청을 수신
        listen [::]:80; # IPv6에서 포트 80으로 요청을 수신

        server_name jsp.servlet.localhost; # 도메인을 jsp.servlet.localhost 로 지정

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
    sudo ln -s /etc/nginx/sites-available/jsp.servlet.localhost /etc/nginx/sites-enabled/jsp.servlet.localhost
    ```
    > /etc/nginx/sites-available와 /etc/nginx/sites-enabled 구조를 사용하는 이유는 여러 도메인/사이트를 운영할 때 유지보수에 용이하기 때문에 Debian 계열 Nginx 배포판의 특징입니다.

- Nginx 재시작
    ```bash
    sudo systemctl restart nginx
    ```
    > `systemctl` 는 `systemd` 로 서비스(Tomcat, Nginx 등)를 제어하기 위한 명령어 도구 입니다.


## 💡 **요약정리**  
> Tomcat 은 Java 기반 웹 애플리케이션을 실행하는 WAS(Web Application Server) 입니다.

## 🧩 실습 / 과제
- http://jsp.servlet.localhost:8080 접속시 Tomcat에서 정상적으로 응답하는지 확인.

- http://jsp.servlet.localhost 접속시 Tomcat에서 정상적으로 응답하는지 확인 ( Nginx 경유 )
