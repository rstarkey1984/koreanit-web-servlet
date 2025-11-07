# 웹 서버 구성하기 ( Nginx )


## 📘 학습 개요
서버에서 Nginx 가 어떤 역할을 하는지 알아본다.

## 💡 주요 내용
- Nginx 소개 및 설치
---

## 1. Nginx (엔진엑스)란?
> Nginx는 웹 서버(Web Server)이며, 동시에 리버스 프록시(Reverse Proxy), 로드 밸런서(Load Balancer)로도 사용되는 고성능 서버 소프트웨어입니다.
> 특히 빠른 속도, 많은 트래픽 처리, 낮은 서버 자원 사용량 때문에 전 세계적으로 많이 사용됩니다. (유튜브, 네이버, 카카오, Github 등도 사용)

## 2. Nginx의 주요역할
| 역할                            | 설명                                                  |
| ----------------------------- | --------------------------------------------------- |
| 🌐 **웹 서버(Web Server)**       | 정적 파일(HTML, CSS, JS, 이미지 등)을 빠르게 제공                 |
| 🔀 **리버스 프록시(Reverse Proxy)** | 클라이언트 요청을 백엔드 서버(Tomcat, Node.js 등)로 전달하고 응답을 대신 전달 |
| ⚖️ **로드 밸런서(Load Balancer)**  | 여러 서버로 트래픽을 분산하여 높은 가용성과 성능 보장                      |
| 🛡️ **보안 / SSL 처리**           | HTTPS(SSL/TLS) 인증서 적용 및 보안 연결 처리                    |
| 📁 **캐싱 서버(Cache Server)**    | 자주 요청되는 리소스를 캐싱하여 백엔드 부하 감소 및 속도 향상                 |
| 🪝 **API Gateway 역할**         | API 서버 앞단에서 요청 제어, 라우팅, 인증 등 수행 가능                  |



## 3. 설치하기 - 공식 설치 가이드 https://nginx.org/en/linux_packages.html#Ubuntu

1. Ubuntu 24.04에서 Nginx 설치( apt 사용 ):

   ```bash
   sudo apt update && sudo apt install -y nginx 
   ```

2. Nginx 버전 확인:

   ```bash
   nginx -v
   ```   
   `nginx version: nginx/1.24.0 (Ubuntu)`

3. Nginx 실행중인지 확인:
   ```bash
   sudo systemctl status nginx
   ```
   
