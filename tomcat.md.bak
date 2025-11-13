## 4. Ubuntu 24.04에서 Tomcat 설치( 직접 설치 ):

1. Tomcat 10.1 버전 다운로드:

    > wget 명령어를 사용하여 Tomcat 10.1.48 버전의 설치 파일(apache-tomcat-10.1.48.tar.gz)을 Apache 공식 서버(dlcdn.apache.org)에서 현재 디렉토리로 다운로드한다.
    ```bash
    cd /tmp && wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.48/bin/apache-tomcat-10.1.48.tar.gz
    ```
    - `cd /tmp` : 디렉터리(임시 저장소)로 이동. 설치 파일 등 임시 다운로드에 자주 사용됨
    - `&&` : 앞 명령어가 성공하면 계속해서 다음 명령어 실행
    - `wget <url>` : `<url>` 주소에 있는 파일 다운로드

2. 압축 해제:

    > 다운로드한 Tomcat 압축 파일(apache-tomcat-10.1.48.tar.gz)을 /opt/tomcat 디렉토리에 풀어준다.

    1. /opt/tomcat 디렉터리를 관리자 권한(sudo)으로 생성
        ```bash
        sudo mkdir -p /opt/tomcat
        ```
        - `-p` : 상위 폴더가 없으면 함께 생성, 이미 존재하면 오류 없이 넘어감

    2. Tomcat 압축 파일(.tar.gz)을 /opt/tomcat 경로에 풀기
        ```bash
        sudo tar -xzf apache-tomcat-10.1.48.tar.gz -C /opt/tomcat
        ```
        - `tar` : 압축 파일(.tar.gz) 푸는 명령어
        - `-x` : 압축 해제 (extract)
        - `-z` : gzip 형식 압축 해제
        - `-f` : 파일 이름 지정
        - `-C` : 지정한 디렉토리로 압축 풀기 (Change directory)

3. 심볼릭 링크 생성:

    - Tomcat 설치 경로를 간단히 접근할 수 있도록 /opt/tomcat/apache-tomcat-10.1.48 → /opt/tomcat/latest 로 심볼릭 링크 생성

        ```bash
        sudo ln -s /opt/tomcat/apache-tomcat-10.1.48 /opt/tomcat/latest
        ```
        - `ln -s <파일위치> <바로가기>` : 심볼릭 링크(symbolic link) 생성 (바로가기 또는 별칭처럼 연결)

4. 권한 설정 변경:

    1. `/opt/tomcat` 권한 설정

        ```bash
        sudo chmod -R 755 /opt/tomcat
        ```
        - `chmod` : 파일 또는 디렉터리의 권한(permission)을 변경하는 명령어
        - `-R` : 지정한 디렉터리와 아래의 모든 파일/폴더에 적용
        - `755` : 권한 설정 값 (소유자: 읽기/쓰기/실행, 그룹 및 다른 사용자: 읽기/실행만 가능)
        - `/opt/tomcat` : 권한을 변경할 대상 디렉터리

    2. `/opt/tomcat` 소유자:그룹 변경
        ```bash
        sudo chown <user>:<group> -R /opt/tomcat
        ```
        - `chown` : 파일 또는 디렉터리의 소유자(owner)와 그룹(group)을 변경하는 명령
        - `<user>` : 새로 지정할 사용자 계정 이름 (예: ubuntu)
        - `<group>` : 새로 지정할 그룹 이름 (예: ubuntu)
        - `-R` : 지정한 디렉터리와 아래의 모든 파일/폴더에 적용
        - `/opt/tomcat` : 소유권을 변경할 대상 디렉터리

    3. /opt/tomcat/latest/bin/*.sh 파일을 실행권한 변경
        ```bash
        chmod +x /opt/tomcat/latest/bin/*.sh
        ```
        - `chmod` : 파일 또는 디렉터리의 권한(permission)을 변경하는 명령어
        - `+x` : 실행 권한(execute permission)을 추가
        - `/opt/tomcat/latest/bin/*.sh` : Tomcat의 bin 디렉터리에 있는 모든 .sh(쉘 스크립트) 파일에 적용

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
        User=<user>
        Group=<group>
        Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
        Environment="CATALINA_BASE=/opt/tomcat/latest"
        Environment="CATALINA_HOME=/opt/tomcat/latest"
        Environment="CATALINA_PID=/opt/tomcat/latest/temp/tomcat.pid"
        Environment="CATALINA_OPTS=-Xms512M -Xmx1024M -server -XX:+UseParallelGC"
        ExecStart=/opt/tomcat/latest/bin/startup.sh
        ExecStop=/opt/tomcat/latest/bin/shutdown.sh
        Restart=no

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

    - 관리자 아이디/패스워드 생성 ( 선택 )
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