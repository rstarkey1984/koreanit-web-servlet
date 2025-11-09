# Ubuntu PATH(환경변수)의 역할 그리고 alias(별칭) 등록

## 📘 학습 개요

Ubuntu PATH(환경변수)의 역할을 알아보고 alias(별칭) 등록을 해보자.

## 💡 주요 내용
- Ubuntu PATH(환경변수)의 역할
- alias(별칭) 등록
---

## 1. PATH(환경변수)

- Ubuntu 사용자 로그인 시 자동으로 실행되는 파일

    ```
    ~/.profile ( bash가 로그인으로 실행됐을때 )
            └─ ~/.bashrc ( 배쉬가 비로그인으로 실행됐을때 )
                    └─ ~/.bash_aliases 
    ```

1. PATH란?
    > PATH란, 운영체제(특히 Unix/Linux의 쉘 환경)에서 명령어를 실행할 때 “어떤 디렉터리들에서 실행 파일을 찾을지” 지정해 놓은 환경 변수입니다.
    ```bash
    echo $PATH

    /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/wsl/lib:/snap/bin
    ```

    | 항목    | 설명                                                                   |
    | ----- | -------------------------------------------------------------------- |
    | 정식 이름 | 환경변수(Environment Variable)                                           |
    | 역할    | 명령어를 실행할 때, **어떤 디렉터리에서 실행 파일을 검색할지** 지정                             |
    | 형태    | 콜론(`:`)으로 구분된 디렉터리들의 목록                                              |
    | 위치    | 쉘 내부에서 관리되며, 주로 `~/.bashrc` 파일에서 설정 추가함 |
    > 터미널에서 `ls`, `cat`, `chown`, `java` 같은 명령어를 입력하면, `PATH` 경로들을 앞에서부터 차례대로 검색해서 해당 실행 파일을 찾습니다.
    

2. 실행파일 위치 찾기
    > type -a는 **명령어가 어디에서 실행되는지** 를 모두 보여주는 명령입니다. 즉, 사용자가 입력한 명령어가 alias인지, 쉘 내장 명령인지, 또는 실제 실행 파일인지까지 전부 확인할 수 있게 해줍니다.
    
    ```bash
    type -a ls
    ```
    ```bash
    type -a cd
    ```
    ```bash
    type -a cat
    ```
    ```bash
    type -a chown
    ```
    ```bash
    type -a java
    ``` 

3. 특정 디렉터리 PATH 추가 및 `Bash` 스크립트 만들기
    > `Bash` 스크립트란 **bash 전용 문법(#!/bin/bash, [[ ]], 배열 등)** 을 사용하는 셸 스크립트

    - `~/mybin` 디렉터리 생성
        ```bash
        mkdir -p ~/mybin
        ```
    - 파일 생성
        ```bash
        touch ~/mybin/my_first_bash_script
        ```    
    - 파일 실행권한 추가
        ```bash
        chmod +x ~/mybin/my_first_bash_script
        ```
    - `~/mybin/hello` 파일 편집
        ```bash
        #!/bin/bash

        # 사용 가능한 인삿말 배열
        GREETINGS=("Hello" "안녕하세요" "Yo!" "Hola!" "こんにちは" "Bonjour!" "Sup?" "반갑습니다!")

        # 랜덤 인삿말 선택
        RANDOM_GREET=${GREETINGS[$RANDOM % ${#GREETINGS[@]}]}

        # ASCII Art
        cat << "EOF"
        _   _      _ _       
        | | | | ___| | | ___  
        | |_| |/ _ \ | |/ _ \ 
        |  _  |  __/ | | (_) |
        |_| |_|\___|_|_|\___/ 
        EOF

        # 출력 메시지
        echo ""
        echo "🌍  $RANDOM_GREET, $USER!"
        echo "📍  현재 위치: $(pwd)"
        echo "⏰  지금 시간: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        ```

    - 실행확인
        ```bash
        ~/mybin/my_first_bash_script
        ```

    - `~/.bashrc` 파일을 열어서 제일 아래로 내려보면, `cd ~` 있으면 삭제. 그리고 `export PATH="$PATH:/home/ubuntu/mybin"` 추가
        > 아래 내용이 있으면 지워야됨. ( 지난 시간에 `echo 'cd ~' >> ~/.bashrc` 명령어로 추가됐던 내용 )
        ```bash
        cd ~ 
        ```

        > `export` 는 현재 셸에 있는 변수를 환경 변수로 등록해서, 다른 프로그램이나 하위 쉘(bash)에서도 사용할 수 있게 만드는 명령어
        ```bash
        # 기존 PATH 환경변수에 /home/ubuntu/mybin 경로를 추가한다.
        # 이렇게 하면 /home/ubuntu/mybin 안에 있는 실행 파일들을 터미널 어디에서나 명령어처럼 실행할 수 있다.
        export PATH="$PATH:/home/ubuntu/mybin"
        ```
        

    - `~/.bashrc` 파일 적용:
        > `source` 명령어는 현재 쉘에서 파일의 내용을 그대로 실행하는 명령입니다.
        ```bash
        source ~/.bashrc
        ```

    - `my_first_bash_script` 실행:
        ```bash
        my_first_bash_script
        ```


## 2. alias(별칭) 등록

> **alias** 는 긴 명령어를 짧게 쓰거나, 자주 쓰는 명령을 편하게 만들기 위해 사용됩니다.

1. ~/.bash_aliases 파일 생성
    ```bash
    touch ~/.bash_aliases
    ```

2. `~/.bash_aliases` 파일에 아래 내용 추가해서 저장. ( 로그인할때마다 실행됨 )
    > 
    
    ```bash
    # ── NGINX 관련 alias ────────────────────────────────────────────────
    alias status-nginx='sudo systemctl status nginx'
    # nginx 서비스의 현재 상태 확인 (활성/중지/에러 등)

    alias restart-nginx='sudo systemctl restart nginx && sudo systemctl is-active nginx'
    # nginx 서비스를 재시작하고, 재시작 후 active 상태인지 바로 확인

    alias log-nginx='tail -f /var/log/nginx/error.log'
    # nginx 에러 로그 실시간 확인 (error.log 파일 tail 모드)

    # ── TOMCAT 관련 alias ───────────────────────────────────────────────
    alias status-tomcat='sudo systemctl status tomcat10'
    # Tomcat 10 서비스 상태 확인

    alias restart-tomcat='sudo systemctl restart tomcat10 && sudo systemctl is-active tomcat10'
    # Tomcat10 재시작 후 서비스가 active 상태인지 확인

    alias log-tomcat='tail -f /var/log/tomcat10/catalina.out'
    # Tomcat catalina.out 로그를 실시간으로 모니터링
    ```

3. `~/.bashrc` 파일 적용
    ```
    source ~/.bash_aliases
    ```
    > `source` 명령어는 현재 쉘에서 파일의 내용을 그대로 실행하는 명령입니다.
4. 현재 쉘에 등록된 모든 alias 목록
    ```
    alias
    ```
    > `source` 명령어는 파일 안에 있는 명령어들을 현재 쉘에서 실행하는 명령어


## 💡 **요약정리**  
> `PATH`란, 운영체제(특히 Unix/Linux의 쉘 환경)에서 명령어를 실행할 때 “어떤 디렉터리들에서 실행 파일을 찾을지” 지정해 놓은 환경 변수입니다.