4. Nginx가 정상적으로 실행중인지 브라우저를 열어서 확인하기 http://localhost

   ![브라우저-localhost](https://lh3.googleusercontent.com/d/1jPRGPjzYyD39ophbm0eTmILQVi7lzxFt)





## 4. 특정 도메인으로 요청이 들어왔을때 서버 블록 설정 ( 가상 호스트 )

1. `/etc/nginx/sites-available/default` 파일은 Nginx 설치 시 기본으로 생성되는 파일입니다. ( 아래는 필요없는 내용을 제거한 버전 )     
   ```nginx
   server {
      listen 80 default_server; # IPv4에서 포트 80으로 요청을 수신, 기본 서버로 지정
      listen [::]:80 default_server; # IPv6에서 포트 80으로 요청을 수신, 기본 서버로 지정

      root /var/www/html; # 웹 문서의 기본 루트 디렉토리를 /var/www/html로 설정

      index index.html index.htm index.nginx-debian.html; # 기본으로 보여줄 파일들 설정 (순서대로 탐색)

      server_name _; # 특정 도메인을 지정하지 않은 기본 서버(와일드카드 역할)

      location / { # 모든 요청(URL 경로 / 이하)에 대해 설정

         try_files $uri $uri/ =404; # 요청한 경로가 파일이면 파일 전송, 디렉터리면 index 탐색, 없으면 404 반환

      }
   }
   ```   

2. 특정 도메인으로 요청이 들어오면 동작하는 서버 블록 파일 만들기.

   - Nginx 설정파일 생성 후 ubuntu 사용자에게 파일 수정 권한 변경:
      

      ```bash
      sudo touch /etc/nginx/sites-available/<mysubdomain>.localhost
      ```
      - `touch <파일이름>` : 빈 파일을 새로 만드는 데 사용되는 리눅스/유닉스 명령어
      - `<mysubdomain>` : 서브도메인. 예시) subdomain1.localhost, subdomain2.localhost

      ```bash
      sudo chown <user> /etc/nginx/sites-available/<mysubdomain>.localhost
      ```
      - `chown <user>:<group> <파일이름>` : <파일이름> 을 소유자와 그룹 모두 변경

      > `localhost` 도메인은 OS(운영체제)와 브라우저가 전부 자동으로 `127.0.0.1`로 처리되고 "내 컴퓨터 자신"을 가리키는 네트워크 주소입니다.  

   - /etc/nginx/sites-available/`<mysubdomain>`.localhost 파일에 아래 내용을 입력: 
      ```nginx
      server {
         listen 80; # IPv4에서 포트 80으로 요청을 수신
         listen [::]:80; # IPv6에서 포트 80으로 요청을 수신

         server_name <mysubdomain>.localhost; # 요청헤더값의 HOST 정보가 <mysubdomain>.localhost 일때

         charset utf-8; # 클라이언트에 전달되는 콘텐츠의 기본 문자 인코딩을 UTF-8로 설정

         root /var/www/<webroot>; # 웹 문서의 기본 루트 디렉토리를 /var/www/<webroot> 로 설정

         index test.html; # index.html 은 굳이 적지 않아도 nginx가 기본적으로 찾습니다.

         location / { # 모든 요청(URL 경로 / 이하)에 대해 설정

            try_files $uri $uri/ =404; # 요청한 경로가 파일이면 파일 전송, 디렉터리면 index 탐색, 없으면 404 반환

         }
      }
      ``` 
      - `<webroot>` : 웹사이트 루트 디렉터리

   - 실제 동작하는 Nginx 서버에서 참조하는 설정파일 경로는 `/etc/nginx/sites-enabled/` 이므로 링크 파일 생성      
      > /etc/nginx/sites-available와 /etc/nginx/sites-enabled 구조를 사용하는 이유는 여러 도메인/사이트를 운영할 때 유지보수에 용이하기 때문에 Debian 계열 Nginx 배포판의 특징입니다.

      ```bash
      sudo ln -s /etc/nginx/sites-available/<mysubdomain>.localhost /etc/nginx/sites-enabled/
      ```
      - `ln -s [원본 파일/디렉터리] [링크 이름]` : **심볼릭 링크(Symbolic Link, 또는 소프트 링크)** 생성할 때 사용하는 명령어입니다. 윈도우의 **바로가기(Shortcut)** 와 비슷한 개념이라고 보면 이해하기 쉽습니다.

   - ubuntu 사용자는 `systemctl` 쓸때 앞으로 패스워드 묻지 않도록 설정
      ```bash
      echo "ubuntu ALL=NOPASSWD: /usr/bin/systemctl" | sudo tee /etc/sudoers.d/systemctl-nopasswd > /dev/null
      ```

   - Nginx 재시작
      ```bash
      sudo systemctl restart nginx
      ```
      > `systemctl` 는 `systemd` 로 서비스(Tomcat, Nginx 등)를 제어하기 위한 명령어 도구 입니다.


   - 브라우저를 열어서 확인하기 http://nginx.localhost

      ![브라우저-localhost](https://lh3.googleusercontent.com/d/1LfG6MXtdl1w1fyGiRYcHndaAja0NQOFO)

      > `/var/www/<webroot>` 폴더와 `index.html` 파일을 만들지 않았기 때문에, 404 에러가 뜨고 페이지를 불러올 수 없으면 정상입니다.



## 4. 프로젝트 폴더 만들기
1. `/var/www/<webroot>` 폴더 생성 및 권한 변경
   - 디렉터리 생성

      ```bash
      sudo mkdir -p /var/www/<webroot>
      ```
      - `sudo mkdir -p` : 디렉터리 생성 명령어 -> `/var/www/<webroot>` 디렉터리 생성

   - 디렉터리 권한 변경
      ```bash
      sudo chown <user>:<group> /var/www/<webroot>
      ```
      - `chown <user>:<group>` : 소유자와 그룹 모두 변경 -> `/var/www/<webroot>` 권한 변경 

   - 기본 html 파일 만들기
      ```bash
      touch /var/www/<webroot>/test.html
      ```
      - `touch` : 빈 파일을 새로 만드는 명령어 -> `/var/www/<webroot>/test.html` 파일 생성 

2. `/var/www/<webroot>/test.html` 파일에 아래 내용을 저장.
   ``` html
   <!DOCTYPE html> <!-- 브라우저가 최신 웹 표준에 맞춰 작동하도록 사용함 -->
   <html>
   <head> <!-- HTML 문서의 정보를 담는 부분으로, 웹 페이지 자체에 표시되지는 않습니다. -->
      <title>페이지 제목입니다.</title> <!-- 페이지 제목 --> 
      
      <!-- css 태그 -->
      <style> 
         html { color-scheme: light dark; }
         body { width: 60em; margin: 0 auto;
         font-family: Tahoma, Verdana, Arial, sans-serif; }
      </style>

   </head>
   <body>
      <h1>Hello, Nginx!</h1>
      <p>이 페이지는 Nginx에서 /var/www/webroot/test.html 파일을 불러오고 있습니다.</p>
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

3. 브라우저를 열어서 확인하기 http://`<mysubdomain>`.localhost

## 5. wsl ubuntu nginx서버로 외부에서 접속할수 있도록 윈도우에서 설정
- 외부에서 접속 가능하도록 `Powershell`에서 ip 확인
   ```Powershell
   wsl hostname -I
   ```

- 윈도우에서 PowerShell을 관리자 권한으로 실행하여 netsh 명령어를 사용해 포트포워딩을 설정합니다.

   ```Powershell
   netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=<WSL IP>
   ```

- 포트포워딩 내역 조회 
   ```Powershell
   netsh interface portproxy show all
   ```

- 포트포워딩 삭제
   
   ```Powershell
   netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
   ```

- 윈도우 방화벽 설정 ( 외부에서 80번 포트로 접근할 수 있도록 허용 )
   1. "Windows Defender 방화벽"을 검색하여 실행합니다. 
   2. "고급 설정"으로 이동합니다."인바운드 규칙"에서 새 규칙을 추가하거나, 기존 규칙을 수정합니다. 
   3. 프로토콜: TCP, 로컬 포트: 80, 작업: "연결 허용"으로 설정합니다. 
   ![방화벽포트허용](https://lh3.googleusercontent.com/d/1VcQRqXL6HT30JG-MV_Ecp3EXbj6X1aJd)

      또는,

   4. 관리자 권한으로 명령어 입력
   
      - 방화벽 규칙 생성
         ```Powershell
         > netsh advfirewall firewall add rule name="Allow WSL 80" dir=in action=allow protocol=TCP localport=80
         ```
      
      - 방화벽 규칙 삭제
         ```Powershell
         > netsh advfirewall firewall delete rule name="Allow WSL 80"
         ```



## 💡 **요약정리**  
> Nginx 는 정적 파일(HTML, CSS, JS 등)을 빠르게 제공하는 웹 서버(Web Server) 입니다.

## 🧩 실습 / 과제
- 새로운 서브도메인을 만들어서 Nginx에서 정상적으로 응답할수 있도록 Nginx 가상호스트 설정과, Ubuntu 실제 웹루트디렉터리 생성